import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import './Login.css';

function Login() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setDebugInfo('');

    try {
      if (isSignUp) {
        // First, try to sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: email,
          password: password,
        });

        if (signUpError) {
          console.error('SignUp Error:', signUpError);
          setDebugInfo(`SignUp Error: ${JSON.stringify(signUpError, null, 2)}`);
          throw signUpError;
        }

        console.log('SignUp Success:', signUpData);
        
        // Check if user was created
        if (signUpData.user) {
          // Try to manually create profile if needed
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: signUpData.user.id,
              email: signUpData.user.email,
              family_id: crypto.randomUUID()
            });
          
          if (profileError) {
            console.error('Profile Creation Error:', profileError);
            setDebugInfo(prev => prev + `\nProfile Error: ${JSON.stringify(profileError, null, 2)}`);
            // Don't throw here - the trigger might have already created it
          }
        }

        setMessage('Sign up successful! Please check your email for verification link.');
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password,
        });

        if (error) {
          console.error('SignIn Error:', error);
          setDebugInfo(`SignIn Error: ${JSON.stringify(error, null, 2)}`);
          throw error;
        }

        console.log('SignIn Success:', data);
        setMessage('Sign in successful!');
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Test database connection
  const testConnection = async () => {
    try {
      // Test 1: Check if we can connect to Supabase
      const { data: session, error: sessionError } = await supabase.auth.getSession();
      console.log('Session check:', { session, sessionError });
      
      // Test 2: Try to select from profiles table
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
      
      console.log('Profiles table check:', { profiles, profilesError });
      
      // Test 3: Check if tables exist
      const { data: tables, error: tablesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(0);
      
      setDebugInfo(`
Connection Test Results:
- Supabase URL: ${process.env.REACT_APP_SUPABASE_URL}
- Auth Session: ${sessionError ? 'Error: ' + sessionError.message : 'OK'}
- Profiles Table: ${profilesError ? 'Error: ' + profilesError.message : 'OK'}
- Tables Check: ${tablesError ? 'Error: ' + tablesError.message : 'OK'}
      `);
    } catch (err) {
      setDebugInfo(`Connection test failed: ${err.message}`);
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
              setDebugInfo('');
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
        
        <div className="debug-section">
          <button type="button" onClick={testConnection} className="test-button">
            Test Database Connection
          </button>
          {debugInfo && (
            <pre className="debug-info">{debugInfo}</pre>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;
