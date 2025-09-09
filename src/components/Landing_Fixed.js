// LANDING COMPONENT FIX: Better password validation
// This fixes the "string did not match expected pattern" error

// Replace the password inputs in the Landing.js file with these improved versions:

// For Login Modal (around line 950):
<input
  type="password"
  placeholder="Password"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  minLength={6}
  title="Password must be at least 6 characters long"
  onInvalid={(e) => {
    if (e.target.validity.tooShort) {
      e.target.setCustomValidity('Password must be at least 6 characters long');
    } else {
      e.target.setCustomValidity('');
    }
  }}
  onInput={(e) => e.target.setCustomValidity('')}
/>

// For Sign Up Modal (around line 990):
<input
  type="password"
  placeholder="Password (min 6 characters)"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  required
  minLength={6}
  title="Password must be at least 6 characters long"
  onInvalid={(e) => {
    if (e.target.validity.tooShort) {
      e.target.setCustomValidity('Password must be at least 6 characters long');
    } else {
      e.target.setCustomValidity('');
    }
  }}
  onInput={(e) => e.target.setCustomValidity('')}
/>

// Alternative: Add client-side validation before form submission
const handleAuth = async (e, isSignUpForm) => {
  e.preventDefault();
  setLoading(true);
  setMessage('');

  // Add password validation
  if (password.length < 6) {
    setMessage('Password must be at least 6 characters long');
    setLoading(false);
    return;
  }

  try {
    if (isSignUpForm) {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        setMessage('Account created successfully! Please check your email for verification.');
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) throw error;
      if (data.user) {
        setMessage('Welcome back!');
      }
    }
  } catch (error) {
    setMessage(error.message);
  } finally {
    setLoading(false);
  }
};
