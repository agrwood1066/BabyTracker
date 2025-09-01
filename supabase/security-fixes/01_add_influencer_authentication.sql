-- ============================================
-- INFLUENCER AUTHENTICATION & SECURITY FIX
-- ============================================
-- This migration adds authentication requirements for influencer dashboards
-- and links promo codes to user accounts via email

-- Step 1: Add influencer_user_id to promo_codes table
-- This links the promo code to the influencer's user account
ALTER TABLE promo_codes 
ADD COLUMN IF NOT EXISTS influencer_user_id UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS claimed_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS verification_token TEXT UNIQUE;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_promo_codes_influencer_user_id ON promo_codes(influencer_user_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_email ON promo_codes(influencer_email);

-- Step 2: Add influencer role to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_influencer BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS influencer_verified_at TIMESTAMP WITH TIME ZONE;

-- Step 3: Function to claim a promo code after signup
CREATE OR REPLACE FUNCTION claim_influencer_code(
    p_user_id UUID,
    p_user_email TEXT,
    p_code TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
    v_profile RECORD;
BEGIN
    -- Get user profile
    SELECT * INTO v_profile FROM profiles WHERE id = p_user_id;
    
    IF v_profile IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User profile not found'
        );
    END IF;
    
    -- Find promo code by code and email
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND LOWER(influencer_email) = LOWER(p_user_email)
    AND active = true;
    
    IF v_promo IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'No matching promo code found for your email'
        );
    END IF;
    
    -- Check if already claimed
    IF v_promo.influencer_user_id IS NOT NULL THEN
        IF v_promo.influencer_user_id = p_user_id THEN
            RETURN jsonb_build_object(
                'success', true,
                'message', 'You have already claimed this code',
                'code', v_promo.code
            );
        ELSE
            RETURN jsonb_build_object(
                'success', false,
                'error', 'This promo code has already been claimed by another user'
            );
        END IF;
    END IF;
    
    -- Claim the promo code
    UPDATE promo_codes
    SET 
        influencer_user_id = p_user_id,
        claimed_at = NOW()
    WHERE id = v_promo.id;
    
    -- Mark user as influencer
    UPDATE profiles
    SET 
        is_influencer = true,
        influencer_verified_at = NOW()
    WHERE id = p_user_id;
    
    -- Grant the influencer premium features based on their tier
    IF v_promo.tier = 'micro' THEN
        -- 6 months free premium
        UPDATE profiles
        SET 
            subscription_status = 'active',
            subscription_plan = 'premium_monthly',
            subscription_expires_at = NOW() + INTERVAL '6 months',
            admin_notes = 'Influencer tier: micro - 6 months free'
        WHERE id = p_user_id;
    ELSIF v_promo.tier = 'mid' THEN
        -- 12 months free premium
        UPDATE profiles
        SET 
            subscription_status = 'active',
            subscription_plan = 'premium_monthly',
            subscription_expires_at = NOW() + INTERVAL '12 months',
            admin_notes = 'Influencer tier: mid - 12 months free'
        WHERE id = p_user_id;
    ELSIF v_promo.tier = 'major' THEN
        -- Lifetime premium
        UPDATE profiles
        SET 
            subscription_status = 'lifetime_admin',
            subscription_plan = 'premium_monthly',
            admin_notes = 'Influencer tier: major - lifetime access'
        WHERE id = p_user_id;
    END IF;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Promo code successfully claimed!',
        'code', v_promo.code,
        'tier', v_promo.tier,
        'influencer_name', v_promo.influencer_name
    );
END;
$$;

-- Step 4: Update the influencer stats function to require authentication
CREATE OR REPLACE FUNCTION get_influencer_stats_secure(p_user_id UUID, p_code TEXT)
RETURNS TABLE (
    total_signups BIGINT,
    active_trials BIGINT,
    paid_conversions BIGINT,
    conversion_rate NUMERIC,
    pending_commission NUMERIC,
    paid_commission NUMERIC,
    monthly_revenue NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
BEGIN
    -- Verify the user owns this promo code
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND influencer_user_id = p_user_id;
    
    IF v_promo IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: You do not have access to this promo code';
    END IF;
    
    -- Return the stats (same as before but now secure)
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT pcu.user_id)::BIGINT as total_signups,
        COUNT(DISTINCT CASE 
            WHEN p.subscription_status = 'trial' 
            AND p.trial_ends_at > NOW() 
            THEN pcu.user_id 
        END)::BIGINT as active_trials,
        COUNT(DISTINCT CASE 
            WHEN p.subscription_status = 'active' 
            THEN pcu.user_id 
        END)::BIGINT as paid_conversions,
        ROUND(
            COALESCE(
                COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pcu.user_id END)::numeric / 
                NULLIF(COUNT(DISTINCT pcu.user_id), 0) * 100, 
                0
            ), 
            1
        ) as conversion_rate,
        COALESCE(SUM(
            CASE WHEN ic.paid = false THEN ic.amount ELSE 0 END
        ), 0) as pending_commission,
        COALESCE(SUM(
            CASE WHEN ic.paid = true THEN ic.amount ELSE 0 END
        ), 0) as paid_commission,
        COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pcu.user_id END)::numeric * 
        COALESCE(
            (SELECT locked_in_price FROM profiles WHERE id = pcu.user_id AND locked_in_price IS NOT NULL LIMIT 1),
            6.99
        ) as monthly_revenue
    FROM promo_codes pc
    LEFT JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
    LEFT JOIN profiles p ON pcu.user_id = p.id
    LEFT JOIN influencer_commissions ic ON ic.influencer_code = pc.code AND ic.user_id = pcu.user_id
    WHERE pc.code = p_code
    GROUP BY pc.code;
END;
$$;

-- Step 5: Secure journey function
CREATE OR REPLACE FUNCTION get_influencer_journey_secure(p_user_id UUID, p_code TEXT)
RETURNS TABLE (
    anonymous_user_id TEXT,
    signup_date DATE,
    current_status TEXT,
    plan_type TEXT,
    commission_status TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
BEGIN
    -- Verify the user owns this promo code
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND influencer_user_id = p_user_id;
    
    IF v_promo IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: You do not have access to this promo code';
    END IF;
    
    RETURN QUERY
    SELECT 
        -- Improved anonymization using hash
        'User #' || SUBSTRING(MD5(pcu.user_id::text), 1, 6) as anonymous_user_id,
        DATE(pcu.applied_at) as signup_date,
        CASE 
            WHEN p.subscription_status = 'trial' THEN 'In Trial'
            WHEN p.subscription_status = 'active' THEN 'Paid Customer'
            WHEN p.subscription_status = 'expired' THEN 'Cancelled'
            ELSE 'Free User'
        END as current_status,
        CASE 
            WHEN p.subscription_plan = 'premium_monthly' THEN 'Monthly'
            WHEN p.subscription_plan = 'premium_annual' THEN 'Annual'
            ELSE NULL
        END as plan_type,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM influencer_commissions ic 
                WHERE ic.user_id = pcu.user_id 
                AND ic.milestone = '3_months'
                AND ic.paid = true
            ) THEN '3-month commission paid'
            WHEN EXISTS (
                SELECT 1 FROM influencer_commissions ic 
                WHERE ic.user_id = pcu.user_id 
                AND ic.milestone = '3_months'
            ) THEN '3-month milestone reached'
            ELSE 'Pending'
        END as commission_status
    FROM promo_codes pc
    JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
    LEFT JOIN profiles p ON pcu.user_id = p.id
    WHERE pc.code = p_code
    AND pcu.applied_at > NOW() - INTERVAL '90 days'
    ORDER BY pcu.applied_at DESC;
END;
$$;

-- Step 6: Secure weekly stats function
CREATE OR REPLACE FUNCTION get_influencer_weekly_stats_secure(p_user_id UUID, p_code TEXT)
RETURNS TABLE (
    week_num INTEGER,
    week_start DATE,
    signups INTEGER,
    conversions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
BEGIN
    -- Verify the user owns this promo code
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND influencer_user_id = p_user_id;
    
    IF v_promo IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: You do not have access to this promo code';
    END IF;
    
    RETURN QUERY
    SELECT 
        EXTRACT(WEEK FROM pcu.applied_at)::INTEGER as week_num,
        DATE_TRUNC('week', pcu.applied_at)::DATE as week_start,
        COUNT(DISTINCT pcu.user_id)::INTEGER as signups,
        COUNT(DISTINCT CASE 
            WHEN p.subscription_status = 'active' 
            THEN pcu.user_id 
        END)::INTEGER as conversions
    FROM promo_codes pc
    JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
    LEFT JOIN profiles p ON pcu.user_id = p.id
    WHERE pc.code = p_code
    AND pcu.applied_at > NOW() - INTERVAL '8 weeks'
    GROUP BY EXTRACT(WEEK FROM pcu.applied_at), DATE_TRUNC('week', pcu.applied_at)
    ORDER BY week_start DESC
    LIMIT 8;
END;
$$;

-- Step 7: Function to get influencer's promo codes
CREATE OR REPLACE FUNCTION get_my_promo_codes(p_user_id UUID)
RETURNS TABLE (
    code TEXT,
    tier TEXT,
    free_months INTEGER,
    times_used INTEGER,
    usage_limit INTEGER,
    active BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pc.code,
        pc.tier,
        pc.free_months,
        pc.times_used,
        pc.usage_limit,
        pc.active,
        pc.created_at
    FROM promo_codes pc
    WHERE pc.influencer_user_id = p_user_id
    ORDER BY pc.created_at DESC;
END;
$$;

-- Step 8: Grant permissions for new functions
GRANT EXECUTE ON FUNCTION claim_influencer_code TO authenticated;
GRANT EXECUTE ON FUNCTION get_influencer_stats_secure TO authenticated;
GRANT EXECUTE ON FUNCTION get_influencer_journey_secure TO authenticated;
GRANT EXECUTE ON FUNCTION get_influencer_weekly_stats_secure TO authenticated;
GRANT EXECUTE ON FUNCTION get_my_promo_codes TO authenticated;

-- Step 9: Migrate existing influencers (if any have matching emails in profiles table)
-- This will link existing promo codes to user accounts where emails match
UPDATE promo_codes pc
SET influencer_user_id = p.id,
    claimed_at = NOW()
FROM profiles p
WHERE LOWER(pc.influencer_email) = LOWER(p.email)
AND pc.influencer_user_id IS NULL
AND pc.influencer_email IS NOT NULL;

-- Mark those users as influencers
UPDATE profiles p
SET is_influencer = true,
    influencer_verified_at = NOW()
WHERE EXISTS (
    SELECT 1 FROM promo_codes pc 
    WHERE pc.influencer_user_id = p.id
);

-- Step 10: Create a view for public promo code validation (no auth required)
CREATE OR REPLACE VIEW public_promo_codes AS
SELECT 
    code,
    free_months,
    active,
    expires_at
FROM promo_codes
WHERE active = true;

-- Grant public access to the view
GRANT SELECT ON public_promo_codes TO anon;

COMMENT ON FUNCTION claim_influencer_code IS 'Allows an influencer to claim their promo code after signing up';
COMMENT ON FUNCTION get_influencer_stats_secure IS 'Secure version that requires authentication and ownership verification';
COMMENT ON COLUMN promo_codes.influencer_user_id IS 'Links the promo code to the influencer user account';
COMMENT ON COLUMN profiles.is_influencer IS 'Indicates if this user is a verified influencer';
