# 🔒 Influencer Dashboard Security Migration Guide

## Overview
This migration adds authentication requirements and Row Level Security (RLS) to protect influencer data and ensure only authorized users can access their dashboards.

## 🚀 Migration Steps

### Step 1: Backup Current Data
```sql
-- Create backup of current promo codes
CREATE TABLE promo_codes_backup AS SELECT * FROM promo_codes;
CREATE TABLE profiles_backup AS SELECT * FROM profiles;
```

### Step 2: Run Database Migrations

Run these SQL files in order:

1. **Authentication Setup** (`01_add_influencer_authentication.sql`)
   - Adds `influencer_user_id` to link codes to accounts
   - Creates claim functions for influencers
   - Updates RPC functions to require authentication

2. **Row Level Security** (`02_row_level_security_policies.sql`)
   - Enables RLS on all tables
   - Creates policies for data access control
   - Adds helper functions for authorization

```bash
# Via Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of 01_add_influencer_authentication.sql
3. Run the query
4. Repeat for 02_row_level_security_policies.sql

# Or via CLI:
supabase db push --file supabase/security-fixes/01_add_influencer_authentication.sql
supabase db push --file supabase/security-fixes/02_row_level_security_policies.sql
```

### Step 3: Update Frontend Code

The updated `InfluencerDashboard.js` now includes:
- Authentication modal for login/signup
- Promo code claiming process
- Secure API calls with user context
- Better error handling

### Step 4: Test the Migration

#### Test Authentication Flow:
1. Visit `/influencer/[CODE]` without being logged in
2. Should see authentication modal
3. Sign up with email linked to promo code
4. Code should be claimed automatically
5. Dashboard should load with data

#### Test Security:
```javascript
// Test unauthorized access (should fail)
const { data, error } = await supabase
  .rpc('get_influencer_stats_secure', {
    p_user_id: 'wrong-user-id',
    p_code: 'SOMEONE-ELSES-CODE'
  });
// Should return: "Unauthorized: You do not have access to this promo code"
```

### Step 5: Notify Existing Influencers

Send email to influencers with unclaimed codes:

```sql
-- Find influencers who need to claim their codes
SELECT 
  influencer_name,
  influencer_email,
  code
FROM promo_codes
WHERE influencer_user_id IS NULL
  AND influencer_email IS NOT NULL
  AND active = true;
```

Email template:
```
Subject: Action Required: Secure Your Baby Steps Influencer Dashboard

Hi [Name],

We've upgraded our influencer dashboard with enhanced security features. 
To continue accessing your dashboard, please:

1. Visit: https://babysteps.app/influencer/[YOUR-CODE]
2. Click "Create Account"
3. Sign up using this email address: [their-email]
4. Your dashboard will be automatically linked to your account

Benefits of the upgrade:
✅ Secure, private access to your stats
✅ Protection of your commission data
✅ Enhanced tracking features
✅ Mobile-friendly authentication

Questions? Reply to this email.

Best,
Baby Steps Team
```

## 🔍 Verification Checklist

### Database Verification:
- [ ] RLS is enabled on all sensitive tables
- [ ] Influencer functions require authentication
- [ ] Promo codes have `influencer_user_id` column
- [ ] Test data has been removed from production

### Frontend Verification:
- [ ] Authentication modal appears for non-logged-in users
- [ ] Sign up process claims promo code correctly
- [ ] Dashboard only loads for code owner
- [ ] Error messages are user-friendly
- [ ] Sign out functionality works

### Security Verification:
- [ ] Cannot access another influencer's dashboard
- [ ] Cannot view other users' data
- [ ] API calls fail without authentication
- [ ] Anonymization is improved (MD5 hash vs substring)

## 🐛 Troubleshooting

### Issue: "Unauthorized" error after login
**Solution:** Check that the promo code's `influencer_user_id` matches the logged-in user

### Issue: Can't claim promo code
**Solution:** Verify email matches `influencer_email` in promo_codes table

### Issue: RLS blocking legitimate access
**Solution:** Check policy definitions and user's family_id/role

### Issue: Old functions still accessible
**Solution:** Revoke permissions on old functions:
```sql
REVOKE EXECUTE ON FUNCTION get_influencer_stats FROM anon;
REVOKE EXECUTE ON FUNCTION get_influencer_journey FROM anon;
REVOKE EXECUTE ON FUNCTION get_influencer_weekly_stats FROM anon;
```

## 🔄 Rollback Plan

If issues arise, rollback with:

```sql
-- Disable RLS (temporary)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE promo_codes DISABLE ROW LEVEL SECURITY;
-- etc. for other tables

-- Restore old functions
DROP FUNCTION IF EXISTS get_influencer_stats_secure;
DROP FUNCTION IF EXISTS get_influencer_journey_secure;
DROP FUNCTION IF EXISTS get_influencer_weekly_stats_secure;

-- Revert to backup tables if needed
DROP TABLE promo_codes;
ALTER TABLE promo_codes_backup RENAME TO promo_codes;
```

## 📊 Monitoring

Monitor for:
- Failed authentication attempts
- RLS policy violations in logs
- Unusual access patterns
- Performance impact of RLS

```sql
-- Check for unclaimed codes
SELECT COUNT(*) as unclaimed_count
FROM promo_codes
WHERE influencer_user_id IS NULL
  AND influencer_email IS NOT NULL;

-- Check for failed auth attempts (if logging)
SELECT * FROM security_audit_log
WHERE action = 'auth_failed'
  AND created_at > NOW() - INTERVAL '24 hours';
```

## ✅ Post-Migration Tasks

1. **Update Documentation**
   - API documentation with new auth requirements
   - Influencer onboarding guide
   - Security best practices

2. **Set Up Monitoring**
   - Alert for multiple failed auth attempts
   - Track dashboard usage patterns
   - Monitor commission calculations

3. **Schedule Security Review**
   - Weekly review for first month
   - Check for any bypassed policies
   - Validate commission calculations

## 🎉 Success Criteria

The migration is successful when:

1. **Authentication Working**
   - ✅ Influencers can sign up and claim their codes
   - ✅ Login/logout works smoothly
   - ✅ Dashboard requires authentication

2. **Data Security**
   - ✅ Each influencer sees only their own data
   - ✅ RLS policies prevent unauthorized access
   - ✅ Commission data is protected

3. **Performance**
   - ✅ Dashboard loads in < 2 seconds
   - ✅ No timeout errors from RLS checks
   - ✅ Database queries remain efficient

4. **User Experience**
   - ✅ Clear error messages for auth issues
   - ✅ Smooth onboarding for new influencers
   - ✅ Mobile-responsive auth flow

## 📝 Additional Security Recommendations

### 1. Add Rate Limiting
```sql
-- Create rate limiting table
CREATE TABLE IF NOT EXISTS rate_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id),
    action TEXT,
    attempts INTEGER DEFAULT 1,
    window_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to check rate limits
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_user_id UUID,
    p_action TEXT,
    p_max_attempts INTEGER DEFAULT 10,
    p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN AS $$
DECLARE
    v_attempts INTEGER;
BEGIN
    -- Count attempts in current window
    SELECT COUNT(*) INTO v_attempts
    FROM rate_limits
    WHERE user_id = p_user_id
    AND action = p_action
    AND window_start > NOW() - (p_window_minutes || ' minutes')::INTERVAL;
    
    IF v_attempts >= p_max_attempts THEN
        RETURN FALSE; -- Rate limit exceeded
    END IF;
    
    -- Log this attempt
    INSERT INTO rate_limits (user_id, action)
    VALUES (p_user_id, p_action);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 2. Add Session Management
```javascript
// In InfluencerDashboard.js
const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes

useEffect(() => {
  let sessionTimer;
  
  const resetSessionTimer = () => {
    clearTimeout(sessionTimer);
    sessionTimer = setTimeout(() => {
      alert('Session expired. Please log in again.');
      supabase.auth.signOut();
    }, SESSION_TIMEOUT);
  };
  
  // Reset timer on user activity
  window.addEventListener('mousemove', resetSessionTimer);
  window.addEventListener('keypress', resetSessionTimer);
  
  return () => {
    clearTimeout(sessionTimer);
    window.removeEventListener('mousemove', resetSessionTimer);
    window.removeEventListener('keypress', resetSessionTimer);
  };
}, []);
```

### 3. Add Two-Factor Authentication (Future)
```sql
-- Add 2FA fields to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS two_factor_secret TEXT,
ADD COLUMN IF NOT EXISTS backup_codes TEXT[];
```

### 4. Implement Audit Logging
```sql
-- Create audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO security_audit_log (
        user_id,
        action,
        table_name,
        record_id,
        old_data,
        new_data,
        created_at
    ) VALUES (
        auth.uid(),
        TG_OP,
        TG_TABLE_NAME,
        CASE 
            WHEN TG_OP = 'DELETE' THEN OLD.id
            ELSE NEW.id
        END,
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        NOW()
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to sensitive tables
CREATE TRIGGER audit_promo_codes
    AFTER INSERT OR UPDATE OR DELETE ON promo_codes
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_influencer_commissions
    AFTER INSERT OR UPDATE OR DELETE ON influencer_commissions
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();
```

## 🚨 Emergency Contacts

- **Database Issues**: admin@supabase.io
- **Security Concerns**: security@babysteps.app
- **Influencer Support**: partners@babysteps.app

## 📅 Timeline

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 1 | Database Migration | 1 hour | ⏳ Ready |
| 2 | Frontend Deployment | 30 mins | ⏳ Ready |
| 3 | Testing & Verification | 2 hours | ⏳ Pending |
| 4 | Influencer Communication | 1 day | ⏳ Pending |
| 5 | Monitoring & Support | Ongoing | ⏳ Pending |

## 🎯 Next Steps

1. **Immediate Actions**
   - Run migrations in staging environment first
   - Test with dummy influencer accounts
   - Prepare influencer communications

2. **Within 24 Hours**
   - Deploy to production
   - Send notifications to influencers
   - Monitor for issues

3. **Within 1 Week**
   - Gather feedback from influencers
   - Address any pain points
   - Document lessons learned

4. **Long-term**
   - Implement 2FA for high-value accounts
   - Add more granular permissions
   - Regular security audits

---

**Last Updated**: January 2025  
**Version**: 1.0  
**Author**: Baby Steps Security Team  
**Status**: Ready for Implementation
