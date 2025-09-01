-- Baby Steps Subscription & Paywall Schema
-- Version 1.0 - January 2025
-- This migration adds subscription, paywall, and influencer tracking functionality

-- ============================================
-- SUBSCRIPTION FIELDS FOR PROFILES
-- ============================================

-- Add subscription fields to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'trial' 
  CHECK (subscription_status IN ('trial', 'free', 'active', 'expired', 'lifetime_admin'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free'
  CHECK (subscription_plan IN ('free', 'premium_monthly', 'premium_annual'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP WITH TIME ZONE 
  DEFAULT NOW() + INTERVAL '14 days';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS locked_in_price DECIMAL(10,2);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;

-- Admin backdoor fields
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_granted_by UUID REFERENCES profiles(id);
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- ============================================
-- PROMO CODES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS promo_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    influencer_name TEXT NOT NULL,
    influencer_email TEXT,
    influencer_handle TEXT,
    tier TEXT CHECK (tier IN ('micro', 'mid', 'major')),
    free_months INTEGER NOT NULL DEFAULT 1,
    usage_limit INTEGER DEFAULT NULL,
    times_used INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    notes TEXT
);

-- ============================================
-- PROMO CODE USAGE TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS promo_code_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_code_id UUID REFERENCES promo_codes(id),
    user_id UUID REFERENCES profiles(id),
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    subscription_started_at TIMESTAMP WITH TIME ZONE,
    first_payment_at TIMESTAMP WITH TIME ZONE,
    churned_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id)
);

-- ============================================
-- INFLUENCER COMMISSION TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS influencer_commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    influencer_code TEXT,
    user_id UUID REFERENCES profiles(id),
    milestone TEXT CHECK (milestone IN ('3_months', '6_months', 'annual_upgrade')),
    amount DECIMAL(10,2),
    paid BOOLEAN DEFAULT false,
    eligible_date DATE,
    paid_date DATE,
    payment_method TEXT,
    payment_reference TEXT,
    UNIQUE(user_id, milestone)
);

-- ============================================
-- FEATURE USAGE TRACKING (for conversion optimisation)
-- ============================================

CREATE TABLE IF NOT EXISTS feature_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    feature_name TEXT,
    hit_limit_count INTEGER DEFAULT 0,
    last_limit_hit TIMESTAMP WITH TIME ZONE,
    upgraded_after_limit BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, feature_name)
);

-- ============================================
-- DATA VAULT FUNCTION - Check Feature Access
-- ============================================

CREATE OR REPLACE FUNCTION check_feature_access(
    p_user_id UUID,
    p_feature TEXT,
    p_current_count INTEGER DEFAULT 0
)
RETURNS jsonb AS $$
DECLARE
    v_subscription RECORD;
    v_limit INTEGER;
    v_vault_count INTEGER;
BEGIN
    -- Get user subscription
    SELECT * INTO v_subscription
    FROM profiles
    WHERE id = p_user_id;
    
    -- Premium users have unlimited access
    IF v_subscription.subscription_status IN ('trial', 'active', 'lifetime_admin') THEN
        RETURN jsonb_build_object(
            'hasAccess', true,
            'limit', -1,
            'vaultCount', 0,
            'isPremium', true
        );
    END IF;
    
    -- Define free tier limits
    CASE p_feature
        WHEN 'shopping_items' THEN v_limit := 10;
        WHEN 'budget_categories' THEN v_limit := 3;
        WHEN 'baby_names' THEN v_limit := 5;
        WHEN 'hospital_bag' THEN v_limit := 0; -- Premium only
        WHEN 'family_sharing' THEN v_limit := 0; -- Premium only
        WHEN 'wishlist' THEN v_limit := 0; -- Premium only
        WHEN 'export_pdf' THEN v_limit := 0; -- Premium only
        ELSE v_limit := -1;
    END CASE;
    
    -- Calculate vault items (items beyond limit)
    v_vault_count := GREATEST(0, p_current_count - v_limit);
    
    -- Track when limits are hit (for analytics)
    IF p_current_count >= v_limit AND v_limit > 0 THEN
        INSERT INTO feature_usage (user_id, feature_name, hit_limit_count, last_limit_hit)
        VALUES (p_user_id, p_feature, 1, NOW())
        ON CONFLICT (user_id, feature_name) 
        DO UPDATE SET 
            hit_limit_count = feature_usage.hit_limit_count + 1,
            last_limit_hit = NOW();
    END IF;
    
    RETURN jsonb_build_object(
        'hasAccess', p_current_count < v_limit OR v_limit = -1,
        'canView', true,
        'canEdit', p_current_count <= v_limit,
        'canAdd', p_current_count < v_limit,
        'limit', v_limit,
        'current', p_current_count,
        'vaultCount', v_vault_count,
        'isPremium', false,
        'message', CASE 
            WHEN v_vault_count > 0 THEN 
                format('📦 %s items in vault - Upgrade to access all', v_vault_count)
            WHEN p_current_count = v_limit AND v_limit > 0 THEN
                'You''ve reached your free limit - Upgrade for unlimited access'
            WHEN v_limit = 0 THEN
                'This is a Premium feature - Upgrade to access'
            ELSE NULL
        END
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HANDLE TRIAL END FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION handle_trial_end(p_user_id UUID)
RETURNS jsonb AS $$
DECLARE
    v_user RECORD;
    v_item_counts jsonb;
BEGIN
    -- Get user details
    SELECT * INTO v_user FROM profiles WHERE id = p_user_id;
    
    -- If not in trial, skip
    IF v_user.subscription_status != 'trial' THEN
        RETURN jsonb_build_object('success', false, 'message', 'User not in trial');
    END IF;
    
    -- If trial hasn't ended, skip
    IF v_user.trial_ends_at > NOW() THEN
        RETURN jsonb_build_object('success', false, 'message', 'Trial still active');
    END IF;
    
    -- Count user's data
    SELECT jsonb_build_object(
        'shopping_items', (SELECT COUNT(*) FROM baby_items WHERE family_id = v_user.family_id),
        'budget_categories', (SELECT COUNT(*) FROM budget_categories WHERE family_id = v_user.family_id),
        'baby_names', (SELECT COUNT(*) FROM baby_names WHERE family_id = v_user.family_id)
    ) INTO v_item_counts;
    
    -- Downgrade to free
    UPDATE profiles 
    SET 
        subscription_status = 'free',
        subscription_plan = 'free',
        updated_at = NOW()
    WHERE id = p_user_id;
    
    -- Return vault information
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Trial ended - data preserved in vault',
        'vaultSummary', jsonb_build_object(
            'shopping_vault', GREATEST(0, (v_item_counts->>'shopping_items')::int - 10),
            'budget_vault', GREATEST(0, (v_item_counts->>'budget_categories')::int - 3),
            'names_vault', GREATEST(0, (v_item_counts->>'baby_names')::int - 5)
        )
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- APPLY SUBSCRIPTION PRICING FUNCTION
-- ============================================

CREATE OR REPLACE FUNCTION apply_subscription_pricing(
    p_user_id UUID,
    p_plan TEXT
)
RETURNS jsonb AS $
DECLARE
    v_price DECIMAL(10,2);
BEGIN
    -- Set standard pricing
    IF p_plan = 'premium_monthly' THEN
        v_price := 6.99;
    ELSIF p_plan = 'premium_annual' THEN
        v_price := 69.99;
    ELSE
        v_price := 0;
    END IF;
    
    -- Lock in the price
    UPDATE profiles 
    SET 
        locked_in_price = v_price,
        subscription_plan = p_plan,
        subscription_status = 'active',
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'price_locked', v_price,
        'plan', p_plan,
        'message', CASE 
            WHEN p_plan = 'premium_monthly' THEN 
                'Subscription activated at £6.99/month'
            WHEN p_plan = 'premium_annual' THEN
                'Annual subscription activated at £69.99/year - You save £14!'
            ELSE 
                'Subscription updated'
        END
    );
END;
$ LANGUAGE plpgsql;

-- ============================================
-- ADMIN BACKDOOR - Grant Lifetime Premium
-- ============================================

CREATE OR REPLACE FUNCTION grant_lifetime_premium(
    target_email TEXT,
    granter_id UUID DEFAULT NULL,
    notes TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    target_user_id UUID;
BEGIN
    -- Find user by email
    SELECT id INTO target_user_id FROM profiles WHERE email = target_email;
    
    IF target_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Grant lifetime access
    UPDATE profiles SET
        subscription_status = 'lifetime_admin',
        subscription_plan = 'premium_monthly', -- For feature checks
        admin_granted_by = granter_id,
        admin_notes = notes,
        locked_in_price = 0, -- Free forever
        updated_at = NOW()
    WHERE id = target_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_email', target_email,
        'status', 'Lifetime premium granted'
    );
END;
$$;

-- ============================================
-- INFLUENCER DASHBOARD VIEW (anonymised)
-- ============================================

CREATE OR REPLACE VIEW influencer_dashboard AS
SELECT 
    pc.code,
    pc.influencer_name,
    COUNT(DISTINCT pcu.user_id) as total_signups,
    COUNT(DISTINCT CASE 
        WHEN p.subscription_status = 'trial' 
        AND p.trial_ends_at > NOW() 
        THEN pcu.user_id 
    END) as active_trials,
    COUNT(DISTINCT CASE 
        WHEN p.subscription_status = 'active' 
        THEN pcu.user_id 
    END) as paid_conversions,
    ROUND(
        COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pcu.user_id END)::numeric / 
        NULLIF(COUNT(DISTINCT pcu.user_id), 0) * 100, 1
    ) as conversion_rate,
    COALESCE(SUM(
        CASE WHEN ic.paid = false THEN ic.amount ELSE 0 END
    ), 0) as pending_commission,
    COALESCE(SUM(
        CASE WHEN ic.paid = true THEN ic.amount ELSE 0 END
    ), 0) as paid_commission
FROM promo_codes pc
LEFT JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
LEFT JOIN profiles p ON pcu.user_id = p.id
LEFT JOIN influencer_commissions ic ON ic.influencer_code = pc.code
GROUP BY pc.code, pc.influencer_name;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS on new tables
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;

-- Promo codes - public read for valid codes
CREATE POLICY "Public can view active promo codes" ON promo_codes
    FOR SELECT USING (active = true);

-- Promo code usage - users can see their own
CREATE POLICY "Users can view own promo usage" ON promo_code_usage
    FOR SELECT USING (user_id = auth.uid());

-- Feature usage - users can see their own
CREATE POLICY "Users can view own feature usage" ON feature_usage
    FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own feature usage" ON feature_usage
    FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own feature usage" ON feature_usage
    FOR UPDATE USING (user_id = auth.uid());

-- ============================================
-- MIGRATION FOR EXISTING USERS
-- ============================================

-- Grant lifetime premium to your VIP users
DO $$
BEGIN
    PERFORM grant_lifetime_premium('alexgrwood@me.com', NULL, 'Founder - lifetime access');
    PERFORM grant_lifetime_premium('ellenarrowsmith@hotmail.co.uk', NULL, 'Early supporter - lifetime access');
    PERFORM grant_lifetime_premium('mkk93@hotmail.com', NULL, 'Early supporter - lifetime access');
    PERFORM grant_lifetime_premium('ruzin113@icloud.com', NULL, 'Early supporter - lifetime access');
END $$;

-- Give other existing users extended trial (30 days from now)
UPDATE profiles 
SET 
    subscription_status = 'trial',
    trial_ends_at = NOW() + INTERVAL '30 days',
    admin_notes = 'Early adopter - extended trial'
WHERE subscription_status IS NULL 
    AND email NOT IN (
        'alexgrwood@me.com', 
        'ellenarrowsmith@hotmail.co.uk', 
        'mkk93@hotmail.com', 
        'ruzin113@icloud.com'
    );

-- Set default trial for any profiles missing subscription status
UPDATE profiles 
SET 
    subscription_status = 'trial',
    subscription_plan = 'free',
    trial_ends_at = COALESCE(trial_ends_at, NOW() + INTERVAL '14 days')
WHERE subscription_status IS NULL;

-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_trial_ends_at ON profiles(trial_ends_at);
CREATE INDEX IF NOT EXISTS idx_promo_codes_code ON promo_codes(code);
CREATE INDEX IF NOT EXISTS idx_feature_usage_user_feature ON feature_usage(user_id, feature_name);
