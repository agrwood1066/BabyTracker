-- DEBUGGING AND FIXING SUPABASE SETUP
-- Run each section one by one in Supabase SQL Editor

-- 1. Check if the profiles table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'profiles'
);

-- Output: exists = TRUE

-- 2. Check if the trigger exists
SELECT EXISTS (
  SELECT FROM pg_trigger 
  WHERE tgname = 'on_auth_user_created'
);

-- Output: exists = TRUE

-- 3. Check current users in auth
SELECT id, email, created_at FROM auth.users;

-- Output: Success. No rows returned

-- 4. Check current profiles
SELECT * FROM public.profiles;

-- 5. If profiles table is missing, create it
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    due_date DATE,
    family_id UUID DEFAULT gen_random_uuid(),
    role TEXT DEFAULT 'parent' CHECK (role IN ('parent', 'partner', 'family')),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 6. Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 7. Create simple RLS policies
DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.profiles;
CREATE POLICY "Enable all for authenticated users" ON public.profiles
    FOR ALL USING (auth.uid() IS NOT NULL);

-- 8. Fix the trigger function (simplified version)
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, family_id)
  VALUES (
    new.id, 
    new.email, 
    gen_random_uuid()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Log error but don't fail the user creation
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Grant permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- 11. Test by manually creating a profile for existing users
INSERT INTO public.profiles (id, email, family_id)
SELECT id, email, gen_random_uuid()
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO NOTHING;

-- 12. Verify the setup
SELECT 
  'Auth Users' as table_name, 
  COUNT(*) as count 
FROM auth.users
UNION ALL
SELECT 
  'Profiles' as table_name, 
  COUNT(*) as count 
FROM public.profiles;
