import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Loader } from 'lucide-react';

/**
 * AuthCallback Component
 * 
 * Handles the auth callback after email confirmation.
 * When users click the confirmation link in their email,
 * Supabase redirects them here with a token.
 * 
 * This component:
 * 1. Extracts the token from the URL
 * 2. Exchanges it for a session with Supabase
 * 3. Redirects to dashboard on success
 */
function AuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the current URL hash (where Supabase puts the tokens)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const refreshToken = hashParams.get('refresh_token');
        const type = hashParams.get('type');

        console.log('Auth callback triggered:', { type, hasAccessToken: !!accessToken });

        // If this is an email confirmation callback
        if (type === 'signup' || type === 'email') {
          if (accessToken && refreshToken) {
            // Set the session with the tokens from the URL
            const { data, error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken,
            });

            if (error) {
              console.error('Session setup error:', error);
              setError('Failed to verify your email. Please try signing in.');
              setStatus('error');
              
              // Redirect to landing after 3 seconds
              setTimeout(() => navigate('/'), 3000);
              return;
            }

            if (data.session) {
              console.log('✓ Email verified! Session established for:', data.session.user.email);
              
              // Ensure profile exists (in case trigger didn't fire)
              try {
                const { data: profileCheck } = await supabase.rpc('ensure_profile_exists');
                console.log('✓ Profile verified:', profileCheck);
              } catch (err) {
                console.error('Profile check failed:', err);
              }
              
              setStatus('success');
              
              // Small delay to show success message, then redirect
              setTimeout(() => {
                navigate('/dashboard');
              }, 1500);
            }
          } else {
            // No tokens in URL - might have already been processed
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
              // Already has a session, just redirect
              navigate('/dashboard');
            } else {
              setError('Invalid confirmation link. Please try signing in.');
              setStatus('error');
              setTimeout(() => navigate('/'), 3000);
            }
          }
        } else {
          // Not a signup callback, check if already logged in
          const { data: { session } } = await supabase.auth.getSession();
          
          if (session) {
            navigate('/dashboard');
          } else {
            navigate('/');
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setError('An error occurred. Redirecting...');
        setStatus('error');
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '20px',
      textAlign: 'center',
      backgroundColor: '#f8f9fa'
    }}>
      {status === 'verifying' && (
        <>
          <Loader size={48} style={{ animation: 'spin 1s linear infinite', marginBottom: '20px', color: '#ff9faa' }} />
          <h2 style={{ color: '#333', marginBottom: '10px' }}>Verifying your email...</h2>
          <p style={{ color: '#666' }}>This will only take a moment</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#d4edda',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <svg width="32" height="32" fill="#28a745" viewBox="0 0 16 16">
              <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
            </svg>
          </div>
          <h2 style={{ color: '#28a745', marginBottom: '10px' }}>Email Verified!</h2>
          <p style={{ color: '#666' }}>Redirecting to your dashboard...</p>
        </>
      )}

      {status === 'error' && (
        <>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: '#f8d7da',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px'
          }}>
            <svg width="32" height="32" fill="#dc3545" viewBox="0 0 16 16">
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
              <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
            </svg>
          </div>
          <h2 style={{ color: '#dc3545', marginBottom: '10px' }}>Verification Failed</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>{error}</p>
          <p style={{ color: '#999', fontSize: '14px' }}>Redirecting to sign in...</p>
        </>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default AuthCallback;
