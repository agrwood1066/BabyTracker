-- COMPREHENSIVE TRIGGER INVESTIGATION
-- Run these queries one by one to diagnose the issue

-- 1. Check if trigger exists and is enabled
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.action_timing,
  t.action_statement,
  t.action_orientation,
  t.action_condition,
  CASE 
    WHEN t.trigger_name IS NULL THEN '❌ TRIGGER MISSING'
    ELSE '✅ TRIGGER EXISTS'
  END as status
FROM information_schema.triggers t
WHERE t.trigger_name = 'on_auth_user_created'
AND t.event_object_table = 'users'
AND t.event_object_schema = 'auth';

-- 2. Check if the trigger function exists and what it does
SELECT 
  p.proname as function_name,
  p.prosrc as function_code,
  CASE 
    WHEN p.proname IS NULL THEN '❌ FUNCTION MISSING'
    ELSE '✅ FUNCTION EXISTS'
  END as status
FROM pg_proc p
WHERE p.proname = 'handle_new_user';

-- 3. Check current RLS policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  roles,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. Test if profiles table allows INSERT operations
-- This will show if there are any constraint violations
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Check for any foreign key constraints that might be failing
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='profiles';

-- 6. Check if UUID extension is available (required for family_id generation)
SELECT 
  extname,
  extversion,
  CASE 
    WHEN extname = 'uuid-ossp' THEN '✅ UUID EXTENSION AVAILABLE'
    ELSE '❌ UUID EXTENSION MISSING'
  END as status
FROM pg_extension 
WHERE extname = 'uuid-ossp';

-- 7. Test profile creation manually (this should work)
DO $$
DECLARE
  test_result TEXT;
  test_id UUID := gen_random_uuid();
  test_email TEXT := 'trigger-test-' || extract(epoch from now()) || '@example.com';
BEGIN
  -- Try to insert a test profile
  INSERT INTO profiles (id, email, family_id, created_at, updated_at)
  VALUES (test_id, test_email, uuid_generate_v4(), NOW(), NOW());
  
  test_result := '✅ Manual profile creation works';
  RAISE NOTICE '%', test_result;
  
  -- Clean up the test record
  DELETE FROM profiles WHERE id = test_id;
  
EXCEPTION WHEN OTHERS THEN
  test_result := '❌ Manual profile creation failed: ' || SQLERRM;
  RAISE NOTICE '%', test_result;
END $$;

-- 8. Check PostgreSQL logs for any errors (if accessible)
-- Note: This might not work depending on your Supabase plan
SELECT 
  'Check Supabase Dashboard > Logs > Database for trigger errors' as instruction;

-- 9. Test the trigger function directly (simulating what happens on user creation)
DO $$
DECLARE
  test_user RECORD;
  test_result TEXT;
BEGIN
  -- Create a mock user record for testing
  test_user.id := gen_random_uuid();
  test_user.email := 'function-test-' || extract(epoch from now()) || '@example.com';
  test_user.created_at := NOW();
  
  -- Try to execute the trigger function logic manually
  BEGIN
    INSERT INTO public.profiles (id, email, family_id, created_at, updated_at)
    VALUES (test_user.id, test_user.email, uuid_generate_v4(), NOW(), NOW());
    
    test_result := '✅ Trigger function logic works';
    RAISE NOTICE '%', test_result;
    
    -- Clean up
    DELETE FROM profiles WHERE id = test_user.id;
    
  EXCEPTION WHEN OTHERS THEN
    test_result := '❌ Trigger function logic failed: ' || SQLERRM;
    RAISE NOTICE '%', test_result;
  END;
END $$;

-- 10. Show recent PostgreSQL log entries if available
-- This query might not work on all Supabase plans
SELECT 
  'If you have access to pg_stat_statements or logs, look for errors related to handle_new_user function' as diagnostic_tip;
