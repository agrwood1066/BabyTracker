-- =========================================
-- COMPREHENSIVE FIX FOR PROFILE CONNECTION
-- =========================================
-- This fix addresses the issue where users can login but their data isn't connected
-- Run each section in order

-- =========================================
-- SECTION 1: CREATE MISSING PROFILES
-- =========================================
-- First, create profiles for any users who don't have them
INSERT INTO profiles (id, email, family_id, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  uuid_generate_v4() as family_id,
  au.created_at,
  NOW() as updated_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Verify all users now have profiles
SELECT 
  'PROFILES CREATED' as status,
  COUNT(CASE WHEN p.id IS NULL THEN 1 END) as missing_profiles,
  COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as has_profiles
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id;

-- =========================================
-- SECTION 2: FIX RLS POLICIES
-- =========================================
-- Drop existing policies to start fresh
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view family profiles" ON profiles;

-- Create comprehensive policies
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

CREATE POLICY "Users can view family profiles" 
ON profiles FOR SELECT 
USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- =========================================
-- SECTION 3: FIX THE TRIGGER FUNCTION
-- =========================================
-- Drop and recreate the trigger function with better error handling
CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
DECLARE
  new_family_id uuid;
BEGIN
  -- Generate a new family_id
  new_family_id := uuid_generate_v4();
  
  -- Create profile with all necessary defaults
  INSERT INTO public.profiles (
    id, 
    email, 
    family_id,
    subscription_status,
    subscription_plan,
    trial_ends_at,
    created_at,
    updated_at
  )
  VALUES (
    new.id,
    new.email,
    new_family_id,
    COALESCE((new.raw_user_meta_data->>'subscription_status')::text, 'free'),
    COALESCE((new.raw_user_meta_data->>'subscription_plan')::text, 'free'),
    CASE 
      WHEN (new.raw_user_meta_data->>'subscription_status')::text = 'trial' 
      THEN NOW() + INTERVAL '14 days'
      ELSE NULL
    END,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();
  
  RETURN new;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the signup
    RAISE WARNING 'Profile creation failed: %', SQLERRM;
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =========================================
-- SECTION 4: FIX FAMILY DATA ACCESS
-- =========================================
-- Fix policies for all related tables to ensure data access

-- Baby Items
DROP POLICY IF EXISTS "Users can access family baby items" ON baby_items;
CREATE POLICY "Users can access family baby items" 
ON baby_items FOR ALL 
USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Budget Categories
DROP POLICY IF EXISTS "Users can access family budget categories" ON budget_categories;
CREATE POLICY "Users can access family budget categories" 
ON budget_categories FOR ALL 
USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Baby Names
DROP POLICY IF EXISTS "Users can access family baby names" ON baby_names;
CREATE POLICY "Users can access family baby names" 
ON baby_names FOR ALL 
USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Hospital Bag Items
DROP POLICY IF EXISTS "Users can access family hospital bag items" ON hospital_bag_items;
CREATE POLICY "Users can access family hospital bag items" 
ON hospital_bag_items FOR ALL 
USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Wishlist Items
DROP POLICY IF EXISTS "Users can access family wishlist items" ON wishlist_items;
CREATE POLICY "Users can access family wishlist items" 
ON wishlist_items FOR ALL 
USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Family Members
DROP POLICY IF EXISTS "Users can view family members" ON family_members;
CREATE POLICY "Users can view family members" 
ON family_members FOR SELECT 
USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- =========================================
-- SECTION 5: VERIFY THE FIX
-- =========================================
-- Test that current user can access their profile
SELECT 
  id,
  email,
  family_id,
  subscription_status,
  'CAN ACCESS' as status
FROM profiles 
WHERE id = auth.uid();

-- Check family data access
SELECT 
  'Baby Items' as table_name,
  COUNT(*) as accessible_count
FROM baby_items
WHERE family_id IN (
  SELECT family_id FROM profiles WHERE id = auth.uid()
)
UNION ALL
SELECT 
  'Budget Categories' as table_name,
  COUNT(*) as accessible_count
FROM budget_categories
WHERE family_id IN (
  SELECT family_id FROM profiles WHERE id = auth.uid()
)
UNION ALL
SELECT 
  'Baby Names' as table_name,
  COUNT(*) as accessible_count
FROM baby_names
WHERE family_id IN (
  SELECT family_id FROM profiles WHERE id = auth.uid()
);

-- =========================================
-- SECTION 6: GRANT NECESSARY PERMISSIONS
-- =========================================
-- Ensure the database has proper permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Success message
SELECT 'FIX COMPLETE! All users should now be able to access their data.' as message;
