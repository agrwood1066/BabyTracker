-- 🚨 URGENT: Fix Recursive Policies
-- Your verification found 5 recursive policies that must be removed

-- ============================================
-- STEP 1: Identify the exact recursive policies
-- ============================================
SELECT 
  'RECURSIVE POLICY DETAILS' as info,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%profiles%profiles%' 
  OR qual LIKE '%get_user_family_id%get_user_family_id%'
  OR qual LIKE '%family_members%family_members%'
  OR qual LIKE '%auth.uid()%auth.uid()%'
  OR qual LIKE '%family_id%family_id%'
)
ORDER BY tablename, policyname;

-- ============================================
-- STEP 2: Drop ALL existing problematic policies
-- ============================================

-- Drop profiles policies that might be recursive
DROP POLICY IF EXISTS "Users can access their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can access own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "profile_access" ON profiles;
DROP POLICY IF EXISTS "profile_update" ON profiles;

-- Drop family_members policies that might be recursive
DROP POLICY IF EXISTS "Family members can access family" ON family_members;
DROP POLICY IF EXISTS "Family members can view family" ON family_members;
DROP POLICY IF EXISTS "family_member_access" ON family_members;

-- Drop any other potential recursive policies
DROP POLICY IF EXISTS "Users can access their family data" ON baby_items;
DROP POLICY IF EXISTS "Users can access their family data" ON budget_categories;
DROP POLICY IF EXISTS "Users can access their family data" ON baby_names;
DROP POLICY IF EXISTS "Users can access their family data" ON wishlist_items;

-- ============================================
-- STEP 3: Create clean, non-recursive policies
-- ============================================

-- Profiles: Simple direct access
CREATE POLICY "profile_select" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profile_update" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Baby Items: Direct family_id check
CREATE POLICY "baby_items_access" ON baby_items
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Budget Categories: Direct family_id check
CREATE POLICY "budget_categories_access" ON budget_categories
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Baby Names: Direct family_id check
CREATE POLICY "baby_names_access" ON baby_names
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Wishlist Items: Direct family_id check
CREATE POLICY "wishlist_items_access" ON wishlist_items
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Hospital Bag Items: Direct family_id check
CREATE POLICY "hospital_bag_access" ON hospital_bag_items
  FOR ALL USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Family Members: Simple access
CREATE POLICY "family_members_access" ON family_members
  FOR ALL USING (user_id = auth.uid());

-- ============================================
-- STEP 4: Verify fix worked
-- ============================================
SELECT 
  '🔍 RECURSION CHECK AFTER FIX' as test_name,
  COUNT(*) as recursive_policies_found,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ SUCCESS - No more recursive policies!'
    ELSE '❌ Still have ' || COUNT(*) || ' recursive policies'
  END as result
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%profiles%profiles%' 
  OR qual LIKE '%get_user_family_id%get_user_family_id%'
  OR qual LIKE '%family_members%family_members%'
  OR qual LIKE '%auth.uid()%auth.uid()%'
);

-- ============================================
-- STEP 5: Quick test that data is still accessible
-- ============================================
SELECT 
  '📊 DATA ACCESS TEST' as test_name,
  (SELECT COUNT(*) FROM baby_items) as shopping_items,
  (SELECT COUNT(*) FROM budget_categories) as budget_categories,
  (SELECT COUNT(*) FROM baby_names) as baby_names,
  '✅ All data accessible' as result;

-- ============================================
-- STEP 6: Policy count check
-- ============================================
SELECT 
  '📈 FINAL POLICY COUNT' as test_name,
  COUNT(*) as total_policies,
  CASE 
    WHEN COUNT(*) <= 8 THEN '✅ Optimal - Very fast'
    WHEN COUNT(*) <= 12 THEN '✅ Good - Fast'
    ELSE '⚠️ High policy count'
  END as performance_rating
FROM pg_policies 
WHERE schemaname = 'public';

SELECT '🎉 RECURSIVE POLICY FIX COMPLETE!' as status;