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
      setIsSignUp(true); // Default to signup if promo code present
    }
    
    // Pre-fill email from influencer signup
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam));
    }
    
    // Force signup mode if coming from influencer flow
    if (signupParam === 'true') {
      setIsSignUp(true);
    }
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      if (isSignUp) {
        // First, try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (signUpError) {
          if (process.env.NODE_ENV === 'development') {
            console.error('SignUp Error:', signUpError);
          }
          throw signUpError;
        }

        // SignUp successful - tokens only logged in development
        if (process.env.NODE_ENV === 'development') {
          console.log('SignUp Success');
        }

        // If signup successful and we have a promo code, apply it
        if (signUpData.user && promoCode) {
          try {
            const { data, error } = await supabase.rpc('apply_promo_code', {
              p_user_id: signUpData.user.id,
              p_code: promoCode
            });
            
            if (data && data.success) {
              setPromoMessage(`✅ ${data.message}`);
            } else if (data && data.error) {
              setPromoMessage(`⚠️ Promo code: ${data.error}`);
            }
          } catch (promoError) {
            console.error('Promo code error:', promoError);
          }
        }

        // Auto sign in after successful signup
        if (signUpData.user) {
          setMessage('Sign up successful! Signing you in...');
          
          // Wait a moment for the database to sync
          setTimeout(async () => {
            try {
              const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
              });
              
              if (!signInError && signInData.user) {
                setMessage('Welcome! Redirecting...');
                setTimeout(() => {
                  window.location.reload(); // Refresh to load the app
                }, 500);
              } else {
                setMessage('Sign up successful! Please sign in.');
              }
            } catch (err) {
              setMessage('Sign up successful! Please sign in.');
            }
          }, 1000);
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
          if (process.env.NODE_ENV === 'development') {
            console.error('SignIn Error:', error);
          }
          throw error;
        }

        // SignIn successful - tokens only logged in development
        if (process.env.NODE_ENV === 'development') {
          console.log('SignIn Success');
        }
        
        if (data.user) {
          setMessage('Sign in successful!');
        } else {
          setMessage('Sign in completed.');
        }
      }
    } catch (error) {
      setMessage(error.message);
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
