import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [promoMessage, setPromoMessage] = useState('');

  // Check URL params for promo code and email pre-filling
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const emailParam = urlParams.get('email');
    const signupParam = urlParams.get('signup');
    
    if (code) {
      setPromoCode(code.toUpperCase());
      setIsSignUp(true);
    }
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    
    if (signupParam === 'true') {
      setIsSignUp(true);
    }
  }, []);

  // Helper function to ensure profile exists
  const ensureProfileExists = async (userId, userEmail) => {
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', userId)
        .single();

      if (existingProfile) {
        console.log('Profile already exists');
        return true;
      }

      // Profile doesn't exist, create it manually
      console.log('Profile missing, creating manually...');
      const { error: insertError } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: userEmail,
            subscription_status: 'trial',
            subscription_plan: 'free',
            trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          }
        ]);

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return false;
      }

      console.log('Profile created successfully');
      return true;
    } catch (error) {
      console.error('Error in ensureProfileExists:', error);
      return false;
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // Sign up with metadata including promo code
        const signUpOptions = {
          email: email,
          password: password,
        };

        // Add promo code to metadata if provided
        if (promoCode) {
          signUpOptions.options = {
            data: {
              promo_code_used: promoCode
            }
          };
        }

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp(signUpOptions);

        if (signUpError) {
          console.error('SignUp Error:', signUpError);
          throw signUpError;
        }

        console.log('SignUp successful');

        if (signUpData.user) {
          // CRITICAL: Ensure profile exists (fallback if trigger failed)
          await ensureProfileExists(signUpData.user.id, signUpData.user.email);

          // Apply promo code if provided
          if (promoCode) {
            try {
              const { data, error } = await supabase.rpc('apply_promo_code', {
                p_user_id: signUpData.user.id,
                p_code: promoCode
              });
              
              if (error) {
                console.warn('Promo code application failed:', error);
                setPromoMessage(`⚠️ Promo code could not be applied: ${error.message}`);
              } else if (data && data.success) {
                setPromoMessage(`✅ ${data.message || 'Promo code applied successfully'}`);
              } else if (data && !data.success) {
                setPromoMessage(`⚠️ ${data.error || 'Promo code could not be applied'}`);
              }
            } catch (promoError) {
              console.error('Promo code error:', promoError);
              setPromoMessage('⚠️ Promo code could not be verified at this time');
            }
          }

          setMessage('Sign up successful! Signing you in...');
          
          // Wait for database sync
          await new Promise(resolve => setTimeout(resolve, 1500));
          
          // Auto sign in
          try {
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: email,
              password: password,
            });
            
            if (!signInError && signInData.user) {
              // Verify profile one more time before redirect
              await ensureProfileExists(signInData.user.id, signInData.user.email);
              
              setMessage('Welcome! Redirecting...');
              setTimeout(() => {
                window.location.href = '/';
              }, 500);
            } else {
              setMessage('Sign up successful! Please sign in.');
              setIsSignUp(false);
            }
          } catch (err) {
            console.error('Auto sign-in error:', err);
            setMessage('Sign up successful! Please sign in.');
            setIsSignUp(false);
          }
        } else {
          setMessage('Sign up initiated. Please check your email for verification link.');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          console.error('SignIn Error:', error);
          throw error;
        }

        console.log('SignIn successful');
        
        if (data.user) {
          // Ensure profile exists even on login (safety check)
          await ensureProfileExists(data.user.id, data.user.email);
          
          setMessage('Sign in successful! Redirecting...');
          setTimeout(() => {
            window.location.href = '/';
          }, 500);
        } else {
          setMessage('Sign in completed.');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      
      if (error.message === 'Invalid login credentials') {
        setMessage('Invalid email or password. Please try again.');
      } else if (error.message === 'Email not confirmed') {
        setMessage('Please verify your email before signing in.');
      } else {
        setMessage(error.message || 'An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>Simply Pregnancy</h1>
        <h2>{isSignUp ? 'Create Account' : 'Sign In'}</h2>
        
        <form onSubmit={handleAuth}>
          <div className="form-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          {isSignUp && (
            <div className="form-group">
              <input
                type="text"
                placeholder="Promo Code (optional)"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              />
              {promoCode && (
                <small className="promo-hint" style={{ color: '#666', fontSize: '0.85rem' }}>Code: {promoCode}</small>
              )}
            </div>
          )}
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </button>
        </form>
        
        <p className="toggle-auth">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button 
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setMessage('');
            }}
            className="link-button"
          >
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
        
        {promoMessage && (
          <div className="promo-success-message" style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f0f9ff', borderRadius: '8px', color: '#0369a1', fontSize: '0.9rem' }}>
            {promoMessage}
          </div>
        )}
        
        {message && (
          <div className={`message ${message.includes('Error') || message.includes('error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
