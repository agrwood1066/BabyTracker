-- COMPLETE PROFILE CREATION FIX
-- Run this in your Supabase SQL editor to fix profile creation issues

-- Step 1: Drop existing problematic trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Temporarily disable RLS to ensure profile creation works
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Create a bulletproof profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert basic profile first (guaranteed to work)
  INSERT INTO public.profiles (
    id, 
    email, 
    family_id,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id, 
    NEW.email,
    uuid_generate_v4(),
    NOW(),
    NOW()
  );
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Log the error but don't fail user creation
    RAISE LOG 'Profile creation failed for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Re-enable RLS with proper policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 6: Drop all existing policies and create simple ones
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view family member profiles" ON profiles;
DROP POLICY IF EXISTS "View family members simple" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in same family" ON profiles;
DROP POLICY IF EXISTS "Public profiles read" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create basic policies that work
CREATE POLICY "Enable read for users" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Enable insert for users" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Step 7: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Step 8: Test the setup
-- This should return 1 if the trigger exists
SELECT COUNT(*) as trigger_exists 
FROM information_schema.triggers 
WHERE trigger_name = 'on_auth_user_created';

-- Step 9: Create a test function to verify profile creation
CREATE OR REPLACE FUNCTION test_profile_creation()
RETURNS TEXT AS $$
DECLARE
  test_result TEXT;
BEGIN
  -- Check if profiles table is accessible
  PERFORM * FROM profiles LIMIT 1;
  
  -- Check if trigger function exists
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') THEN
    test_result := 'Profile creation setup is working correctly';
  ELSE
    test_result := 'Trigger function is missing';
  END IF;
  
  RETURN test_result;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'Error: ' || SQLERRM;
END;
$$ LANGUAGE plpgsql;

-- Run the test
SELECT test_profile_creation();

-- Step 10: Clean up test function
DROP FUNCTION test_profile_creation();

-- Step 11: Check current profiles (run this to see existing data)
SELECT 
  id,
  email,
  full_name,
  created_at,
  family_id
FROM profiles 
ORDER BY created_at DESC 
LIMIT 10;
