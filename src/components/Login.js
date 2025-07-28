import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

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

        setMessage('Sign up successful! Please check your email for verification link.');
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
        setMessage('Sign in successful!');
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
        
        {message && (
          <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
            {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
