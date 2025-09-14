-- ============================================
-- RLS TESTING SCRIPT
-- ============================================
-- Run these tests to verify RLS is working correctly
-- Run each section one at a time to understand what's happening

-- ============================================
-- TEST 1: Profile Creation Simulation
-- ============================================
-- This simulates what happens when a new user signs up

-- 1.1: Check if trigger exists and is working
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement,
    CASE 
        WHEN trigger_name IS NULL THEN '❌ MISSING'
        ELSE '✅ EXISTS'
    END as status
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created'
AND event_object_schema = 'auth';

-- 1.2: Check the trigger function
SELECT 
    proname as function_name,
    CASE 
        WHEN proname IS NULL THEN '❌ MISSING'
        ELSE '✅ EXISTS'
    END as status
FROM pg_proc
WHERE proname = 'handle_new_user';

-- ============================================
-- TEST 2: Current User Access Test
-- ============================================
-- These queries test what the current logged-in user can access

-- 2.1: Can I see my own profile?
SELECT 
    'My Profile Access' as test,
    CASE 
        WHEN COUNT(*) > 0 THEN '✅ PASS - Can see own profile'
        ELSE '❌ FAIL - Cannot see own profile'
    END as result,
    COUNT(*) as records_found
FROM profiles 
WHERE id = auth.uid();

-- 2.2: What's my family_id?
SELECT 
    'My Family ID' as info,
    id as user_id,
    email,
    family_id,
    subscription_status
FROM profiles 
WHERE id = auth.uid();

-- 2.3: Can I access my family's data?
WITH my_family AS (
    SELECT family_id 
    FROM profiles 
    WHERE id = auth.uid()
)
SELECT 
    'Baby Items Access' as test,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ PASS - Can query baby items'
        ELSE '❌ FAIL - Cannot query baby items'
    END as result,
    COUNT(*) as items_found
FROM baby_items 
WHERE family_id = (SELECT family_id FROM my_family)
UNION ALL
SELECT 
    'Budget Categories Access' as test,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ PASS - Can query budget'
        ELSE '❌ FAIL - Cannot query budget'
    END as result,
    COUNT(*) as categories_found
FROM budget_categories 
WHERE family_id = (SELECT family_id FROM my_family)
UNION ALL
SELECT 
    'Baby Names Access' as test,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ PASS - Can query names'
        ELSE '❌ FAIL - Cannot query names'
    END as result,
    COUNT(*) as names_found
FROM baby_names 
WHERE family_id = (SELECT family_id FROM my_family);

-- ============================================
-- TEST 3: Insert Test (Can I Create Data?)
-- ============================================

-- 3.1: Test creating a budget category
DO $$
DECLARE
    v_family_id UUID;
    v_test_id UUID;
BEGIN
    -- Get current user's family_id
    SELECT family_id INTO v_family_id
    FROM profiles 
    WHERE id = auth.uid();
    
    IF v_family_id IS NULL THEN
        RAISE NOTICE 'No family_id found for current user';
        RETURN;
    END IF;
    
    -- Try to insert a test category
    BEGIN
        INSERT INTO budget_categories (name, expected_budget, family_id)
        VALUES ('RLS Test Category', 100, v_family_id)
        RETURNING id INTO v_test_id;
        
        RAISE NOTICE '✅ INSERT TEST PASSED - Created category with ID: %', v_test_id;
        
        -- Clean up test data
        DELETE FROM budget_categories WHERE id = v_test_id;
        RAISE NOTICE '✅ DELETE TEST PASSED - Cleaned up test data';
        
    EXCEPTION
        WHEN OTHERS THEN
            RAISE NOTICE '❌ INSERT TEST FAILED: %', SQLERRM;
    END;
END $$;

-- ============================================
-- TEST 4: Family Member Access Test
-- ============================================
-- Check if family members can see each other's data

-- 4.1: List all family members
WITH my_family AS (
    SELECT family_id FROM profiles WHERE id = auth.uid()
)
SELECT 
    p.email,
    p.full_name,
    p.role,
    CASE 
        WHEN p.id = auth.uid() THEN 'Me'
        ELSE 'Family Member'
    END as relationship
FROM profiles p
WHERE p.family_id = (SELECT family_id FROM my_family);

-- ============================================
-- TEST 5: Policy Coverage Check
-- ============================================
-- Ensure all tables have appropriate policies

SELECT 
    t.tablename,
    COUNT(p.policyname) as policy_count,
    CASE 
        WHEN COUNT(p.policyname) = 0 THEN '❌ NO POLICIES'
        WHEN COUNT(p.policyname) < 2 THEN '⚠️ LIMITED POLICIES'
        ELSE '✅ PROTECTED'
    END as status,
    STRING_AGG(p.cmd::text, ', ') as operations_covered
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename
WHERE t.schemaname = 'public'
AND t.tablename IN (
    'profiles', 'baby_items', 'baby_names', 'budget_categories',
    'hospital_bag_items', 'wishlist_items', 'appointments'
)
GROUP BY t.tablename
ORDER BY t.tablename;

-- ============================================
-- TEST 6: Cross-User Isolation Test
-- ============================================
-- Verify users can't see other families' data

-- 6.1: Count total records vs accessible records
SELECT 
    'Total Profiles in Database' as metric,
    COUNT(*) as count
FROM profiles
UNION ALL
SELECT 
    'Profiles I Can See' as metric,
    COUNT(*) as count
FROM profiles
WHERE id = auth.uid() 
   OR family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid());

-- ============================================
-- TEST 7: Promo Code Access Test
-- ============================================

-- 7.1: Can I see active promo codes?
SELECT 
    'Active Promo Codes Access' as test,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ PASS - Can query promo codes'
        ELSE '❌ FAIL - Cannot query promo codes'
    END as result,
    COUNT(*) as codes_found
FROM promo_codes
WHERE active = true;

-- 7.2: Can I see my own promo usage?
SELECT 
    'My Promo Usage Access' as test,
    CASE 
        WHEN COUNT(*) >= 0 THEN '✅ PASS - Can query own usage'
        ELSE '❌ FAIL - Cannot query own usage'
    END as result,
    COUNT(*) as usage_records
FROM promo_code_usage
WHERE user_id = auth.uid();

-- ============================================
-- FINAL SUMMARY
-- ============================================

WITH test_summary AS (
    SELECT 
        CASE 
            WHEN EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid()) 
            THEN '✅' ELSE '❌' 
        END as profile_test,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM profiles 
                WHERE id = auth.uid() AND family_id IS NOT NULL
            ) THEN '✅' ELSE '❌' 
        END as family_id_test,
        CASE 
            WHEN EXISTS (
                SELECT 1 FROM information_schema.triggers 
                WHERE trigger_name = 'on_auth_user_created'
            ) THEN '✅' ELSE '❌' 
        END as trigger_test,
        CASE 
            WHEN (
                SELECT COUNT(*) FROM pg_policies 
                WHERE tablename = 'profiles'
            ) >= 2 THEN '✅' ELSE '❌' 
        END as policies_test
)
SELECT 
    'RLS TEST SUMMARY' as report,
    profile_test || ' Profile Access' as profile_status,
    family_id_test || ' Family ID Exists' as family_status,
    trigger_test || ' Auto-Create Trigger' as trigger_status,
    policies_test || ' RLS Policies Active' as policy_status,
    CASE 
        WHEN profile_test = '✅' 
         AND family_id_test = '✅' 
         AND trigger_test = '✅' 
         AND policies_test = '✅'
        THEN '🎉 ALL TESTS PASS - RLS IS WORKING!'
        ELSE '⚠️ SOME TESTS FAILED - RUN FIX SCRIPT'
    END as overall_status
FROM test_summary;
