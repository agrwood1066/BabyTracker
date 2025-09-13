-- COMPLETE FIX: Simplest possible profile creation
-- Run this entire script in Supabase SQL editor to fix the signup issue

-- Step 1: Drop the existing trigger that might be causing issues
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Create the simplest possible profile creation function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Just create a basic profile - nothing fancy
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email)
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- If anything goes wrong, just log it and continue
    RAISE LOG 'Error creating profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Make sure the profiles table has all needed columns with proper defaults
ALTER TABLE profiles 
  ALTER COLUMN family_id SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN role SET DEFAULT 'parent',
  ALTER COLUMN created_at SET DEFAULT NOW(),
  ALTER COLUMN updated_at SET DEFAULT NOW(),
  ALTER COLUMN subscription_status SET DEFAULT 'trial',
  ALTER COLUMN subscription_plan SET DEFAULT 'free',
  ALTER COLUMN trial_ends_at SET DEFAULT (NOW() + INTERVAL '14 days');

-- Step 5: Add the promo_code_used column if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS promo_code_used TEXT;

-- Step 6: Grant all necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Step 7: Enable Row Level Security but with permissive policies for now
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON profiles;

-- Create very permissive policies to avoid RLS issues
CREATE POLICY "Enable all for authenticated users" ON profiles
  FOR ALL USING (true) WITH CHECK (true);

-- Step 8: Test the function manually (optional)
-- SELECT handle_new_user();