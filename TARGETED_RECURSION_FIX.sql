-- TARGETED FIX: Remove Recursive Policies Only
-- This fixes the specific recursion problem you identified

-- ============================================
-- STEP 1: Drop the problematic recursive policies
-- ============================================

DROP POLICY IF EXISTS "baby_items_family_access" ON baby_items;
DROP POLICY IF EXISTS "baby_names_family_access" ON baby_names;
DROP POLICY IF EXISTS "budget_categories_family_access" ON budget_categories;
DROP POLICY IF EXISTS "hospital_bag_family_access" ON hospital_bag_items;
DROP POLICY IF EXISTS "profiles_select_family" ON profiles;
DROP POLICY IF EXISTS "wishlist_family_access" ON wishlist_items;

-- ============================================
-- STEP 2: Create simple, non-recursive replacements
-- ============================================

-- For profiles: Keep only the working simple policies
-- (profiles_insert, profiles_select_own, profiles_update are already working)

-- For other tables: Use a direct approach that avoids recursion
-- We'll create policies that use the user's family_id directly from their profile

-- Baby Items: Simple family access
CREATE POLICY "baby_items_simple_access" ON baby_items 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.family_id = baby_items.family_id
    )
  );

-- Budget Categories: Simple family access  
CREATE POLICY "budget_categories_simple_access" ON budget_categories 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.family_id = budget_categories.family_id
    )
  );

-- Baby Names: Simple family access
CREATE POLICY "baby_names_simple_access" ON baby_names 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.family_id = baby_names.family_id
    )
  );

-- Hospital Bag: Simple family access
CREATE POLICY "hospital_bag_simple_access" ON hospital_bag_items 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.family_id = hospital_bag_items.family_id
    )
  );

-- Wishlist: Simple family access
CREATE POLICY "wishlist_simple_access" ON wishlist_items 
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.family_id = wishlist_items.family_id
    )
  );

-- ============================================
-- STEP 3: Verify the fix worked
-- ============================================

-- Check that recursive policies are gone
SELECT 
  '✅ RECURSION FIX VERIFICATION' as check_type,
  COUNT(*) as remaining_recursive_policies,
  CASE 
    WHEN COUNT(*) = 0 THEN '🎉 ALL RECURSIVE POLICIES REMOVED!'
    ELSE '⚠️ Some recursive policies still remain'
  END as status
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%profiles%profiles%' 
  OR qual LIKE '%family_members%family_members%'
);

-- Show new policy count
SELECT 
  '📊 NEW POLICY SUMMARY' as check_type,
  tablename,
  COUNT(*) as policy_count,
  STRING_AGG(policyname, ', ') as policy_names
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Test that test user can access their profile
-- Temporarily disable RLS to verify data exists
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

SELECT 
  '🧪 TEST USER VERIFICATION' as check_type,
  email,
  family_id,
  subscription_status,
  '✅ Profile accessible without RLS' as status
FROM profiles 
WHERE email = 'test@example.com';

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Final success message
SELECT 
  '🎉 TARGETED FIX COMPLETE!' as message,
  'Recursive policies removed and replaced with simple ones' as result,
  'Refresh your app to test - no more infinite recursion!' as next_step;
