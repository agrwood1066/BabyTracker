# 🔒 RLS Robustness Guide for Baby Tracker

## Executive Summary
Your RLS policies are likely causing issues because they're inconsistent and some tables may not have proper policies. This guide provides a complete audit and fix to make your app robust for future account creation.

## 🚨 Current Issues Identified

### 1. **Inconsistent RLS Policies**
- Some tables have complex nested queries that can fail
- Policies rely on profiles table existing, but new users don't have profiles immediately
- Missing policies on some tables

### 2. **Profile Creation Race Condition**
- Sign up creates auth.users record
- Trigger should create profiles record
- But RLS policies block the trigger from working
- Dashboard tries to create profile but RLS blocks that too

### 3. **Family ID Dependencies**
- Many tables require family_id to exist
- But family_id might be NULL for new users
- Cascading failures when family_id is missing

## ✅ The Complete Fix

I've created three SQL scripts to fix everything:

### 1. **RLS_AUDIT_AND_FIX.sql** - Complete Overhaul
Run this FIRST. It will:
- Create missing profiles for ALL users
- Fix missing family_ids
- Enable RLS on all tables
- Create consistent, simple policies
- Add a helper function for family access
- Fix the new user trigger
- Grant proper permissions

### 2. **RLS_TEST_SCRIPT.sql** - Verification
Run this AFTER the fix to verify:
- Profile creation works
- Users can access their data
- Family members can share data
- Cross-user isolation works
- All policies are active

### 3. **RLS_MONITORING.sql** - Ongoing Monitoring
Set up monitoring to catch issues early.

## 🛠 Implementation Steps

### Step 1: Backup Your Database
```sql
-- In Supabase Dashboard, go to Settings > Backups
-- Create a manual backup before making changes
```

### Step 2: Run the Audit & Fix
1. Open Supabase SQL Editor
2. Copy contents of `RLS_AUDIT_AND_FIX.sql`
3. Run the entire script
4. Check for any errors in the output

### Step 3: Test the Fix
1. Run `RLS_TEST_SCRIPT.sql`
2. All tests should show ✅ PASS
3. The summary should show "ALL TESTS PASS"

### Step 4: Test New Sign Ups
1. Create a test account with a new email
2. Check Supabase dashboard - profile should exist
3. Log in - data should load properly

## 🔑 Key Changes Made

### 1. **Simplified RLS Policies**
Before (Complex):
```sql
CREATE POLICY "Users can access family items" ON baby_items
USING (
  family_id IN (
    SELECT family_id FROM profiles WHERE id = auth.uid()
  )
);
```

After (Simple with helper):
```sql
CREATE POLICY "Family members can manage baby items" ON baby_items
USING (family_id = get_user_family_id(auth.uid()));
```

### 2. **Robust Profile Creation**
- Trigger handles errors gracefully
- Dashboard has fallback creation
- Family_id is always generated

### 3. **Consistent Pattern**
All tables now follow the same pattern:
- Users access their own data (user_id = auth.uid())
- Families share data (family_id = get_user_family_id(auth.uid()))
- Public data has explicit policies

## 📊 Monitoring Setup

Add this monitoring query to run weekly:

```sql
-- RLS MONITORING SCRIPT
-- Run weekly to catch issues early

-- Check for users without profiles
SELECT 
    'Missing Profiles' as check_type,
    COUNT(*) as issue_count,
    STRING_AGG(au.email, ', ') as affected_users
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
WHERE p.id IS NULL
GROUP BY check_type

UNION ALL

-- Check for profiles without family_id
SELECT 
    'Missing Family IDs' as check_type,
    COUNT(*) as issue_count,
    STRING_AGG(email, ', ') as affected_users
FROM profiles
WHERE family_id IS NULL
GROUP BY check_type

UNION ALL

-- Check for tables without RLS
SELECT 
    'Tables Without RLS' as check_type,
    COUNT(*) as issue_count,
    STRING_AGG(tablename, ', ') as affected_tables
FROM pg_tables
WHERE schemaname = 'public'
AND rowsecurity = false
AND tablename IN (
    'profiles', 'baby_items', 'baby_names',
    'budget_categories', 'hospital_bag_items'
)
GROUP BY check_type;
```

## 🚀 Prevention Best Practices

### 1. **Always Test After Database Changes**
```javascript
// Add to your test suite
describe('RLS Tests', () => {
  it('should create profile on signup', async () => {
    const { user } = await signUp('test@example.com', 'password');
    const profile = await getProfile(user.id);
    expect(profile).toBeDefined();
    expect(profile.family_id).toBeDefined();
  });
});
```

### 2. **Use Database Migrations**
Track all RLS changes in migration files:
```sql
-- migrations/001_rls_policies.sql
-- migrations/002_fix_family_access.sql
-- etc.
```

### 3. **Monitor Production**
Set up alerts for:
- Users without profiles
- Failed profile creations
- RLS policy violations

## 🎯 Expected Outcomes

After implementing these fixes:

1. **New Users**: Profile created automatically on signup
2. **Existing Users**: All have profiles with family_ids
3. **Data Access**: Users can access all their family data
4. **Isolation**: Users cannot see other families' data
5. **Performance**: Simplified policies run faster
6. **Monitoring**: Issues detected before users report them

## 🆘 Troubleshooting

### Issue: "User cannot insert profile"
**Solution**: Run Section 5 of RLS_AUDIT_AND_FIX.sql

### Issue: "Cannot access family data"
**Solution**: Check family_id exists, run Section 2 of fix

### Issue: "New signups failing"
**Solution**: Check trigger exists, run Section 8 of fix

### Issue: "Dashboard shows no data"
**Solution**: Verify RLS policies, run test script

## 📝 Checklist

Before considering RLS fixed:

- [ ] All users have profiles
- [ ] All profiles have family_ids
- [ ] RLS enabled on all tables
- [ ] Test script shows all PASS
- [ ] New signup creates profile
- [ ] Dashboard loads data
- [ ] Family sharing works
- [ ] Cross-user isolation verified
- [ ] Monitoring query runs clean
- [ ] Production tested

## 🔐 Security Notes

The fixes maintain security while improving reliability:
- Users still only see their own data
- Family sharing remains intact
- No backdoors or bypasses added
- Trigger runs with SECURITY DEFINER safely
- Helper function doesn't expose data

## 📈 Performance Impact

The simplified policies actually improve performance:
- Fewer nested queries
- Single helper function cached
- Consistent patterns optimize better
- Less complexity = faster execution

## 🎉 Success Criteria

You'll know RLS is properly fixed when:
1. Zero "missing profile" errors
2. All new signups work immediately
3. No support tickets about data access
4. Test script shows 100% pass rate
5. Monitoring finds no issues for 30 days

---

**Status**: Complete Guide
**Files**: RLS_AUDIT_AND_FIX.sql, RLS_TEST_SCRIPT.sql, RLS_MONITORING.sql
**Risk**: Low (includes rollback options)
**Time**: 30 minutes to implement
