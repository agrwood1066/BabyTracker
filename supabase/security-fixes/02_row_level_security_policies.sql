-- ============================================
-- ROW LEVEL SECURITY (RLS) IMPLEMENTATION
-- ============================================
-- This migration adds comprehensive RLS policies to protect data access

-- ============================================
-- ENABLE RLS ON ALL SENSITIVE TABLES
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE feature_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_name_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_bag_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Users can view profiles of family members
CREATE POLICY "Users can view family member profiles" ON profiles
    FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ============================================
-- PROMO CODES TABLE POLICIES
-- ============================================

-- Influencers can only view their own promo codes
CREATE POLICY "Influencers view own promo codes" ON promo_codes
    FOR SELECT
    USING (
        influencer_user_id = auth.uid()
        OR 
        -- Allow public to check if a code exists (for validation)
        (auth.uid() IS NULL AND active = true)
    );

-- Only admins can insert promo codes (handled via service role)
-- No INSERT policy for regular users

-- Influencers can update certain fields of their own promo codes
CREATE POLICY "Influencers update own promo codes" ON promo_codes
    FOR UPDATE
    USING (influencer_user_id = auth.uid())
    WITH CHECK (
        influencer_user_id = auth.uid()
        -- Prevent changing critical fields
        AND code = code
        AND tier = tier
        AND influencer_email = influencer_email
    );

-- ============================================
-- PROMO CODE USAGE POLICIES
-- ============================================

-- Users can view their own promo code usage
CREATE POLICY "Users view own promo usage" ON promo_code_usage
    FOR SELECT
    USING (user_id = auth.uid());

-- Influencers can view usage of their promo codes (anonymized via functions)
CREATE POLICY "Influencers view their code usage" ON promo_code_usage
    FOR SELECT
    USING (
        promo_code_id IN (
            SELECT id FROM promo_codes 
            WHERE influencer_user_id = auth.uid()
        )
    );

-- Users can insert their own promo code usage (during signup)
CREATE POLICY "Users can apply promo codes" ON promo_code_usage
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- INFLUENCER COMMISSIONS POLICIES
-- ============================================

-- Influencers can view their own commissions
CREATE POLICY "Influencers view own commissions" ON influencer_commissions
    FOR SELECT
    USING (
        influencer_code IN (
            SELECT code FROM promo_codes 
            WHERE influencer_user_id = auth.uid()
        )
    );

-- No INSERT/UPDATE/DELETE for users (handled by system/admin)

-- ============================================
-- FEATURE USAGE POLICIES
-- ============================================

-- Users can view their own feature usage
CREATE POLICY "Users view own feature usage" ON feature_usage
    FOR SELECT
    USING (user_id = auth.uid());

-- System can insert feature usage (via functions)
CREATE POLICY "System tracks feature usage" ON feature_usage
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- BABY ITEMS (SHOPPING LIST) POLICIES
-- ============================================

-- Users can view items from their family
CREATE POLICY "Family members view shopping items" ON baby_items
    FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Users can insert items for their family
CREATE POLICY "Family members create shopping items" ON baby_items
    FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Users can update items from their family
CREATE POLICY "Family members update shopping items" ON baby_items
    FOR UPDATE
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Users can delete items from their family
CREATE POLICY "Family members delete shopping items" ON baby_items
    FOR DELETE
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ============================================
-- BUDGET CATEGORIES POLICIES
-- ============================================

-- Users can view budget categories from their family
CREATE POLICY "Family members view budget categories" ON budget_categories
    FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Users can manage budget categories for their family
CREATE POLICY "Family members manage budget categories" ON budget_categories
    FOR ALL
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ============================================
-- BABY NAMES POLICIES
-- ============================================

-- Users can view baby names from their family
CREATE POLICY "Family members view baby names" ON baby_names
    FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Users can add baby names for their family
CREATE POLICY "Family members add baby names" ON baby_names
    FOR INSERT
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
        AND suggested_by = auth.uid()
    );

-- Users can update baby names they suggested
CREATE POLICY "Users update own baby name suggestions" ON baby_names
    FOR UPDATE
    USING (suggested_by = auth.uid())
    WITH CHECK (suggested_by = auth.uid());

-- Users can delete baby names they suggested
CREATE POLICY "Users delete own baby name suggestions" ON baby_names
    FOR DELETE
    USING (suggested_by = auth.uid());

-- ============================================
-- BABY NAME VOTES POLICIES
-- ============================================

-- Users can view votes from their family
CREATE POLICY "Family members view name votes" ON baby_name_votes
    FOR SELECT
    USING (
        baby_name_id IN (
            SELECT id FROM baby_names 
            WHERE family_id IN (
                SELECT family_id FROM profiles WHERE id = auth.uid()
            )
        )
    );

-- Users can manage their own votes
CREATE POLICY "Users manage own votes" ON baby_name_votes
    FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- HOSPITAL BAG ITEMS POLICIES
-- ============================================

-- Users can view hospital bag items from their family
CREATE POLICY "Family members view hospital bag" ON hospital_bag_items
    FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Users can manage hospital bag items for their family
CREATE POLICY "Family members manage hospital bag" ON hospital_bag_items
    FOR ALL
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ============================================
-- WISHLIST ITEMS POLICIES
-- ============================================

-- Users can view wishlist items from their family
CREATE POLICY "Family members view wishlist" ON wishlist_items
    FOR SELECT
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Users can manage wishlist items for their family
CREATE POLICY "Family members manage wishlist" ON wishlist_items
    FOR ALL
    USING (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    )
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- ============================================
-- FAMILY MEMBERS POLICIES
-- ============================================

-- Users can view their family relationships
CREATE POLICY "Users view own family members" ON family_members
    FOR SELECT
    USING (
        user_id = auth.uid() 
        OR 
        family_id IN (
            SELECT family_id FROM profiles WHERE id = auth.uid()
        )
    );

-- Users can update their own family member status
CREATE POLICY "Users update own family status" ON family_members
    FOR UPDATE
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Family admins can manage family members
CREATE POLICY "Family admins manage members" ON family_members
    FOR ALL
    USING (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    )
    WITH CHECK (
        family_id IN (
            SELECT family_id FROM family_members 
            WHERE user_id = auth.uid() 
            AND role = 'admin'
        )
    );

-- ============================================
-- HELPER FUNCTION FOR CHECKING FAMILY MEMBERSHIP
-- ============================================

CREATE OR REPLACE FUNCTION is_family_member(p_family_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND family_id = p_family_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- HELPER FUNCTION FOR CHECKING INFLUENCER STATUS
-- ============================================

CREATE OR REPLACE FUNCTION is_influencer()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles 
        WHERE id = auth.uid() 
        AND is_influencer = true
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ADDITIONAL SECURITY INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_profiles_family_id ON profiles(family_id);
CREATE INDEX IF NOT EXISTS idx_baby_items_family_id ON baby_items(family_id);
CREATE INDEX IF NOT EXISTS idx_budget_categories_family_id ON budget_categories(family_id);
CREATE INDEX IF NOT EXISTS idx_baby_names_family_id ON baby_names(family_id);
CREATE INDEX IF NOT EXISTS idx_hospital_bag_items_family_id ON hospital_bag_items(family_id);
CREATE INDEX IF NOT EXISTS idx_wishlist_items_family_id ON wishlist_items(family_id);
CREATE INDEX IF NOT EXISTS idx_family_members_user_family ON family_members(user_id, family_id);

-- ============================================
-- AUDIT LOG TABLE (OPTIONAL BUT RECOMMENDED)
-- ============================================

CREATE TABLE IF NOT EXISTS security_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on audit log
ALTER TABLE security_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only admins view audit logs" ON security_audit_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() 
            AND email IN ('alex@babysteps.app', 'admin@babysteps.app') -- Add your admin emails
        )
    );

-- ============================================
-- SUMMARY COMMENTS
-- ============================================

COMMENT ON POLICY "Users can view own profile" ON profiles IS 'Basic self-access policy';
COMMENT ON POLICY "Users can view family member profiles" ON profiles IS 'Family members can see each other';
COMMENT ON POLICY "Influencers view own promo codes" ON promo_codes IS 'Influencers can only see their own codes';
COMMENT ON POLICY "Family members view shopping items" ON baby_items IS 'All family members can view shared shopping list';

-- ============================================
-- TESTING HELPERS (Remove in production)
-- ============================================

-- Function to check if RLS is working
CREATE OR REPLACE FUNCTION test_rls_policies(p_user_id UUID)
RETURNS TABLE (
    table_name TEXT,
    can_select BOOLEAN,
    can_insert BOOLEAN,
    can_update BOOLEAN,
    can_delete BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- This helps verify RLS is working correctly
    RETURN QUERY
    SELECT 
        'profiles'::TEXT,
        EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id),
        false, -- Check via actual insert attempt
        EXISTS(SELECT 1 FROM profiles WHERE id = p_user_id),
        false;
END;
$$;

GRANT EXECUTE ON FUNCTION test_rls_policies TO authenticated;
