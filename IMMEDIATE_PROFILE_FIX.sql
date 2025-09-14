-- IMMEDIATE FIX: Create missing profiles for existing users
-- Run this first to fix your current situation

-- Step 1: Create profiles for all users who are missing them
INSERT INTO profiles (id, email, family_id, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  uuid_generate_v4() as family_id,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Step 2: Verify all users now have profiles
SELECT 
  'AFTER FIX' as status,
  COUNT(CASE WHEN p.id IS NULL THEN 1 END) as missing_profiles,
  COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as has_profiles,
  COUNT(*) as total_users
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;

-- Step 3: Show the users that just got profiles created
SELECT 
  p.id,
  p.email,
  'JUST CREATED' as status
FROM profiles p
WHERE p.updated_at > NOW() - INTERVAL '1 minute'
AND p.created_at < NOW() - INTERVAL '1 minute';
