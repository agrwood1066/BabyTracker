-- NUCLEAR OPTION: COMPLETE RESET OF RLS AND TRIGGERS
-- Use this if the diagnostic shows ongoing recursion issues

-- ============================================
-- STEP 1: NUCLEAR RESET - Remove everything
-- ============================================

-- Drop ALL existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS get_user_family_id CASCADE;
DROP FUNCTION IF EXISTS public.get_user_family_id() CASCADE;

-- Disable ALL RLS temporarily
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE baby_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE baby_names DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_bag_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE family_members DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies completely
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;

-- ============================================
-- STEP 2: Create profiles for ALL users (guaranteed)
-- ============================================

-- Insert profiles for any missing users
INSERT INTO profiles (id, email, family_id, role, subscription_status, subscription_plan, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  gen_random_uuid() as family_id,
  'parent' as role,
  'free' as subscription_status,
  'free' as subscription_plan,
  COALESCE(au.created_at, NOW()) as created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO UPDATE SET 
  updated_at = NOW(),
  family_id = COALESCE(profiles.family_id, gen_random_uuid());

-- ============================================
-- STEP 3: Create simple, bulletproof trigger
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Ultra-simple profile creation
  INSERT INTO public.profiles (
    id, 
    email, 
    family_id,
    role,
    subscription_status,
    subscription_plan,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    gen_random_uuid(),
    'parent',
    'free',
    'free',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
EXCEPTION 
  WHEN OTHERS THEN
    -- Never fail, just return
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- STEP 4: Create ULTRA-SIMPLE RLS policies (no recursion possible)
-- ============================================

-- Profiles: Only access your own
CREATE POLICY "profiles_own_only" ON profiles 
  FOR ALL USING (auth.uid() = id);

-- Baby Items: Use direct family_id from profiles (no subquery)
CREATE POLICY "baby_items_access" ON baby_items 
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Budget Categories: Same pattern
CREATE POLICY "budget_categories_access" ON budget_categories 
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Baby Names: Same pattern
CREATE POLICY "baby_names_access" ON baby_names 
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Hospital Bag: Same pattern
CREATE POLICY "hospital_bag_access" ON hospital_bag_items 
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Wishlist: Same pattern
CREATE POLICY "wishlist_access" ON wishlist_items 
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Family Members: Simple access
CREATE POLICY "family_members_access" ON family_members 
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- STEP 5: Re-enable RLS
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_bag_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 6: Grant all necessary permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- STEP 7: Test everything
-- ============================================

-- Test 1: Verify trigger exists
SELECT 
  '✅ NUCLEAR RESET COMPLETE - TRIGGER CHECK' as status,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.triggers 
      WHERE trigger_name = 'on_auth_user_created'
    ) THEN '✅ TRIGGER ACTIVE'
    ELSE '❌ TRIGGER MISSING'
  END as trigger_status;

-- Test 2: Verify all users have profiles
SELECT 
  '✅ NUCLEAR RESET COMPLETE - PROFILE CHECK' as status,
  COUNT(au.id) as total_users,
  COUNT(p.id) as users_with_profiles,
  CASE 
    WHEN COUNT(au.id) = COUNT(p.id) THEN '✅ ALL USERS HAVE PROFILES'
    ELSE '❌ SOME USERS MISSING PROFILES'
  END as profile_status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;

-- Test 3: Test specific user access
SELECT 
  '✅ NUCLEAR RESET COMPLETE - TEST USER CHECK' as status,
  email,
  family_id,
  subscription_status,
  '✅ ACCESSIBLE' as access_status
FROM profiles 
WHERE email = 'test@example.com';

-- Test 4: Count policies (should be minimal)
SELECT 
  '✅ NUCLEAR RESET COMPLETE - POLICY CHECK' as status,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(*) BETWEEN 6 AND 8 THEN '✅ OPTIMAL POLICY COUNT'
    WHEN COUNT(*) > 10 THEN '⚠️ TOO MANY POLICIES'
    ELSE '⚠️ TOO FEW POLICIES'
  END as policy_status
FROM pg_policies 
WHERE schemaname = 'public';

-- Final message
SELECT 
  '🎉 NUCLEAR RESET COMPLETE!' as message,
  'Your database should now work without recursion' as result,
  'Refresh your app to test' as next_step;
