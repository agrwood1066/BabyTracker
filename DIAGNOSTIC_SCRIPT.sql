-- COMPREHENSIVE DIAGNOSTIC SCRIPT
-- Run this to see what's actually happening in your database

-- ============================================
-- STEP 1: Check current trigger status
-- ============================================
SELECT 
  '🔧 TRIGGER STATUS' as check_type,
  t.trigger_name,
  t.event_manipulation,
  t.action_timing,
  CASE 
    WHEN t.trigger_name = 'on_auth_user_created' THEN '✅ FOUND'
    ELSE '❓ UNEXPECTED'
  END as status
FROM information_schema.triggers t
WHERE t.event_object_table = 'users'
AND t.trigger_schema = 'auth';

-- ============================================
-- STEP 2: Check for problematic functions
-- ============================================
SELECT 
  '🚨 FUNCTION CHECK' as check_type,
  p.proname as function_name,
  CASE 
    WHEN p.proname = 'handle_new_user' THEN '✅ EXPECTED'
    WHEN p.proname = 'get_user_family_id' THEN '❌ SHOULD BE REMOVED'
    ELSE '❓ UNKNOWN'
  END as status
FROM pg_proc p
WHERE p.proname IN ('handle_new_user', 'get_user_family_id')
   OR p.prosrc LIKE '%profiles%profiles%'
ORDER BY p.proname;

-- ============================================
-- STEP 3: Check current RLS policies
-- ============================================
SELECT 
  '🔒 RLS POLICIES' as check_type,
  schemaname,
  tablename,
  policyname,
  CASE 
    WHEN qual LIKE '%profiles%profiles%' THEN '❌ POTENTIAL RECURSION'
    WHEN qual LIKE '%get_user_family_id%' THEN '❌ DANGEROUS FUNCTION'
    ELSE '✅ LOOKS OK'
  END as recursion_risk,
  LENGTH(qual) as policy_complexity
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- STEP 4: Test profile access directly
-- ============================================
-- Disable RLS temporarily to test raw access
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

SELECT 
  '👤 PROFILE TEST' as check_type,
  id,
  email,
  family_id,
  subscription_status,
  created_at,
  '✅ CAN ACCESS WITHOUT RLS' as status
FROM profiles 
WHERE email = 'test@example.com'
LIMIT 1;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 5: Test with RLS enabled (simplified)
-- ============================================
-- Note: This is a simplified test since we can't easily simulate auth context
SELECT 
  '🔒 RLS TEST' as check_type,
  'Manual test needed - check app console for RLS errors' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM auth.users WHERE email = 'test@example.com'
    ) THEN '✅ Test user exists in auth.users'
    ELSE '❌ Test user missing from auth.users'
  END as user_exists;

-- ============================================
-- STEP 6: Check for circular dependencies in policies
-- ============================================
WITH RECURSIVE policy_deps AS (
  -- Find policies that reference other tables
  SELECT 
    tablename,
    policyname,
    qual,
    CASE 
      WHEN qual ~ 'profiles.*profiles' THEN 'CIRCULAR_PROFILES'
      WHEN qual ~ 'family_members.*family_members' THEN 'CIRCULAR_FAMILY'
      ELSE 'OK'
    END as circular_risk
  FROM pg_policies 
  WHERE schemaname = 'public'
)
SELECT 
  '⚠️ CIRCULAR DEPENDENCY CHECK' as check_type,
  tablename,
  policyname,
  circular_risk,
  CASE 
    WHEN circular_risk LIKE 'CIRCULAR%' THEN '❌ FOUND CIRCULAR REFERENCE'
    ELSE '✅ NO CIRCULAR REFERENCE'
  END as verdict
FROM policy_deps
WHERE circular_risk != 'OK';

-- ============================================
-- STEP 7: Show what policies are actually applied
-- ============================================
SELECT 
  '📋 ACTIVE POLICIES SUMMARY' as check_type,
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- ============================================
-- STEP 8: Final recommendations
-- ============================================
SELECT 
  '💡 RECOMMENDATION' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_family_id') 
    THEN '❌ REMOVE get_user_family_id function causing recursion'
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE qual LIKE '%profiles%profiles%'
    )
    THEN '❌ Simplify recursive RLS policies'
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    )
    THEN '❌ Recreate missing profile trigger'
    ELSE '✅ Database looks good - check application code'
  END as action_needed;
