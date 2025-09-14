# 🔧 FIX: Profile Connection Issue After Sign Up

## Problem Summary
After implementing promo code functionality, new sign-ups are not creating corresponding profiles in the Supabase `profiles` table, causing users to see "Unknown" subscription status and no data connection.

## Root Cause
The database trigger `handle_new_user()` that automatically creates profiles when new users sign up is either:
1. Missing or broken
2. Failing silently due to RLS policies
3. Not handling the new promo code fields properly

## Solution Steps

### Step 1: Run SQL Fix in Supabase
1. Open your Supabase dashboard
2. Go to SQL Editor
3. Run the `FIX_PROFILE_CONNECTION.sql` file I created
4. This will:
   - Create profiles for all existing users without profiles
   - Fix RLS policies
   - Recreate the trigger function with better error handling
   - Ensure all tables have proper access policies

### Step 2: Update Dashboard.js
Replace the `loadDashboardData` function in Dashboard.js with the improved version from `DASHBOARD_PROFILE_FIX.js`:

```javascript
// Add this function before the Dashboard component
async function ensureProfileExists(user) {
  try {
    // First, try to get the existing profile
    const { data: existingProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (existingProfile && !fetchError) {
      return { profile: existingProfile, created: false };
    }
    
    // Create new profile if it doesn't exist
    const familyId = crypto.randomUUID();
    const newProfileData = {
      id: user.id,
      email: user.email,
      family_id: familyId,
      subscription_status: 'free',
      subscription_plan: 'free'
    };
    
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert(newProfileData)
      .select()
      .single();
    
    if (insertError) {
      console.error('Error creating profile:', insertError);
      // Handle duplicate key error
      if (insertError.code === '23505') {
        const { data: retryProfile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (retryProfile) {
          return { profile: retryProfile, created: false };
        }
      }
      throw insertError;
    }
    
    return { profile: newProfile, created: true };
  } catch (error) {
    console.error('Failed to ensure profile exists:', error);
    // Return minimal profile as fallback
    return {
      profile: {
        id: user.id,
        email: user.email,
        family_id: crypto.randomUUID(),
        subscription_status: 'free'
      },
      error: true
    };
  }
}
```

Then update the useEffect in Dashboard to use this function:

```javascript
useEffect(() => {
  async function loadDashboardData() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/');
        return;
      }
      
      // Use the enhanced profile ensuring function
      const { profile: currentProfile } = await ensureProfileExists(user);
      
      setProfile(currentProfile);
      
      // Rest of your existing code...
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  }
  
  loadDashboardData();
}, [navigate]);
```

### Step 3: Fix Landing.js Sign Up Process
The sign up in Landing.js should be simplified. The promo code handling might be interfering:

```javascript
// In handleAuth function for sign up
if (isSignUpForm) {
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password: password
  });

  if (signUpError) {
    // Handle error
    return;
  }

  if (signUpData?.user) {
    // Only try to apply promo code if user was created
    if (promoCode && signUpData.user.id) {
      try {
        // Apply promo code but don't let it break signup
        await handlePromoCodeAfterSignup(supabase, signUpData.user.id, promoCode);
      } catch (promoError) {
        console.error('Promo code application failed:', promoError);
        // Continue anyway - user is created
      }
    }
    
    // Success - redirect to dashboard
    setMessage('Account created! Check your email to verify.');
    // Auto-switch to login after short delay
    setTimeout(() => {
      setShowSignUp(false);
      setShowLogin(true);
    }, 2000);
  }
}
```

### Step 4: Verify the Fix

After applying these changes:

1. **Test with a new account:**
   - Sign up with a new email
   - Check Supabase dashboard to see if profile was created
   - Log in and verify data loads

2. **Check existing accounts:**
   - Log in with an existing account
   - Verify profile data appears correctly

3. **Run verification query in Supabase:**
```sql
-- Check all users have profiles
SELECT 
  au.id,
  au.email,
  CASE WHEN p.id IS NOT NULL THEN '✅ Has Profile' ELSE '❌ Missing Profile' END as status
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.id
ORDER BY au.created_at DESC;
```

## Files Created

1. **FIX_PROFILE_CONNECTION.sql** - Complete SQL fix to run in Supabase
2. **DASHBOARD_PROFILE_FIX.js** - Improved Dashboard profile handling code
3. **This guide** - Step-by-step instructions

## Why This Happened

The promo code implementation likely introduced changes that:
1. Modified the signup metadata in a way the trigger didn't expect
2. Changed RLS policies that prevented profile creation
3. Added fields to the profiles table that the trigger wasn't handling

This fix ensures profiles are created both:
- Automatically via database trigger (preferred)
- As a fallback in the Dashboard if needed

## Prevention

To prevent this in future:
1. Always test sign up flow after database changes
2. Include profile creation verification in your test suite
3. Have fallback profile creation in the frontend
4. Monitor for missing profiles regularly

## Need Help?

If the issue persists after applying these fixes:
1. Check Supabase logs for specific errors
2. Verify RLS is enabled on the profiles table
3. Ensure the authenticated role has proper permissions
4. Test with RLS disabled temporarily to isolate the issue
