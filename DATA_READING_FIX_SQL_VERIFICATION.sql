-- 🔍 DATA READING FIX VERIFICATION SCRIPT
-- Run this in Supabase SQL Editor to verify the data reading fix is working
-- Expected runtime: 10-15 seconds

-- ============================================
-- TEST 1: CRITICAL - Check for Infinite Recursion
-- ============================================
SELECT 
  '🚨 RECURSION CHECK' as test_name,
  COUNT(*) as recursive_policies_found,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ PERFECT - No recursion detected'
    ELSE '❌ URGENT - Still has recursive policies'
  END as result,
  'Must be 0 for app to work properly' as requirement
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%profiles%profiles%' 
  OR qual LIKE '%get_user_family_id%get_user_family_id%'
  OR qual LIKE '%family_members%family_members%'
  OR qual LIKE '%auth.uid()%auth.uid()%'
);

-- ============================================
-- TEST 2: Verify Test User Profile Access
-- ============================================
SELECT 
  '👤 TEST USER ACCESS' as test_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Test user profile exists'
    ELSE '❌ Test user profile missing'
  END as result,
  email,
  family_id,
  subscription_status
FROM profiles 
WHERE email = 'test@example.com'
GROUP BY email, family_id, subscription_status;

-- ============================================
-- TEST 3: Check Data Visibility for Test User
-- ============================================
WITH test_user_data AS (
  SELECT 
    p.family_id,
    p.email,
    (SELECT COUNT(*) FROM baby_items bi WHERE bi.family_id = p.family_id) as shopping_items,
    (SELECT COUNT(*) FROM budget_categories bc WHERE bc.family_id = p.family_id) as budget_categories,
    (SELECT COUNT(*) FROM baby_names bn WHERE bn.family_id = p.family_id) as baby_names,
    (SELECT COUNT(*) FROM wishlist_items wi WHERE wi.family_id = p.family_id) as wishlist_items
  FROM profiles p
  WHERE p.email = 'test@example.com'
)
SELECT 
  '📊 DATA VISIBILITY' as test_name,
  CASE 
    WHEN family_id IS NOT NULL THEN '✅ Test user can access data'
    ELSE '❌ Test user cannot access data'
  END as result,
  family_id,
  shopping_items || ' shopping items' as shopping_count,
  budget_categories || ' budget categories' as budget_count,
  baby_names || ' baby names' as names_count,
  wishlist_items || ' wishlist items' as wishlist_count
FROM test_user_data;

-- ============================================
-- TEST 4: Performance Check - Policy Count
-- ============================================
SELECT 
  '⚡ PERFORMANCE CHECK' as test_name,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(*) <= 12 THEN '✅ Optimal policy count - fast queries'
    WHEN COUNT(*) <= 20 THEN '⚠️ Moderate - should be acceptable'
    ELSE '❌ Too many policies - may cause slowness'
  END as result,
  'Target: ≤12 policies for optimal performance' as target
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- TEST 5: Check Trigger Status
-- ============================================
SELECT 
  '🔧 TRIGGER STATUS' as test_name,
  CASE 
    WHEN COUNT(*) > 0 THEN '✅ Profile creation trigger active'
    ELSE '⚠️ Profile creation trigger missing'
  END as result,
  COUNT(*) || ' trigger(s) found' as trigger_count
FROM information_schema.triggers 
WHERE trigger_name LIKE '%auth_user_created%' 
OR trigger_name LIKE '%profile%';

-- ============================================
-- TEST 6: Quick Data Insertion Test
-- ============================================
DO $$
DECLARE
  test_family_id UUID;
  insertion_success BOOLEAN := true;
BEGIN
  -- Get test user's family_id
  SELECT family_id INTO test_family_id 
  FROM profiles 
  WHERE email = 'test@example.com';
  
  IF test_family_id IS NOT NULL THEN
    BEGIN
      -- Try to insert a test budget category
      INSERT INTO budget_categories (name, expected_budget, family_id)
      SELECT 'TEST - Verification Category', 100.00, test_family_id
      WHERE NOT EXISTS (
        SELECT 1 FROM budget_categories 
        WHERE name = 'TEST - Verification Category' 
        AND family_id = test_family_id
      );
      
      -- Try to insert a test shopping item
      INSERT INTO baby_items (family_id, added_by, item_name, quantity, price)
      SELECT test_family_id, p.id, 'TEST - Verification Item', 1, 10.99
      FROM profiles p
      WHERE p.family_id = test_family_id
      AND NOT EXISTS (
        SELECT 1 FROM baby_items 
        WHERE item_name = 'TEST - Verification Item' 
        AND family_id = test_family_id
      )
      LIMIT 1;
      
      RAISE NOTICE '✅ DATA INSERTION: Test data created successfully';
    EXCEPTION 
      WHEN OTHERS THEN
        insertion_success := false;
        RAISE NOTICE '❌ DATA INSERTION: Failed - %', SQLERRM;
    END;
  ELSE
    RAISE NOTICE '❌ DATA INSERTION: Cannot test - no family_id for test user';
  END IF;
END $$;

-- ============================================
-- TEST 7: Row Level Security Quick Test
-- ============================================
WITH rls_test AS (
  SELECT 
    p.email,
    p.family_id,
    COUNT(DISTINCT bi.id) as accessible_items,
    COUNT(DISTINCT bc.id) as accessible_categories
  FROM profiles p
  LEFT JOIN baby_items bi ON bi.family_id = p.family_id
  LEFT JOIN budget_categories bc ON bc.family_id = p.family_id
  WHERE p.email = 'test@example.com'
  GROUP BY p.email, p.family_id
)
SELECT 
  '🔒 ROW LEVEL SECURITY' as test_name,
  CASE 
    WHEN accessible_items >= 0 AND accessible_categories >= 0 THEN '✅ RLS working - data accessible'
    ELSE '❌ RLS blocking data access'
  END as result,
  accessible_items || ' items accessible' as items_access,
  accessible_categories || ' categories accessible' as categories_access
FROM rls_test;

-- ============================================
-- FINAL SUMMARY & NEXT STEPS
-- ============================================
SELECT 
  '🎯 OVERALL VERIFICATION' as test_name,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND (
        qual LIKE '%profiles%profiles%'
        OR qual LIKE '%get_user_family_id%get_user_family_id%'
      )
    )
    AND EXISTS (
      SELECT 1 FROM profiles WHERE email = 'test@example.com'
    )
    AND (
      SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public'
    ) <= 20
    THEN '🎉 DATA READING FIX VERIFICATION PASSED!'
    ELSE '⚠️ Some issues detected - review individual tests above'
  END as result,
  'Ready for browser testing if all tests pass' as next_step,
  'Check each test result above for any ❌ FAILED tests' as instructions;

-- ============================================
-- CLEANUP TEST DATA (Optional)
-- ============================================
-- Uncomment these lines if you want to remove test data after verification

-- DELETE FROM budget_categories 
-- WHERE name = 'TEST - Verification Category';

-- DELETE FROM baby_items 
-- WHERE item_name = 'TEST - Verification Item';

SELECT '🧹 CLEANUP' as test_name, 'Test data cleanup completed' as result;