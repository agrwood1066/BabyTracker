-- ============================================
-- Card-First Trial Implementation
-- Run this in Supabase SQL Editor
-- ============================================

-- Step 1: Update profiles table
-- ============================================

-- Change default subscription status to 'free'
ALTER TABLE profiles 
ALTER COLUMN subscription_status SET DEFAULT 'free';

-- Add new tracking fields
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS trial_activated_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS promo_months_pending INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS has_added_card BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_trial_end TIMESTAMP WITH TIME ZONE;

-- Step 2: Create promo activation tracking table
-- ============================================

CREATE TABLE IF NOT EXISTS promo_activations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) UNIQUE,
    promo_code TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    card_added_at TIMESTAMP WITH TIME ZONE,
    trial_started_at TIMESTAMP WITH TIME ZONE,
    free_months INTEGER,
    first_charge_date TIMESTAMP WITH TIME ZONE,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'activated', 'expired', 'used', 'converted'))
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_promo_activations_user_status 
ON promo_activations(user_id, status);

-- Step 3: Store promo code function (doesn't activate trial)
-- ============================================

CREATE OR REPLACE FUNCTION store_promo_code(
    p_user_id UUID,
    p_code TEXT
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_code RECORD;
BEGIN
    -- Validate code exists and is active
    SELECT * INTO v_code
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (usage_limit IS NULL OR times_used < usage_limit);
    
    IF v_code IS NULL THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'Invalid or expired code'
        );
    END IF;
    
    -- Check if user already used a promo
    IF EXISTS (SELECT 1 FROM promo_activations WHERE user_id = p_user_id) THEN
        RETURN jsonb_build_object(
            'success', false, 
            'error', 'You have already used a promo code'
        );
    END IF;
    
    -- Store promo for later activation
    INSERT INTO promo_activations (
        user_id, 
        promo_code, 
        free_months
    )
    VALUES (
        p_user_id, 
        v_code.code, 
        v_code.free_months
    )
    ON CONFLICT (user_id) DO UPDATE 
    SET promo_code = v_code.code, 
        free_months = v_code.free_months,
        created_at = NOW();
    
    -- Update profile with pending promo
    UPDATE profiles 
    SET promo_code_used = v_code.code,
        referred_by_influencer = v_code.influencer_name,
        promo_months_pending = v_code.free_months
    WHERE id = p_user_id;
    
    -- Increment usage counter
    UPDATE promo_codes 
    SET times_used = times_used + 1
    WHERE id = v_code.id;
    
    RETURN jsonb_build_object(
        'success', true,
        'code', v_code.code,
        'influencer', v_code.influencer_name,
        'free_months', v_code.free_months,
        'total_free_days', 14 + (v_code.free_months * 30),
        'message', 'Promo code saved! Add payment details to activate your ' || 
                  (14 + (v_code.free_months * 30)) || ' days free'
    );
END;
$$;

-- Step 4: Activate trial when card is added
-- ============================================

CREATE OR REPLACE FUNCTION activate_trial_with_payment(
    p_user_id UUID,
    p_stripe_customer_id TEXT,
    p_subscription_plan TEXT DEFAULT 'monthly'
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
    v_trial_end TIMESTAMP;
    v_first_charge TIMESTAMP;
    v_total_free_days INTEGER;
BEGIN
    -- Check if already has card/trial
    IF EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = p_user_id 
        AND (has_added_card = true OR subscription_status != 'free')
    ) THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Trial already activated or card already added'
        );
    END IF;
    
    -- Check for pending promo
    SELECT * INTO v_promo
    FROM promo_activations
    WHERE user_id = p_user_id
    AND status = 'pending';
    
    -- Calculate dates
    v_trial_end := NOW() + INTERVAL '14 days';
    
    IF v_promo IS NOT NULL THEN
        -- Has promo: add free months after trial
        v_first_charge := v_trial_end + (v_promo.free_months || ' months')::INTERVAL;
        v_total_free_days := 14 + (v_promo.free_months * 30);
        
        -- Mark promo as activated
        UPDATE promo_activations 
        SET status = 'activated',
            card_added_at = NOW(),
            trial_started_at = NOW(),
            first_charge_date = v_first_charge
        WHERE user_id = p_user_id;
    ELSE
        -- No promo: just 14-day trial
        v_first_charge := v_trial_end;
        v_total_free_days := 14;
    END IF;
    
    -- Update profile to trial
    UPDATE profiles 
    SET subscription_status = 'trial',
        subscription_plan = CASE 
            WHEN p_subscription_plan = 'annual' THEN 'premium_annual'
            ELSE 'premium_monthly'
        END,
        trial_ends_at = v_first_charge,
        trial_activated_at = NOW(),
        stripe_customer_id = p_stripe_customer_id,
        stripe_trial_end = v_first_charge,
        has_added_card = true,
        promo_months_pending = 0,
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'trial_ends', v_first_charge,
        'days_free', v_total_free_days,
        'first_charge_date', v_first_charge::date,
        'promo_applied', v_promo IS NOT NULL,
        'message', CASE 
            WHEN v_promo IS NOT NULL THEN 
                'Trial activated! You have ' || v_total_free_days || ' days free (14-day trial + ' || 
                v_promo.free_months || ' month' || CASE WHEN v_promo.free_months > 1 THEN 's' ELSE '' END || ' free)'
            ELSE 
                '14-day trial activated! Your first charge will be on ' || v_first_charge::date
        END
    );
END;
$$;

-- Step 5: Helper function to check promo status
-- ============================================

CREATE OR REPLACE FUNCTION get_user_promo_status(p_user_id UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
    v_profile RECORD;
BEGIN
    -- Get profile info
    SELECT * INTO v_profile
    FROM profiles
    WHERE id = p_user_id;
    
    -- Get promo info if exists
    SELECT * INTO v_promo
    FROM promo_activations
    WHERE user_id = p_user_id;
    
    IF v_promo IS NULL THEN
        RETURN jsonb_build_object(
            'has_promo', false,
            'subscription_status', v_profile.subscription_status,
            'has_added_card', v_profile.has_added_card
        );
    END IF;
    
    RETURN jsonb_build_object(
        'has_promo', true,
        'promo_code', v_promo.promo_code,
        'status', v_promo.status,
        'free_months', v_promo.free_months,
        'total_free_days', 14 + (v_promo.free_months * 30),
        'subscription_status', v_profile.subscription_status,
        'has_added_card', v_profile.has_added_card,
        'card_added_at', v_promo.card_added_at,
        'first_charge_date', v_promo.first_charge_date
    );
END;
$$;

-- Step 6: Analytics view for tracking performance
-- ============================================

CREATE OR REPLACE VIEW trial_conversion_metrics AS
SELECT 
    DATE(p.created_at) as signup_date,
    COUNT(*) as total_signups,
    COUNT(*) FILTER (WHERE p.subscription_status = 'free') as free_users,
    COUNT(*) FILTER (WHERE pa.promo_code IS NOT NULL) as with_promo,
    COUNT(*) FILTER (WHERE p.has_added_card = true) as added_cards,
    COUNT(*) FILTER (WHERE p.subscription_status = 'trial') as active_trials,
    COUNT(*) FILTER (WHERE p.subscription_status = 'active') as paid_users,
    ROUND(
        COUNT(*) FILTER (WHERE p.has_added_card = true)::numeric / 
        NULLIF(COUNT(*)::numeric, 0) * 100, 1
    ) as card_addition_rate,
    ROUND(
        COUNT(*) FILTER (WHERE pa.promo_code IS NOT NULL AND p.has_added_card = true)::numeric / 
        NULLIF(COUNT(*) FILTER (WHERE pa.promo_code IS NOT NULL)::numeric, 0) * 100, 1
    ) as promo_to_card_rate
FROM profiles p
LEFT JOIN promo_activations pa ON p.id = pa.user_id
WHERE p.created_at > NOW() - INTERVAL '90 days'
GROUP BY DATE(p.created_at)
ORDER BY signup_date DESC;

-- Step 7: Influencer performance tracking
-- ============================================

CREATE OR REPLACE VIEW influencer_performance_v2 AS
SELECT 
    pc.code,
    pc.influencer_name,
    pc.tier,
    COUNT(DISTINCT pa.user_id) as codes_applied,
    COUNT(DISTINCT CASE WHEN pa.status = 'activated' THEN pa.user_id END) as activated,
    COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pa.user_id END) as paid_customers,
    ROUND(
        COUNT(DISTINCT CASE WHEN pa.status = 'activated' THEN pa.user_id END)::numeric / 
        NULLIF(COUNT(DISTINCT pa.user_id)::numeric, 0) * 100, 1
    ) as activation_rate,
    ROUND(
        COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pa.user_id END)::numeric / 
        NULLIF(COUNT(DISTINCT CASE WHEN pa.status = 'activated' THEN pa.user_id END)::numeric, 0) * 100, 1
    ) as trial_to_paid_rate,
    COUNT(DISTINCT pa.user_id) * 6.99 as potential_monthly_revenue
FROM promo_codes pc
LEFT JOIN promo_activations pa ON pc.code = pa.promo_code
LEFT JOIN profiles p ON pa.user_id = p.id
GROUP BY pc.code, pc.influencer_name, pc.tier
ORDER BY codes_applied DESC;

-- Step 8: One-time migration for existing users
-- ============================================

-- Convert any current trial users without cards to free
UPDATE profiles 
SET subscription_status = 'free',
    trial_ends_at = NULL
WHERE subscription_status = 'trial' 
AND has_added_card = false
AND stripe_customer_id IS NULL;

-- Mark users with Stripe customers as having cards
UPDATE profiles 
SET has_added_card = true
WHERE stripe_customer_id IS NOT NULL
AND has_added_card = false;

-- ============================================
-- TESTING: Create test promo codes
-- ============================================

-- Create test influencer codes (REMOVE IN PRODUCTION)
INSERT INTO promo_codes (code, influencer_name, influencer_email, tier, free_months, active)
VALUES 
    ('TEST-1', 'Test Influencer 1', 'test1@example.com', 'micro', 1, true),
    ('TEST-2', 'Test Influencer 2', 'test2@example.com', 'mid', 2, true)
ON CONFLICT (code) DO NOTHING;

-- ============================================
-- Verification queries
-- ============================================

-- Check if everything is set up correctly
SELECT 
    'Profiles table' as component,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE subscription_status = 'free') as free_users,
    COUNT(*) FILTER (WHERE has_added_card = true) as with_cards
FROM profiles

UNION ALL

SELECT 
    'Promo codes' as component,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE active = true) as free_users,
    0 as with_cards
FROM promo_codes

UNION ALL

SELECT 
    'Promo activations' as component,
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status = 'pending') as free_users,
    COUNT(*) FILTER (WHERE status = 'activated') as with_cards
FROM promo_activations;

-- ============================================
-- Success! Card-first trial system is ready
-- ============================================