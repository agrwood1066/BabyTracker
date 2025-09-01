-- ============================================
-- QUICK MIGRATION RUNNER
-- Run this in Supabase SQL Editor to set up paywall
-- ============================================

-- First, run the main schema migration
\i subscription_paywall_schema.sql

-- Then verify the migration worked
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'profiles' 
    AND column_name IN (
        'subscription_status', 
        'subscription_plan', 
        'trial_ends_at',
        'stripe_customer_id'
    );

-- Check that VIP users have lifetime access
SELECT 
    email, 
    subscription_status, 
    admin_notes 
FROM 
    profiles 
WHERE 
    email IN (
        'alexgrwood@me.com', 
        'ellenarrowsmith@hotmail.co.uk', 
        'mkk93@hotmail.com', 
        'ruzin113@icloud.com'
    );

-- Check other users have extended trial
SELECT 
    email, 
    subscription_status, 
    trial_ends_at,
    admin_notes 
FROM 
    profiles 
WHERE 
    email NOT IN (
        'alexgrwood@me.com', 
        'ellenarrowsmith@hotmail.co.uk', 
        'mkk93@hotmail.com', 
        'ruzin113@icloud.com'
    );

-- Test the feature access function
SELECT check_feature_access(
    (SELECT id FROM profiles LIMIT 1),
    'shopping_items',
    5
);
