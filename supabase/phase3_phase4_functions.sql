-- Phase 3 & 4: Stripe Webhooks and Influencer Dashboard Functions
-- Run this after the main subscription schema

-- Function to get influencer stats (secure view)
CREATE OR REPLACE FUNCTION get_influencer_stats(p_code TEXT)
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
BEGIN
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
        COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pcu.user_id END)::numeric * 6.99 as monthly_revenue
    FROM promo_codes pc
    LEFT JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
    LEFT JOIN profiles p ON pcu.user_id = p.id
    LEFT JOIN influencer_commissions ic ON ic.influencer_code = pc.code AND ic.user_id = pcu.user_id
    WHERE pc.code = p_code
    GROUP BY pc.code;
END;
$$;

-- Function to get anonymized user journey
CREATE OR REPLACE FUNCTION get_influencer_journey(p_code TEXT)
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
BEGIN
    RETURN QUERY
    SELECT 
        'User #' || SUBSTRING(pcu.user_id::text, 1, 3) as anonymous_user_id,
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

-- Function to get weekly stats for charts
CREATE OR REPLACE FUNCTION get_influencer_weekly_stats(p_code TEXT)
RETURNS TABLE (
    week_num INTEGER,
    week_start DATE,
    signups INTEGER,
    conversions INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
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

-- Function to apply promo code during signup
CREATE OR REPLACE FUNCTION apply_promo_code(
    p_user_id UUID,
    p_code TEXT
)
RETURNS jsonb AS $$
DECLARE
    v_promo RECORD;
    v_existing RECORD;
    v_result jsonb;
BEGIN
    -- Check if user already used a promo code
    SELECT * INTO v_existing
    FROM promo_code_usage
    WHERE user_id = p_user_id;
    
    IF v_existing IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'You have already used a promo code'
        );
    END IF;
    
    -- Get promo code details
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND active = true;
    
    IF v_promo IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid promo code'
        );
    END IF;
    
    -- Check usage limit
    IF v_promo.usage_limit IS NOT NULL AND v_promo.times_used >= v_promo.usage_limit THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'This promo code has reached its usage limit'
        );
    END IF;
    
    -- Check expiry
    IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'This promo code has expired'
        );
    END IF;
    
    -- Apply the promo code
    INSERT INTO promo_code_usage (
        promo_code_id,
        user_id,
        applied_at
    ) VALUES (
        v_promo.id,
        p_user_id,
        NOW()
    );
    
    -- Update promo code usage count
    UPDATE promo_codes
    SET times_used = times_used + 1
    WHERE id = v_promo.id;
    
    -- Extend user's trial based on promo code
    UPDATE profiles
    SET trial_ends_at = NOW() + (v_promo.free_months || ' months')::interval
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', format('Promo code applied! You get %s month(s) free trial', v_promo.free_months),
        'free_months', v_promo.free_months,
        'influencer_name', v_promo.influencer_name
    );
END;
$$ LANGUAGE plpgsql;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_user_id ON promo_code_usage(user_id);
CREATE INDEX IF NOT EXISTS idx_promo_code_usage_promo_code_id ON promo_code_usage(promo_code_id);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_influencer_commissions_user_milestone ON influencer_commissions(user_id, milestone);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Sample promo codes for testing
INSERT INTO promo_codes (code, influencer_name, influencer_email, tier, free_months, usage_limit, active, notes)
VALUES 
    ('SARAH-1', 'Sarah Smith', 'sarah@example.com', 'micro', 1, NULL, true, 'Test influencer - micro tier'),
    ('EMMA-2', 'Emma Johnson', 'emma@example.com', 'mid', 2, NULL, true, 'Test influencer - mid tier'),
    ('LAUNCH50', 'Launch Promo', NULL, 'micro', 1, 50, true, 'Limited launch promotion')
ON CONFLICT (code) DO NOTHING;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_influencer_stats TO anon;
GRANT EXECUTE ON FUNCTION get_influencer_journey TO anon;
GRANT EXECUTE ON FUNCTION get_influencer_weekly_stats TO anon;
GRANT EXECUTE ON FUNCTION apply_promo_code TO authenticated;
