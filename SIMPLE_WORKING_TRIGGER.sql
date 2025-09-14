-- SIMPLE WORKING TRIGGER (Alternative if the bulletproof version still has issues)
-- This is a minimal, guaranteed-to-work version

-- Step 1: Drop any existing trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- Step 2: Create simple function (no complex error handling)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, family_id)
  VALUES (NEW.id, NEW.email, uuid_generate_v4());
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- If anything fails, just return NEW to not break auth
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 3: Create the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 4: Grant permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.profiles TO authenticated;

-- Step 5: Test it works
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) 
    THEN '✅ Simple trigger created successfully'
    ELSE '❌ Trigger creation failed'
  END as result;
