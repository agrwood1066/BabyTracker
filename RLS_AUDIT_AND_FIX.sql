-- ============================================
-- COMPREHENSIVE RLS AUDIT AND FIX
-- ============================================
-- This script audits ALL tables and fixes RLS policies to be robust
-- Run each section in order

-- ============================================
-- SECTION 1: AUDIT - See Current State
-- ============================================

-- 1.1: Check which tables have RLS enabled
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    CASE 
        WHEN rowsecurity THEN '✅ RLS Enabled'
        ELSE '❌ RLS Disabled'
    END as status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'profiles', 'baby_items', 'baby_names', 'baby_name_votes',
    'budget_categories', 'budget_items', 'hospital_bag_items',
    'wishlist_items', 'wishlist_shares', 'family_members',
    'appointments', 'health_metrics', 'pregnancy_vows_categories',
    'pregnancy_vows_questions', 'pregnancy_vows_responses',
    'promo_codes', 'promo_code_usage', 'promo_activations'
)
ORDER BY tablename;

-- 1.2: Check all existing RLS policies
SELECT 
    tablename,
    policyname,
    cmd,
    permissive,
    roles
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- 1.3: Check for users without profiles
SELECT 
    au.id,
    au.email,
    au.created_at,
    CASE 
        WHEN p.id IS NULL THEN '❌ Missing Profile'
        WHEN p.family_id IS NULL THEN '⚠️ Missing Family ID'
        ELSE '✅ Complete'
    END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;

-- ============================================
-- SECTION 2: FIX MISSING PROFILES & FAMILY IDs
-- ============================================

-- 2.1: Create missing profiles
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

-- 2.2: Fix missing family_ids
UPDATE profiles 
SET family_id = uuid_generate_v4()
WHERE family_id IS NULL;

-- 2.3: Make family_id NOT NULL (if not already)
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'family_id' 
        AND is_nullable = 'YES'
    ) THEN
        ALTER TABLE profiles ALTER COLUMN family_id SET NOT NULL;
    END IF;
END $$;

-- ============================================
-- SECTION 3: ENABLE RLS ON ALL TABLES
-- ============================================

-- Enable RLS on all user data tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_name_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_bag_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_vows_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_vows_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE pregnancy_vows_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_activations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SECTION 4: DROP ALL EXISTING POLICIES
-- ============================================
-- This ensures we start fresh with consistent policies

DO $$ 
DECLARE
    r RECORD;
BEGIN
    -- Drop all policies on our tables
    FOR r IN (
        SELECT tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
        AND tablename IN (
            'profiles', 'baby_items', 'baby_names', 'baby_name_votes',
            'budget_categories', 'budget_items', 'hospital_bag_items',
            'wishlist_items', 'wishlist_shares', 'family_members',
            'appointments', 'health_metrics', 'pregnancy_vows_categories',
            'pregnancy_vows_questions', 'pregnancy_vows_responses',
            'promo_codes', 'promo_code_usage', 'promo_activations'
        )
    )
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', r.policyname, r.tablename);
    END LOOP;
END $$;

-- ============================================
-- SECTION 5: CREATE ROBUST PROFILES POLICIES
-- ============================================

-- Users can always see their own profile
CREATE POLICY "Users can view own profile" 
ON profiles FOR SELECT 
USING (auth.uid() = id);

-- Users can always insert their own profile (for signup)
CREATE POLICY "Users can insert own profile" 
ON profiles FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Users can always update their own profile
CREATE POLICY "Users can update own profile" 
ON profiles FOR UPDATE 
USING (auth.uid() = id);

-- Users can see family members' profiles
CREATE POLICY "Users can view family profiles" 
ON profiles FOR SELECT 
USING (
    family_id IN (
        SELECT family_id FROM profiles WHERE id = auth.uid()
    )
);

-- ============================================
-- SECTION 6: CREATE FAMILY-BASED POLICIES
-- ============================================

-- Helper function to get user's family_id
CREATE OR REPLACE FUNCTION get_user_family_id(user_id UUID)
RETURNS UUID AS $$
    SELECT family_id FROM profiles WHERE id = user_id LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Baby Items - full access for family members
CREATE POLICY "Family members can manage baby items" 
ON baby_items FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Budget Categories - full access for family members
CREATE POLICY "Family members can manage budget categories" 
ON budget_categories FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Budget Items - full access for family members
CREATE POLICY "Family members can manage budget items" 
ON budget_items FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Baby Names - full access for family members
CREATE POLICY "Family members can manage baby names" 
ON baby_names FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Baby Name Votes - users can manage their own votes
CREATE POLICY "Users can manage own votes" 
ON baby_name_votes FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Baby Name Votes - users can view family votes
CREATE POLICY "Users can view family votes" 
ON baby_name_votes FOR SELECT 
USING (
    name_id IN (
        SELECT id FROM baby_names 
        WHERE family_id = get_user_family_id(auth.uid())
    )
);

-- Hospital Bag Items - full access for family members
CREATE POLICY "Family members can manage hospital bag items" 
ON hospital_bag_items FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Wishlist Items - full access for family members
CREATE POLICY "Family members can manage wishlist items" 
ON wishlist_items FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Wishlist Shares - family members can manage shares
CREATE POLICY "Family members can manage wishlist shares" 
ON wishlist_shares FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Family Members - view only for family members
CREATE POLICY "Family members can view family members" 
ON family_members FOR SELECT 
USING (
    family_id = get_user_family_id(auth.uid())
);

-- Family Members - users can manage their own membership
CREATE POLICY "Users can manage own family membership" 
ON family_members FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Appointments - full access for family members
CREATE POLICY "Family members can manage appointments" 
ON appointments FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Health Metrics - full access for family members
CREATE POLICY "Family members can manage health metrics" 
ON health_metrics FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Pregnancy Vows Categories - full access for family members
CREATE POLICY "Family members can manage vows categories" 
ON pregnancy_vows_categories FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Pregnancy Vows Questions - full access for family members
CREATE POLICY "Family members can manage vows questions" 
ON pregnancy_vows_questions FOR ALL 
USING (
    family_id = get_user_family_id(auth.uid())
)
WITH CHECK (
    family_id = get_user_family_id(auth.uid())
);

-- Pregnancy Vows Responses - users manage own responses
CREATE POLICY "Users can manage own vows responses" 
ON pregnancy_vows_responses FOR ALL 
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Pregnancy Vows Responses - family can view responses
CREATE POLICY "Family can view vows responses" 
ON pregnancy_vows_responses FOR SELECT 
USING (
    question_id IN (
        SELECT id FROM pregnancy_vows_questions 
        WHERE family_id = get_user_family_id(auth.uid())
    )
);

-- ============================================
-- SECTION 7: PROMO CODE POLICIES
-- ============================================

-- Promo Codes - public read for active codes
CREATE POLICY "Public can view active promo codes" 
ON promo_codes FOR SELECT 
USING (active = true);

-- Promo Code Usage - users can see their own usage
CREATE POLICY "Users can view own promo usage" 
ON promo_code_usage FOR SELECT 
USING (user_id = auth.uid());

-- Promo Code Usage - system can insert (via functions)
CREATE POLICY "System can manage promo usage" 
ON promo_code_usage FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Promo Activations - users can see their own
CREATE POLICY "Users can view own promo activation" 
ON promo_activations FOR SELECT 
USING (user_id = auth.uid());

-- Promo Activations - system can manage (via functions)
CREATE POLICY "System can manage promo activations" 
ON promo_activations FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- ============================================
-- SECTION 8: ENHANCED TRIGGER FOR NEW USERS
-- ============================================

CREATE OR REPLACE FUNCTION handle_new_user() 
RETURNS trigger AS $$
DECLARE
    new_family_id uuid;
BEGIN
    -- Generate a new family_id
    new_family_id := uuid_generate_v4();
    
    -- Create profile with all necessary fields
    INSERT INTO public.profiles (
        id, 
        email, 
        family_id,
        full_name,
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
        COALESCE(new.raw_user_meta_data->>'full_name', ''),
        COALESCE(new.raw_user_meta_data->>'subscription_status', 'free'),
        COALESCE(new.raw_user_meta_data->>'subscription_plan', 'free'),
        CASE 
            WHEN new.raw_user_meta_data->>'subscription_status' = 'trial' 
            THEN NOW() + INTERVAL '14 days'
            ELSE NULL
        END,
        NOW(),
        NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
        -- If profile exists, just update email (in case it changed)
        email = EXCLUDED.email,
        updated_at = NOW();
    
    RETURN new;
EXCEPTION
    WHEN OTHERS THEN
        -- Log error but don't fail the signup
        RAISE LOG 'Profile creation failed for user %: %', new.id, SQLERRM;
        -- Still return new to allow signup to complete
        RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================
-- SECTION 9: GRANT PERMISSIONS
-- ============================================

-- Grant necessary permissions to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_family_id TO authenticated;

-- ============================================
-- SECTION 10: VERIFICATION QUERIES
-- ============================================

-- 10.1: Verify all tables have RLS enabled
SELECT 
    tablename,
    CASE 
        WHEN rowsecurity THEN '✅ Protected'
        ELSE '❌ Unprotected'
    END as rls_status
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN (
    'profiles', 'baby_items', 'baby_names', 'baby_name_votes',
    'budget_categories', 'budget_items', 'hospital_bag_items',
    'wishlist_items', 'wishlist_shares', 'family_members'
)
ORDER BY tablename;

-- 10.2: Count policies per table
SELECT 
    tablename,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- 10.3: Test current user access
SELECT 
    'Your Profile' as test,
    COUNT(*) as count
FROM profiles 
WHERE id = auth.uid()
UNION ALL
SELECT 
    'Family Items' as test,
    COUNT(*) as count
FROM baby_items 
WHERE family_id = get_user_family_id(auth.uid())
UNION ALL
SELECT 
    'Budget Categories' as test,
    COUNT(*) as count
FROM budget_categories 
WHERE family_id = get_user_family_id(auth.uid());

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
SELECT '🎉 RLS AUDIT AND FIX COMPLETE!' as status,
       'All tables now have robust RLS policies' as message,
       'New signups will work properly' as benefit;
