-- Update the Stripe price ID mapping with correct price IDs
CREATE OR REPLACE FUNCTION update_subscription_from_stripe(
    p_stripe_customer_id TEXT,
    p_stripe_subscription_id TEXT,
    p_stripe_status TEXT,
    p_current_period_end TIMESTAMP WITH TIME ZONE,
    p_trial_end TIMESTAMP WITH TIME ZONE,
    p_price_id TEXT,
    p_promo_code TEXT DEFAULT NULL,
    p_promo_months INTEGER DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    v_user_id UUID;
    v_subscription_status TEXT;
    v_subscription_plan TEXT;
BEGIN
    -- Find user by stripe_customer_id
    SELECT id INTO v_user_id
    FROM profiles
    WHERE stripe_customer_id = p_stripe_customer_id;
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Map Stripe status to our local status
    CASE p_stripe_status
        WHEN 'trialing' THEN v_subscription_status := 'trial';
        WHEN 'active' THEN v_subscription_status := 'active';
        WHEN 'canceled', 'incomplete', 'incomplete_expired', 'unpaid' THEN v_subscription_status := 'free';
        WHEN 'past_due' THEN v_subscription_status := 'active'; -- Still active but payment issue
        ELSE v_subscription_status := 'free';
    END CASE;
    
    -- Map price ID to plan (UPDATED WITH CORRECT PRICE IDs)
    CASE p_price_id
        WHEN 'price_1S0evLFHwv9HjdNkTL86PAyH' THEN v_subscription_plan := 'premium_monthly'; -- Launch Monthly £6.99
        WHEN 'price_1S0ewOFHwv9HjdNkJH5Ct2fl' THEN v_subscription_plan := 'premium_annual';  -- Annual £69.99
        ELSE v_subscription_plan := 'free';
    END CASE;
    
    -- Update the user's profile with Stripe data
    UPDATE profiles SET
        stripe_subscription_id = p_stripe_subscription_id,
        stripe_subscription_status = p_stripe_status,
        stripe_current_period_end = p_current_period_end,
        stripe_trial_end = p_trial_end,
        stripe_price_id = p_price_id,
        subscription_status = v_subscription_status,
        subscription_plan = v_subscription_plan,
        promo_code_used = COALESCE(p_promo_code, promo_code_used),
        promo_months_granted = COALESCE(p_promo_months, promo_months_granted),
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'subscription_status', v_subscription_status,
        'subscription_plan', v_subscription_plan,
        'price_id_mapped', p_price_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
