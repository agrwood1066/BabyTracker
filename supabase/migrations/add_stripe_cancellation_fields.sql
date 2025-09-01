-- Add missing Stripe fields to profiles table for better subscription tracking
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS stripe_cancel_at_period_end BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT,
ADD COLUMN IF NOT EXISTS stripe_current_period_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_trial_end TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_promotion_code_id TEXT,
ADD COLUMN IF NOT EXISTS payment_method_last4 TEXT,
ADD COLUMN IF NOT EXISTS payment_method_brand TEXT,
ADD COLUMN IF NOT EXISTS promo_code_used TEXT,
ADD COLUMN IF NOT EXISTS promo_months_granted INTEGER DEFAULT 0;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON profiles(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);

-- Add comment for clarity
COMMENT ON COLUMN profiles.stripe_cancel_at_period_end IS 'True if subscription is set to cancel at the end of the current period';
COMMENT ON COLUMN profiles.stripe_subscription_status IS 'Raw status from Stripe (trialing, active, past_due, canceled, etc.)';
COMMENT ON COLUMN profiles.subscription_status IS 'Simplified status for app logic (trial, active, free, expired)';
