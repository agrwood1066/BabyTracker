-- SQL to fix missing data for your test customer
-- Run this in Supabase SQL Editor

-- First, let's check what we have
SELECT 
  email,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_subscription_status,
  stripe_current_period_end,
  stripe_price_id,
  payment_method_last4,
  payment_method_brand
FROM profiles 
WHERE email = 'jut_60_macro@icloud.com';

-- Now update with the missing fields
-- You'll need to get some of these values from your Stripe Dashboard
UPDATE profiles
SET 
  -- Subscription status fields
  stripe_subscription_status = 'active', -- or 'trialing' if in trial
  
  -- Calculate current period end (1 month from creation for monthly plan)
  stripe_current_period_end = '2025-09-30 07:38:10+00'::timestamptz,
  
  -- Price ID (get from Stripe Dashboard - Subscription details)
  stripe_price_id = 'price_1S0evLFHwv9HjdNkTL86PAyH', -- This is your £6.99 monthly price
  
  -- Trial end (since they used SARAH-1 with 1 month free)
  stripe_trial_end = '2025-09-30 07:38:10+00'::timestamptz,
  
  -- These you'll need to check in Stripe Dashboard > Customer > Payment Methods
  payment_method_last4 = '4242', -- Replace with actual last 4
  payment_method_brand = 'visa', -- Replace with actual brand
  
  -- Ensure promo months is set correctly
  promo_months_granted = 1 -- Since SARAH-1 gives 1 month free
  
WHERE email = 'jut_60_macro@icloud.com';

-- Verify the update
SELECT 
  email,
  stripe_subscription_status,
  stripe_current_period_end,
  stripe_price_id,
  stripe_trial_end,
  payment_method_last4,
  payment_method_brand,
  promo_code_used,
  promo_months_granted
FROM profiles 
WHERE email = 'jut_60_macro@icloud.com';
