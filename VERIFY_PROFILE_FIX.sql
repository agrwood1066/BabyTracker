-- VERIFICATION QUERIES
-- Run these after applying the COMPLETE_PROFILE_CREATION_FIX.sql

-- 1. Check if the trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- 2. Check if the function exists  
SELECT 
  proname as function_name,
  prosrc as function_code
FROM pg_proc 
WHERE proname = 'handle_new_user';

-- 3. Check current RLS policies on profiles table
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'profiles';

-- 4. View all profiles (should include your test account)
SELECT 
  id,
  email,
  full_name,
  created_at,
  family_id
FROM profiles 
ORDER BY created_at DESC;

-- 5. Count profiles by creation date
SELECT 
  DATE(created_at) as creation_date,
  COUNT(*) as profiles_created
FROM profiles 
GROUP BY DATE(created_at)
ORDER BY creation_date DESC;

-- 6. Check for any auth users without profiles
SELECT 
  au.id,
  au.email,
  au.created_at,
  CASE WHEN p.id IS NULL THEN 'MISSING PROFILE' ELSE 'HAS PROFILE' END as profile_status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC
LIMIT 10;

-- 7. Test if you can create a profile manually (if needed)
-- ONLY run this if the trigger isn't working and you need to create profiles manually
-- Replace the UUID with actual user IDs from step 6 that are missing profiles
/*
INSERT INTO profiles (id, email, family_id)
SELECT 
  au.id,
  au.email,
  uuid_generate_v4()
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;
*/

-- 8. After running the fix, test creating a new account
-- Then run this to see if the profile was created:
-- SELECT * FROM profiles WHERE email = 'your-new-test-email@example.com';
