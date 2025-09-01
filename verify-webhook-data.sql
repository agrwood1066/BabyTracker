-- Webhook Data Verification Script
-- Run this in Supabase SQL Editor to verify all fields are being captured

-- 1. Check overall data completeness
SELECT 
  COUNT(*) as total_profiles,
  COUNT(stripe_customer_id) as has_stripe_customer,
  COUNT(stripe_subscription_id) as has_subscription,
  COUNT(stripe_subscription_status) as has_stripe_status,
  COUNT(stripe_current_period_end) as has_period_end,
  COUNT(stripe_price_id) as has_price_id,
  COUNT(payment_method_last4) as has_payment_method
FROM profiles
WHERE subscription_status != 'free';

-- 2. Show detailed view of recent subscriptions
SELECT 
  email,
  subscription_status,
  subscription_plan,
  stripe_subscription_status,
  to_char(stripe_current_period_end, 'DD Mon YYYY') as next_billing,
  stripe_price_id,
  to_char(stripe_trial_end, 'DD Mon YYYY') as trial_ends,
  payment_method_brand || ' ****' || payment_method_last4 as payment_method,
  promo_code_used,
  promo_months_granted,
  locked_in_price,
  to_char(updated_at, 'DD Mon YYYY HH24:MI') as last_updated
FROM profiles
WHERE stripe_customer_id IS NOT NULL
ORDER BY updated_at DESC
LIMIT 10;

-- 3. Identify profiles with missing data
SELECT 
  email,
  'Missing: ' || 
  CASE WHEN stripe_subscription_status IS NULL THEN 'subscription_status, ' ELSE '' END ||
  CASE WHEN stripe_current_period_end IS NULL THEN 'period_end, ' ELSE '' END ||
  CASE WHEN stripe_price_id IS NULL THEN 'price_id, ' ELSE '' END ||
  CASE WHEN payment_method_last4 IS NULL THEN 'payment_method, ' ELSE '' END as missing_fields
FROM profiles
WHERE stripe_customer_id IS NOT NULL
  AND subscription_status != 'free'
  AND (
    stripe_subscription_status IS NULL OR
    stripe_current_period_end IS NULL OR
    stripe_price_id IS NULL OR
    payment_method_last4 IS NULL
  );

-- 4. Check your specific test customer
SELECT 
  email,
  json_build_object(
    'subscription_status', subscription_status,
    'stripe_status', stripe_subscription_status,
    'current_period_end', stripe_current_period_end,
    'price_id', stripe_price_id,
    'trial_end', stripe_trial_end,
    'payment_method', payment_method_brand || ' ****' || payment_method_last4,
    'promo_code', promo_code_used,
    'promo_months', promo_months_granted
  ) as webhook_data
FROM profiles
WHERE email = 'jut_60_macro@icloud.com';
