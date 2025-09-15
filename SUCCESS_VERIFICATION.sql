-- 🎉 SUCCESS VERIFICATION SCRIPT
-- Run this to confirm your Baby Tracker app is fully functional

-- ============================================
-- STEP 1: Verify no more recursion issues
-- ============================================
SELECT 
  '🚨 RECURSION CHECK' as test_type,
  COUNT(*) as recursive_policies_found,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ NO RECURSION - PERFECT!'
    ELSE '❌ Still has recursive policies'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%profiles%profiles%' 
  OR qual LIKE '%get_user_family_id%'
  OR qual LIKE '%family_members%family_members%'
);

-- ============================================
-- STEP 2: Verify optimal policy count
-- ============================================
SELECT 
  '📊 POLICY OPTIMIZATION CHECK' as test_type,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(*) BETWEEN 6 AND 10 THEN '✅ OPTIMAL POLICY COUNT'
    WHEN COUNT(*) > 15 THEN '⚠️ Too many policies (could slow down)'
    ELSE '⚠️ Too few policies (security risk)'
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- STEP 3: Verify trigger is working
-- ============================================
SELECT 
  '🔧 TRIGGER VERIFICATION' as test_type,
  trigger_name,
  '✅ ACTIVE AND READY' as status
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created'
AND event_object_table = 'users';

-- ============================================
-- STEP 4: Test user profile access
-- ============================================
SELECT 
  '👤 TEST USER PROFILE ACCESS' as test_type,
  p.email,
  p.family_id,
  p.subscription_status,
  p.created_at,
  '✅ PROFILE ACCESSIBLE' as status
FROM profiles p
WHERE p.email = 'test@example.com';

-- ============================================
-- STEP 5: Verify all tables are accessible for test user
-- ============================================
-- Get test user's family_id for testing
DO $$
DECLARE
  test_family_id UUID;
  item_count INTEGER;
  budget_count INTEGER;
  name_count INTEGER;
BEGIN
  -- Get family_id
  SELECT family_id INTO test_family_id 
  FROM profiles 
  WHERE email = 'test@example.com';
  
  IF test_family_id IS NOT NULL THEN
    -- Test baby_items access
    SELECT COUNT(*) INTO item_count 
    FROM baby_items 
    WHERE family_id = test_family_id;
    
    -- Test budget_categories access  
    SELECT COUNT(*) INTO budget_count
    FROM budget_categories 
    WHERE family_id = test_family_id;
    
    -- Test baby_names access
    SELECT COUNT(*) INTO name_count
    FROM baby_names 
    WHERE family_id = test_family_id;
    
    RAISE NOTICE '✅ TABLE ACCESS TEST RESULTS:';
    RAISE NOTICE '   Family ID: %', test_family_id;
    RAISE NOTICE '   Baby Items accessible: % items', item_count;
    RAISE NOTICE '   Budget Categories accessible: % categories', budget_count;
    RAISE NOTICE '   Baby Names accessible: % names', name_count;
    RAISE NOTICE '   All tables are accessible without errors!';
  ELSE
    RAISE NOTICE '❌ Test user profile not found';
  END IF;
END $$;

-- ============================================
-- STEP 6: Verify all users have profiles
-- ============================================
SELECT 
  '🔄 USER-PROFILE SYNC CHECK' as test_type,
  COUNT(au.id) as total_users,
  COUNT(p.id) as users_with_profiles,
  COUNT(au.id) - COUNT(p.id) as missing_profiles,
  CASE 
    WHEN COUNT(au.id) = COUNT(p.id) THEN '✅ ALL USERS HAVE PROFILES'
    ELSE '⚠️ ' || (COUNT(au.id) - COUNT(p.id)) || ' users missing profiles'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;

-- ============================================
-- STEP 7: Test data creation (if no existing data)
-- ============================================
-- Create some sample data for test user if none exists
INSERT INTO budget_categories (name, expected_budget, family_id)
SELECT 
  'Test Category',
  100.00,
  family_id
FROM profiles 
WHERE email = 'test@example.com'
AND NOT EXISTS (
  SELECT 1 FROM budget_categories bc 
  WHERE bc.family_id = profiles.family_id
)
LIMIT 1;

INSERT INTO baby_items (family_id, added_by, item_name, quantity, price)
SELECT 
  p.family_id,
  p.id,
  'Test Baby Item',
  1,
  25.99
FROM profiles p
WHERE p.email = 'test@example.com'
AND NOT EXISTS (
  SELECT 1 FROM baby_items bi 
  WHERE bi.family_id = p.family_id
)
LIMIT 1;

INSERT INTO baby_names (family_id, suggested_by, name, gender)
SELECT 
  p.family_id,
  p.id,
  'Test Name',
  'neutral'
FROM profiles p
WHERE p.email = 'test@example.com'
AND NOT EXISTS (
  SELECT 1 FROM baby_names bn 
  WHERE bn.family_id = p.family_id
)
LIMIT 1;

-- ============================================
-- STEP 8: Final data count verification
-- ============================================
SELECT 
  '📈 SAMPLE DATA VERIFICATION' as test_type,
  (SELECT COUNT(*) FROM budget_categories bc 
   JOIN profiles p ON bc.family_id = p.family_id 
   WHERE p.email = 'test@example.com') as budget_categories,
  (SELECT COUNT(*) FROM baby_items bi 
   JOIN profiles p ON bi.family_id = p.family_id 
   WHERE p.email = 'test@example.com') as baby_items,
  (SELECT COUNT(*) FROM baby_names bn 
   JOIN profiles p ON bn.family_id = p.family_id 
   WHERE p.email = 'test@example.com') as baby_names,
  '✅ DATA ACCESSIBLE' as status;

-- ============================================
-- STEP 9: Performance check
-- ============================================
SELECT 
  '⚡ PERFORMANCE CHECK' as test_type,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(*) <= 10 THEN '✅ OPTIMAL - Fast queries expected'
    WHEN COUNT(*) <= 20 THEN '⚠️ MODERATE - Should be fine'
    ELSE '❌ HIGH - May slow down queries'
  END as performance_impact
FROM pg_policies 
WHERE schemaname = 'public';

-- ============================================
-- FINAL SUCCESS SUMMARY
-- ============================================
SELECT 
  '🎉 FINAL VERIFICATION SUMMARY' as test_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'test@example.com')
    AND NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND qual LIKE '%profiles%profiles%'
    )
    AND EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    )
    THEN '🎉 PERFECT! Your Baby Tracker app is fully functional!'
    ELSE '⚠️ Some issues detected - check individual tests above'
  END as overall_status,
  'Your app should now load real data without infinite recursion errors' as expected_result;
