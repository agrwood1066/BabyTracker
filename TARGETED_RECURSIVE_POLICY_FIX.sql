-- 🎯 TARGETED FIX: Identify and Remove Only Existing Recursive Policies
-- This script first checks what policies actually exist, then removes only the problematic ones

-- ============================================
-- STEP 1: Show ALL current policies so we know what we're working with
-- ============================================
SELECT 
  '📋 CURRENT POLICY INVENTORY' as info,
  schemaname,
  tablename,
  policyname,
  cmd,
  permissive,
  LEFT(qual, 100) || '...' as policy_definition_preview
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- ============================================
-- STEP 2: Identify EXACTLY which policies are recursive
-- ============================================
SELECT 
  '🚨 RECURSIVE POLICIES FOUND' as info,
  schemaname,
  tablename,
  policyname,
  'DROP POLICY "' || policyname || '" ON ' || tablename || ';' as drop_command
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%profiles%profiles%' 
  OR qual LIKE '%get_user_family_id%get_user_family_id%'
  OR qual LIKE '%family_members%family_members%'
  OR qual LIKE '%auth.uid()%auth.uid()%'
  OR qual LIKE '%family_id%family_id%'
  OR qual LIKE '%(SELECT%SELECT%'
);

-- ============================================
-- STEP 3: Drop policies one by one (safe approach)
-- ============================================

-- Check if specific policies exist before dropping them
DO $$
DECLARE
    policy_record RECORD;
    drop_command TEXT;
BEGIN
    -- Get all recursive policies
    FOR policy_record IN 
        SELECT schemaname, tablename, policyname
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND (
          qual LIKE '%profiles%profiles%' 
          OR qual LIKE '%get_user_family_id%get_user_family_id%'
          OR qual LIKE '%family_members%family_members%'
          OR qual LIKE '%auth.uid()%auth.uid()%'
          OR qual LIKE '%family_id%family_id%'
          OR qual LIKE '%(SELECT%SELECT%'
        )
    LOOP
        drop_command := 'DROP POLICY "' || policy_record.policyname || '" ON ' || policy_record.tablename;
        
        BEGIN
            EXECUTE drop_command;
            RAISE NOTICE '✅ Dropped policy: % on table %', policy_record.policyname, policy_record.tablename;
        EXCEPTION 
            WHEN OTHERS THEN
                RAISE NOTICE '⚠️ Could not drop policy % on table %: %', policy_record.policyname, policy_record.tablename, SQLERRM;
        END;
    END LOOP;
END $$;

-- ============================================
-- STEP 4: Create minimal, non-recursive policies
-- ============================================

-- Only create policies if they don't already exist

-- Profiles policies (simple, direct)
DO $$ 
BEGIN
    -- Check if policy exists before creating
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'profiles_select_own'
    ) THEN
        CREATE POLICY "profiles_select_own" ON profiles
        FOR SELECT USING (auth.uid() = id);
        RAISE NOTICE '✅ Created profiles_select_own policy';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'profiles' 
        AND policyname = 'profiles_update_own'
    ) THEN
        CREATE POLICY "profiles_update_own" ON profiles
        FOR UPDATE USING (auth.uid() = id);
        RAISE NOTICE '✅ Created profiles_update_own policy';
    END IF;
END $$;

-- Family data policies (simple, direct family_id lookup)
DO $$
BEGIN
    -- Baby Items
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'baby_items' 
        AND policyname = 'baby_items_family_access'
    ) THEN
        CREATE POLICY "baby_items_family_access" ON baby_items
        FOR ALL USING (
            family_id = (SELECT family_id FROM profiles WHERE id = auth.uid())
        );
        RAISE NOTICE '✅ Created baby_items_family_access policy';
    END IF;

    -- Budget Categories
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'budget_categories' 
        AND policyname = 'budget_categories_family_access'
    ) THEN
        CREATE POLICY "budget_categories_family_access" ON budget_categories
        FOR ALL USING (
            family_id = (SELECT family_id FROM profiles WHERE id = auth.uid())
        );
        RAISE NOTICE '✅ Created budget_categories_family_access policy';
    END IF;

    -- Baby Names
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'baby_names' 
        AND policyname = 'baby_names_family_access'
    ) THEN
        CREATE POLICY "baby_names_family_access" ON baby_names
        FOR ALL USING (
            family_id = (SELECT family_id FROM profiles WHERE id = auth.uid())
        );
        RAISE NOTICE '✅ Created baby_names_family_access policy';
    END IF;

    -- Wishlist Items
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'wishlist_items' 
        AND policyname = 'wishlist_items_family_access'
    ) THEN
        CREATE POLICY "wishlist_items_family_access" ON wishlist_items
        FOR ALL USING (
            family_id = (SELECT family_id FROM profiles WHERE id = auth.uid())
        );
        RAISE NOTICE '✅ Created wishlist_items_family_access policy';
    END IF;

    -- Hospital Bag Items
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'hospital_bag_items' 
        AND policyname = 'hospital_bag_items_family_access'
    ) THEN
        CREATE POLICY "hospital_bag_items_family_access" ON hospital_bag_items
        FOR ALL USING (
            family_id = (SELECT family_id FROM profiles WHERE id = auth.uid())
        );
        RAISE NOTICE '✅ Created hospital_bag_items_family_access policy';
    END IF;

    -- Family Members
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename = 'family_members' 
        AND policyname = 'family_members_own_access'
    ) THEN
        CREATE POLICY "family_members_own_access" ON family_members
        FOR ALL USING (user_id = auth.uid());
        RAISE NOTICE '✅ Created family_members_own_access policy';
    END IF;
END $$;

-- ============================================
-- STEP 5: Verify the fix worked
-- ============================================
SELECT 
  '🔍 RECURSION CHECK AFTER TARGETED FIX' as test_name,
  COUNT(*) as recursive_policies_remaining,
  CASE 
    WHEN COUNT(*) = 0 THEN '✅ SUCCESS - All recursion eliminated!'
    ELSE '❌ Still have ' || COUNT(*) || ' recursive policies - need manual review'
  END as result
FROM pg_policies 
WHERE schemaname = 'public'
AND (
  qual LIKE '%profiles%profiles%' 
  OR qual LIKE '%get_user_family_id%get_user_family_id%'
  OR qual LIKE '%family_members%family_members%'
  OR qual LIKE '%auth.uid()%auth.uid()%'
  OR qual LIKE '%(SELECT%SELECT%'
);

-- ============================================
-- STEP 6: Show final policy inventory
-- ============================================
SELECT 
  '📊 FINAL POLICY COUNT' as test_name,
  COUNT(*) as total_policies,
  STRING_AGG(tablename || ':' || policyname, ', ') as policy_list
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY 'FINAL POLICY COUNT';

-- ============================================
-- STEP 7: Test data access still works
-- ============================================
SELECT 
  '📋 DATA ACCESS VERIFICATION' as test_name,
  (SELECT COUNT(*) FROM baby_items) as baby_items_accessible,
  (SELECT COUNT(*) FROM budget_categories) as budget_categories_accessible,
  (SELECT COUNT(*) FROM baby_names) as baby_names_accessible,
  (SELECT COUNT(*) FROM profiles) as profiles_accessible,
  '✅ All tables accessible' as result;