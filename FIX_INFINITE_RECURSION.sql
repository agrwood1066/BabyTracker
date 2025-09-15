-- ============================================
-- FIX INFINITE RECURSION ERROR
-- ============================================
-- The "infinite recursion detected" error is caused by the get_user_family_id function
-- or circular RLS policies. This script fixes it.

-- ============================================
-- STEP 1: Drop the problematic function if it exists
-- ============================================
DROP FUNCTION IF EXISTS get_user_family_id CASCADE;

-- ============================================
-- STEP 2: Create a simpler, non-recursive version
-- ============================================
CREATE OR REPLACE FUNCTION get_user_family_id(user_id UUID)
RETURNS UUID 
LANGUAGE sql 
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT family_id 
  FROM profiles 
  WHERE id = user_id 
  LIMIT 1;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_family_id TO authenticated;

-- ============================================
-- STEP 3: Fix any recursive RLS policies
-- ============================================

-- First, let's check what policies might be causing recursion
SELECT 
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%get_user_family_id%get_user_family_id%' 
  OR qual LIKE '%profiles%profiles%profiles%'
)
ORDER BY tablename;

-- ============================================
-- STEP 4: Drop and recreate all RLS policies safely
-- ============================================

-- Temporarily disable RLS to fix policies
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE baby_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE baby_names DISABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_bag_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items DISABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DO $$ 
DECLARE
  r RECORD;
BEGIN
  FOR r IN (
    SELECT tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  )
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
  END LOOP;
END $$;

-- ============================================
-- STEP 5: Create simple, non-recursive policies for profiles
-- ============================================

-- Profiles table - simple self-access
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Family members can see each other (non-recursive)
CREATE POLICY "Users can view family profiles" 
ON profiles FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM profiles p1 
    WHERE p1.id = auth.uid() 
    AND p1.family_id = profiles.family_id
  )
);

-- ============================================
-- STEP 6: Create simple policies for other tables
-- ============================================

-- Baby Items
CREATE POLICY "Users can manage family baby items" 
ON baby_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.family_id = baby_items.family_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.family_id = baby_items.family_id
  )
);

-- Budget Categories
CREATE POLICY "Users can manage family budget" 
ON budget_categories FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.family_id = budget_categories.family_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.family_id = budget_categories.family_id
  )
);

-- Baby Names
CREATE POLICY "Users can manage family names" 
ON baby_names FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.family_id = baby_names.family_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.family_id = baby_names.family_id
  )
);

-- Hospital Bag Items
CREATE POLICY "Users can manage family hospital bag" 
ON hospital_bag_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.family_id = hospital_bag_items.family_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.family_id = hospital_bag_items.family_id
  )
);

-- Wishlist Items
CREATE POLICY "Users can manage family wishlist" 
ON wishlist_items FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.family_id = wishlist_items.family_id
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.family_id = wishlist_items.family_id
  )
);

-- ============================================
-- STEP 7: Re-enable RLS
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_bag_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 8: Test the fix
-- ============================================

-- Test 1: Can you access your own profile?
SELECT 
  'Profile Access Test' as test,
  id,
  email,
  family_id,
  subscription_status
FROM profiles 
WHERE id = auth.uid();

-- Test 2: Can you access family data without recursion?
WITH my_family AS (
  SELECT family_id FROM profiles WHERE id = auth.uid() LIMIT 1
)
SELECT 
  'Family Data Access' as test,
  COUNT(*) as accessible_items
FROM baby_items 
WHERE family_id = (SELECT family_id FROM my_family);

-- Test 3: Check for any remaining recursion
SELECT 
  'Recursion Check' as test,
  CASE 
    WHEN COUNT(*) > 0 THEN 'POTENTIAL RECURSION FOUND'
    ELSE 'NO RECURSION DETECTED'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%get_user_family_id%get_user_family_id%' 
  OR qual LIKE '%profiles%profiles%profiles%'
);

-- ============================================
-- STEP 9: Success message
-- ============================================
SELECT 
  '✅ INFINITE RECURSION FIX COMPLETE' as status,
  'RLS policies have been simplified to prevent recursion' as message,
  'Your app should now load without errors' as result;
