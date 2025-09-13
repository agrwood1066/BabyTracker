-- DIAGNOSTIC: Check what's wrong with profile creation
-- Run each section separately in Supabase SQL editor to identify the issue

-- 1. Check if the profiles table exists and its structure
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Check if the trigger exists
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'auth'
AND event_object_table = 'users';

-- 3. Check if the handle_new_user function exists
SELECT 
    routine_name,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
AND routine_name = 'handle_new_user';

-- 4. Test creating a profile manually (replace with a test UUID)
-- INSERT INTO public.profiles (id, email) 
-- VALUES ('00000000-0000-0000-0000-000000000001', 'test@example.com');

-- 5. Check Row Level Security policies
SELECT 
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

-- 6. Check if there are any foreign key constraints causing issues
SELECT
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name='profiles';

-- 7. Check recent errors in Postgres logs (if you have access)
-- This might show in Supabase dashboard under Logs
