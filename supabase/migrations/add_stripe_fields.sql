-- Add Stripe-related fields to profiles table for subscription sync
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT,
ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS promo_code_used TEXT,
ADD COLUMN IF NOT EXISTS promo_months_granted INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS payment_method_last4 TEXT,
ADD COLUMN IF NOT EXISTS payment_method_brand TEXT;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);

-- Create a table to log webhook events for debugging
CREATE TABLE IF NOT EXISTS stripe_webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id TEXT UNIQUE NOT NULL,
    event_type TEXT NOT NULL,
    data JSONB,
    processed BOOLEAN DEFAULT false,
    error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create function to update subscription from Stripe webhook
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
    
    -- Map price ID to plan
    CASE p_price_id
        WHEN 'price_1QTlJ9EGKpyyfvNBjfepn9jj' THEN v_subscription_plan := 'premium_monthly'; -- £6.99
        WHEN 'price_1QTlJUEGKpyyfvNBdOsKLkUF' THEN v_subscription_plan := 'premium_annual';  -- £69.99
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
        'subscription_plan', v_subscription_plan
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle customer creation/update
CREATE OR REPLACE FUNCTION update_customer_from_stripe(
    p_stripe_customer_id TEXT,
    p_email TEXT,
    p_payment_method_last4 TEXT DEFAULT NULL,
    p_payment_method_brand TEXT DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Find user by email first, then by customer ID
    SELECT id INTO v_user_id
    FROM profiles
    WHERE email = p_email OR stripe_customer_id = p_stripe_customer_id
    LIMIT 1;
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Update customer information
    UPDATE profiles SET
        stripe_customer_id = p_stripe_customer_id,
        payment_method_last4 = COALESCE(p_payment_method_last4, payment_method_last4),
        payment_method_brand = COALESCE(p_payment_method_brand, payment_method_brand),
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'stripe_customer_id', p_stripe_customer_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to handle subscription cancellation
CREATE OR REPLACE FUNCTION cancel_subscription_from_stripe(
    p_stripe_customer_id TEXT,
    p_canceled_at TIMESTAMP WITH TIME ZONE
)
RETURNS jsonb AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Find user by stripe_customer_id
    SELECT id INTO v_user_id
    FROM profiles
    WHERE stripe_customer_id = p_stripe_customer_id;
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'error', 'User not found');
    END IF;
    
    -- Update subscription to canceled/free
    UPDATE profiles SET
        subscription_status = 'free',
        subscription_plan = 'free',
        stripe_subscription_status = 'canceled',
        subscription_expires_at = p_canceled_at,
        updated_at = NOW()
    WHERE id = v_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'user_id', v_user_id,
        'status', 'canceled'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION update_subscription_from_stripe TO service_role;
GRANT EXECUTE ON FUNCTION update_customer_from_stripe TO service_role;
GRANT EXECUTE ON FUNCTION cancel_subscription_from_stripe TO service_role;
GRANT INSERT, UPDATE ON stripe_webhook_logs TO service_role;
