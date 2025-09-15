-- SIMPLIFIED DIAGNOSTIC SCRIPT (No syntax errors)
-- Run this to quickly identify the recursion problem

-- ============================================
-- STEP 1: Check current trigger status
-- ============================================
SELECT 
  '🔧 TRIGGER STATUS' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
      AND event_object_table = 'users'
    ) THEN '✅ TRIGGER EXISTS'
    ELSE '❌ TRIGGER MISSING'
  END as trigger_status;

-- ============================================
-- STEP 2: Check for problematic functions that cause recursion
-- ============================================
SELECT 
  '🚨 DANGEROUS FUNCTIONS CHECK' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_family_id') 
    THEN '❌ FOUND get_user_family_id - THIS CAUSES RECURSION!'
    ELSE '✅ No dangerous functions found'
  END as function_status;

-- ============================================
-- STEP 3: Check for recursive RLS policies
-- ============================================
SELECT 
  '⚠️ RECURSIVE POLICY CHECK' as check_type,
  COUNT(*) as suspicious_policies,
  CASE 
    WHEN COUNT(*) > 0 THEN '❌ FOUND RECURSIVE POLICIES - THIS CAUSES INFINITE LOOPS!'
    ELSE '✅ No obviously recursive policies found'
  END as policy_status
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%profiles%profiles%' 
  OR qual LIKE '%get_user_family_id%'
  OR qual LIKE '%family_members%family_members%'
);

-- ============================================
-- STEP 4: List all current policies (for review)
-- ============================================
SELECT 
  '📋 CURRENT POLICIES' as check_type,
  tablename,
  policyname,
  CASE 
    WHEN LENGTH(qual) > 200 THEN '⚠️ COMPLEX POLICY'
    WHEN qual LIKE '%profiles%profiles%' THEN '❌ RECURSIVE'
    ELSE '✅ SIMPLE'
  END as complexity
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- STEP 5: Test user and profile status
-- ============================================
-- Check if test user exists
SELECT 
  '👤 TEST USER STATUS' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM auth.users WHERE email = 'test@example.com')
    THEN '✅ User exists in auth.users'
    ELSE '❌ User missing from auth.users'
  END as user_status;

-- Temporarily disable RLS to check profile
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

SELECT 
  '📊 TEST USER PROFILE' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'test@example.com')
    THEN '✅ Profile exists (checked without RLS)'
    ELSE '❌ Profile missing (even without RLS)'
  END as profile_status;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Quick fix recommendation
-- ============================================
SELECT 
  '💡 RECOMMENDED ACTION' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_family_id')
    THEN '🚨 URGENT: Run NUCLEAR_RESET.sql to remove recursive function!'
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public'
      AND qual LIKE '%profiles%profiles%'
    )
    THEN '⚠️ Run NUCLEAR_RESET.sql to fix recursive policies'
    WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    )
    THEN '⚠️ Run NUCLEAR_RESET.sql to recreate missing trigger'
    ELSE '✅ Database structure looks OK - issue may be elsewhere'
  END as action_needed;

-- ============================================
-- FINAL SUMMARY
-- ============================================
SELECT 
  '📊 SUMMARY' as check_type,
  (SELECT COUNT(*) FROM auth.users) as total_users,
  (SELECT COUNT(*) FROM profiles) as total_profiles,
  (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public') as total_policies,
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_user_family_id')
    THEN 'RECURSION FUNCTION FOUND - NEEDS NUCLEAR RESET'
    ELSE 'No obvious recursion source - check policies'
  END as main_issue;
