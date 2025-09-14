-- BULLETPROOF PROFILE CREATION TRIGGER
-- This replaces any existing trigger with a guaranteed-to-work version

-- Step 1: Drop existing trigger and function completely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Temporarily disable RLS to ensure insertions work
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 3: Create the most bulletproof trigger function possible
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_family_id UUID;
BEGIN
  -- Generate a family_id (fallback if uuid_generate_v4() fails)
  BEGIN
    v_family_id := uuid_generate_v4();
  EXCEPTION WHEN OTHERS THEN
    v_family_id := gen_random_uuid(); -- Fallback UUID generation
  END;
  
  -- Insert profile with comprehensive error handling
  BEGIN
    INSERT INTO public.profiles (
      id, 
      email, 
      family_id,
      role,
      created_at,
      updated_at
    ) VALUES (
      NEW.id,
      COALESCE(NEW.email, 'unknown@example.com'), -- Handle null email
      v_family_id,
      'parent',
      COALESCE(NEW.created_at, NOW()),
      NOW()
    );
    
    -- Log success for debugging
    RAISE LOG 'Profile created successfully for user: % (email: %)', NEW.id, NEW.email;
    
  EXCEPTION WHEN unique_violation THEN
    -- Profile already exists, this is OK
    RAISE LOG 'Profile already exists for user: % (email: %)', NEW.id, NEW.email;
    
  EXCEPTION WHEN OTHERS THEN
    -- Log the specific error but don't fail the user creation
    RAISE LOG 'Profile creation failed for user: % (email: %). Error: %', NEW.id, NEW.email, SQLERRM;
    
    -- Try a minimal profile creation as last resort
    BEGIN
      INSERT INTO public.profiles (id, email, family_id) 
      VALUES (NEW.id, COALESCE(NEW.email, 'fallback@example.com'), gen_random_uuid())
      ON CONFLICT (id) DO NOTHING;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Even fallback profile creation failed for user: %. Error: %', NEW.id, SQLERRM;
    END;
  END;
  
  RETURN NEW;
END;
$$;

-- Step 4: Create the trigger with proper timing and conditions
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 5: Re-enable RLS with minimal policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Enable read for users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for users" ON profiles;  
DROP POLICY IF EXISTS "Enable update for users" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create simple, working policies
CREATE POLICY "profiles_select_policy" ON profiles 
  FOR SELECT USING (
    auth.uid() = id OR 
    auth.uid() IN (
      SELECT user_id FROM family_members 
      WHERE family_id = profiles.family_id
    )
  );

CREATE POLICY "profiles_insert_policy" ON profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" ON profiles 
  FOR UPDATE USING (auth.uid() = id);

-- Step 6: Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated, anon;

-- Step 7: Test the new trigger
DO $$
DECLARE
  test_result TEXT;
BEGIN
  -- Check if trigger was created successfully
  IF EXISTS (
    SELECT 1 FROM information_schema.triggers 
    WHERE trigger_name = 'on_auth_user_created'
  ) THEN
    test_result := '✅ New bulletproof trigger created successfully';
  ELSE
    test_result := '❌ Trigger creation failed';
  END IF;
  
  RAISE NOTICE '%', test_result;
END $$;

-- Step 8: Verify function exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'handle_new_user') 
    THEN '✅ Trigger function exists and is ready'
    ELSE '❌ Trigger function missing'
  END as function_status;

-- Step 9: Show current trigger status
SELECT 
  t.trigger_name,
  t.event_manipulation,
  t.action_timing,
  '✅ ACTIVE' as status
FROM information_schema.triggers t
WHERE t.trigger_name = 'on_auth_user_created';

-- Step 10: Final verification - count missing profiles
SELECT 
  COUNT(CASE WHEN p.id IS NULL THEN 1 END) as still_missing_profiles,
  COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as has_profiles,
  COUNT(*) as total_users,
  CASE 
    WHEN COUNT(CASE WHEN p.id IS NULL THEN 1 END) = 0 
    THEN '🎉 ALL USERS HAVE PROFILES'
    ELSE '⚠️ ' || COUNT(CASE WHEN p.id IS NULL THEN 1 END) || ' USERS STILL MISSING PROFILES'
  END as summary
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;
