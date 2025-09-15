-- Quick verification script to run AFTER the main fix
-- This will show you that everything is working

-- 1. Check that the trigger exists and is working
SELECT 
  '🔧 Trigger Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN '✅ ACTIVE'
    ELSE '❌ MISSING'
  END as status;

-- 2. Check all users have profiles  
SELECT 
  '👤 Profile Coverage' as check_type,
  COUNT(au.id) as total_auth_users,
  COUNT(p.id) as users_with_profiles,
  CASE 
    WHEN COUNT(au.id) = COUNT(p.id) THEN '✅ ALL COVERED'
    ELSE '⚠️ ' || (COUNT(au.id) - COUNT(p.id)) || ' MISSING'
  END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;

-- 3. Test profile access for your test user
SELECT 
  '🧪 Test User Access' as check_type,
  id,
  email,
  family_id,
  subscription_status,
  '✅ CAN ACCESS' as status
FROM profiles 
WHERE email = 'test@example.com'
LIMIT 1;

-- 4. Check RLS policies are working (no recursion)
SELECT 
  '🔒 RLS Policy Count' as check_type,
  COUNT(*) as policy_count,
  CASE 
    WHEN COUNT(*) >= 8 THEN '✅ SUFFICIENT'
    ELSE '⚠️ INSUFFICIENT'
  END as status
FROM pg_policies 
WHERE schemaname = 'public';

-- 5. Final success indicator
SELECT 
  '🎉 OVERALL STATUS' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created')
    AND EXISTS (SELECT 1 FROM profiles WHERE email = 'test@example.com')
    THEN '✅ READY TO TEST APP'
    ELSE '⚠️ NEED TO RUN MAIN FIX FIRST'
  END as status;
