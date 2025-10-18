-- COMPREHENSIVE DIAGNOSTIC SCRIPT
-- Run this in Supabase SQL Editor to diagnose the signup profile creation issue
-- For user: input_chain.2n@icloud.com

-- ============================================
-- PART 1: Check if the trigger exists
-- ============================================
SELECT 
    'TRIGGER CHECK' as check_type,
    tgname as trigger_name, 
    tgisinternal as is_internal,
    tgenabled as enabled,
    pg_get_triggerdef(oid) as trigger_definition
FROM pg_trigger 
WHERE tgname = 'on_auth_user_created'
AND tgrelid = 'auth.users'::regclass;

-- ============================================
-- PART 2: Check if the function exists and get its definition
-- ============================================
SELECT 
    'FUNCTION CHECK' as check_type,
    proname as function_name,
    prosrc as function_body
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- ============================================
-- PART 3: Check the new user in auth.users
-- ============================================
SELECT 
    'NEW USER AUTH CHECK' as check_type,
    id,
    email,
    created_at,
    email_confirmed_at,
    raw_user_meta_data,
    raw_app_meta_data
FROM auth.users
WHERE email = 'input_chain.2n@icloud.com';

-- ============================================
-- PART 4: Check if profile was created
-- ============================================
SELECT 
    'PROFILE CHECK' as check_type,
    p.*
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'input_chain.2n@icloud.com';

-- If no profile, show count
SELECT 
    'PROFILE MISSING?' as check_type,
    COUNT(*) as profiles_found
FROM profiles p
JOIN auth.users u ON p.id = u.id
WHERE u.email = 'input_chain.2n@icloud.com';

-- ============================================
-- PART 5: Check promo code tables
-- ============================================
-- Check if promo code was used/logged
SELECT 
    'PROMO CODE USAGE' as check_type,
    pcu.*
FROM promo_code_usage pcu
JOIN auth.users u ON pcu.user_id = u.id
WHERE u.email = 'input_chain.2n@icloud.com';

-- Check promo activations
SELECT 
    'PROMO ACTIVATION' as check_type,
    pa.*
FROM promo_activations pa
JOIN auth.users u ON pa.user_id = u.id
WHERE u.email = 'input_chain.2n@icloud.com';

-- ============================================
-- PART 6: Check for other recent signups that might have failed
-- ============================================
SELECT 
    'RECENT USERS WITHOUT PROFILES' as check_type,
    u.id,
    u.email,
    u.created_at,
    u.raw_user_meta_data->>'promo_code_used' as promo_code
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE p.id IS NULL
AND u.created_at > NOW() - INTERVAL '7 days'
ORDER BY u.created_at DESC;

-- ============================================
-- PART 7: Count total users vs profiles
-- ============================================
SELECT 
    'USER VS PROFILE COUNT' as check_type,
    (SELECT COUNT(*) FROM auth.users) as total_users,
    (SELECT COUNT(*) FROM profiles) as total_profiles,
    (SELECT COUNT(*) FROM auth.users u LEFT JOIN profiles p ON u.id = p.id WHERE p.id IS NULL) as users_without_profiles;

-- ============================================
-- PART 8: Check RLS policies on profiles
-- ============================================
SELECT 
    'RLS POLICIES' as check_type,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- ============================================
-- PART 9: Test if we can manually create the profile
-- ============================================
-- This will try to create the profile manually to see if there are any constraint issues
DO $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
BEGIN
    -- Get the user ID
    SELECT id, email INTO v_user_id, v_user_email
    FROM auth.users
    WHERE email = 'input_chain.2n@icloud.com';
    
    IF v_user_id IS NOT NULL THEN
        -- Try to create profile
        BEGIN
            INSERT INTO profiles (id, email, family_id)
            VALUES (v_user_id, v_user_email, uuid_generate_v4())
            ON CONFLICT (id) DO NOTHING;
            
            RAISE NOTICE 'Profile created successfully for user: %', v_user_email;
        EXCEPTION WHEN OTHERS THEN
            RAISE NOTICE 'Error creating profile: %', SQLERRM;
        END;
    ELSE
        RAISE NOTICE 'User not found';
    END IF;
END $$;

-- ============================================
-- PART 10: Check if there are any database logs/errors
-- ============================================
-- Note: You may need to check Supabase dashboard logs for this
SELECT 
    'DIAGNOSTIC COMPLETE' as status,
    'Check results above for issues. Look for:' as instructions,
    '1. Missing trigger or function' as check_1,
    '2. User exists but no profile' as check_2,
    '3. RLS policy issues' as check_3,
    '4. Promo code not logged' as check_4;
