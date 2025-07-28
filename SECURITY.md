# Security Implementation Guide

## 🔒 Overview

This document contains the complete Row Level Security (RLS) implementation for the Baby Tracker application. **These policies are CRITICAL for production deployment** and must be implemented to protect user data.

## ⚠️ CRITICAL: Run Before Production

**Without these policies, all authenticated users can access all data from all families.** This would be a severe privacy breach.

## 🛡️ Complete SQL Security Policies

Run this complete SQL script in your Supabase SQL Editor:

```sql
-- ============================================
-- BABY TRACKER COMPLETE SECURITY SETUP
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable Row Level Security on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishlist_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE hospital_bag_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_names ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_name_votes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- PROFILES TABLE POLICIES
-- ============================================

-- Users can view and edit their own profile
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
FOR UPDATE USING (auth.uid() = id);

-- Users can view profiles in their family
CREATE POLICY "Users can view family profiles" ON profiles
FOR SELECT USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Users can insert their own profile (for new accounts)
CREATE POLICY "Users can insert own profile" ON profiles
FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- FAMILY DATA POLICIES
-- ============================================

-- Budget Categories
CREATE POLICY "Users can access family budget categories" ON budget_categories
FOR ALL USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Baby Items (Shopping List)
CREATE POLICY "Users can access family baby items" ON baby_items
FOR ALL USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Wishlist Items
CREATE POLICY "Users can access family wishlist" ON wishlist_items
FOR ALL USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Allow public access to wishlist items via share token
CREATE POLICY "Public can view shared wishlist items" ON wishlist_items
FOR SELECT USING (
  is_public = true AND 
  family_id IN (
    SELECT family_id FROM wishlist_shares 
    WHERE share_token = current_setting('request.jwt.claims', true)::json->>'share_token'
  )
);

-- Wishlist Shares
CREATE POLICY "Users can manage family wishlist shares" ON wishlist_shares
FOR ALL USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Hospital Bag Items
CREATE POLICY "Users can access family hospital bag" ON hospital_bag_items
FOR ALL USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Baby Names
CREATE POLICY "Users can access family baby names" ON baby_names
FOR ALL USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- Baby Name Votes
CREATE POLICY "Users can access family name votes" ON baby_name_votes
FOR ALL USING (
  name_id IN (
    SELECT id FROM baby_names 
    WHERE family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  )
);

-- Family Members
CREATE POLICY "Users can access family members" ON family_members
FOR ALL USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Run this to verify all policies are active
SELECT 
  tablename, 
  policyname, 
  cmd,
  CASE 
    WHEN qual LIKE '%auth.uid() IS NOT NULL%' AND qual NOT LIKE '%family_id%' THEN '🚨 INSECURE'
    WHEN qual LIKE '%family_id%' OR qual LIKE '%auth.uid() = id%' THEN '✅ SECURE'
    ELSE '⚠️ CHECK'
  END as security_status
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN (
  'profiles', 'budget_categories', 'baby_items', 'wishlist_items', 
  'hospital_bag_items', 'baby_names', 'baby_name_votes', 'family_members', 'wishlist_shares'
)
ORDER BY tablename, policyname;
```

## ✅ Expected Results

After running the above SQL, your verification query should show:
- **✅ SECURE** for all family-based data policies
- **⚠️ CHECK** for individual profile policies (this is correct)
- **🚨 INSECURE** should appear - if it does, you have insecure policies that need removal

## 🧪 Security Testing

### Test 1: Data Isolation
1. Create two test accounts
2. Add data to Account A (budget items, baby names, etc.)
3. Log in to Account B
4. Verify Account B **cannot see** Account A's data

### Test 2: Profile Privacy
1. Log in to Account A, note the user ID
2. Log in to Account B
3. Try to access Account A's profile directly
4. Should be **blocked**

### Test 3: Family Sharing
1. Add a family member to Account A
2. Verify family member **can** see Account A's data
3. Verify family member **cannot** see unrelated Account B's data

## 🚨 Security Incidents

If you discover a security issue:

1. **Immediate**: Disable public access until fixed
2. **Audit**: Check Supabase logs for unauthorized access
3. **Fix**: Re-run security policies
4. **Verify**: Run complete security tests
5. **Monitor**: Watch for unusual access patterns

## 📞 Support

For security-related issues:
- Check Supabase dashboard for policy status
- Verify environment variables are correctly set
- Ensure NODE_ENV=production in deployment
- Test with multiple accounts to verify isolation

## ⚡ Quick Security Checklist

Before going live:
- [ ] All RLS policies created and active
- [ ] Verification query shows ✅ SECURE for family data
- [ ] Cross-account testing completed
- [ ] Environment variables secured
- [ ] API keys domain-restricted
- [ ] HTTPS enforced
- [ ] Console logging disabled in production

---

**🛡️ Security Status: PRODUCTION READY** when all items above are completed.
