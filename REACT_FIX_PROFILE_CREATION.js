// ============================================
// BETTER SOLUTION: Call RPC function after signup
// Update your Landing.js handleAuth function
// ============================================

// Add this helper function at the top of Landing.js (after imports)
const ensureProfileExists = async () => {
  try {
    const { data, error } = await supabase.rpc('ensure_profile_exists');
    
    if (error) {
      console.error('Profile creation error:', error);
      return false;
    }
    
    console.log('Profile check result:', data);
    return data.success;
  } catch (err) {
    console.error('Failed to ensure profile:', err);
    return false;
  }
};

// ============================================
// Update your handleAuth function
// Find the part where signup succeeds and modify:
// ============================================

// BEFORE (current code):
if (signUpData.user) {
  setMessage('Account created! Check your email to verify your account.');
  // ... rest of code
}

// AFTER (new code):
if (signUpData.user) {
  setMessage('Account created! Check your email to verify your account.');
  
  // Ensure profile is created (fallback if trigger didn't work)
  await ensureProfileExists();
  
  // Store promo code if provided
  if (promoCode && signUpData.user.id) {
    try {
      await supabase
        .from('profiles')
        .update({ promo_code_used: promoCode.toUpperCase() })
        .eq('id', signUpData.user.id);
    } catch (promoError) {
      console.log('Could not save promo code:', promoError);
    }
  }
  
  // Auto sign in after 2 seconds
  setTimeout(async () => {
    // ... existing sign in code
  }, 1000);
}

// ============================================
// ALSO: Update AuthCallback.js
// Add profile check after email confirmation
// ============================================

// In AuthCallback.js, after session is established, add:

if (data.session) {
  console.log('✓ Email verified! Session established for:', data.session.user.email);
  
  // Ensure profile exists (in case trigger didn't fire)
  try {
    const { data: profileCheck } = await supabase.rpc('ensure_profile_exists');
    console.log('Profile check:', profileCheck);
  } catch (err) {
    console.error('Profile check failed:', err);
  }
  
  setStatus('success');
  
  // Small delay to show success message, then redirect
  setTimeout(() => {
    navigate('/dashboard');
  }, 1500);
}
