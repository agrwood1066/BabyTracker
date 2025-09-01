import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Baby, ArrowRight, Check, X } from 'lucide-react';
import './Landing.css'; // Reuse landing styles

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // Check if we have the required tokens and handle auth callback
  useEffect(() => {
    const handleAuthCallback = async () => {
      console.log('=== Reset Password Component Loaded ===');
      console.log('URL:', window.location.href);
      console.log('Search params:', Object.fromEntries(searchParams.entries()));
      
      // Get URL parameters
      const accessToken = searchParams.get('access_token');
      const refreshToken = searchParams.get('refresh_token');
      const type = searchParams.get('type');
      
      console.log('Tokens:', {
        access_token: accessToken ? 'present' : 'missing',
        refresh_token: refreshToken ? 'present' : 'missing', 
        type
      });
      
      if (!accessToken || type !== 'recovery') {
        console.log('Invalid URL parameters for password reset');
        setMessage('Invalid or expired reset link. Please request a new password reset.');
        return;
      }
      
      try {
        // Check current session
        const { data: sessionData } = await supabase.auth.getSession();
        console.log('Current session:', sessionData.session ? 'exists' : 'none');
        
        if (refreshToken) {
          // If we have both tokens, set the session
          console.log('Setting session with both tokens...');
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          });
          
          if (error) {
            console.error('Session error:', error);
            throw error;
          }
          
          console.log('Session set successfully:', data.session ? 'success' : 'failed');
        } else {
          // If we only have access token, this is the typical recovery flow
          console.log('Recovery mode - access token only');
        }
        
        console.log('Ready for password reset');
        
      } catch (error) {
        console.error('Auth callback error:', error);
        setMessage('Invalid or expired reset link. Please request a new password reset.');
      }
    };
    
    handleAuthCallback();
  }, [searchParams]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    if (password.length < 6) {
      setMessage('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      console.log('=== Starting Password Reset Process ===');
      
      // Get tokens from URL
      const accessToken = searchParams.get('access_token');
      const type = searchParams.get('type');
      
      if (!accessToken || type !== 'recovery') {
        throw new Error('Invalid reset link - missing required parameters');
      }
      
      console.log('Tokens found, attempting to verify OTP...');
      
      // Use verifyOtp for password recovery
      const { data: verifyData, error: verifyError } = await supabase.auth.verifyOtp({
        token_hash: accessToken,
        type: 'recovery'
      });
      
      if (verifyError) {
        console.error('OTP verification failed:', verifyError);
        throw new Error('Invalid or expired reset link. Please request a new password reset.');
      }
      
      console.log('OTP verified successfully, user session established');
      console.log('Now updating password...');
      
      // Now we should have a valid session, update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: password
      });
      
      if (updateError) {
        console.error('Password update failed:', updateError);
        throw updateError;
      }
      
      console.log('Password updated successfully!');
      setIsSuccess(true);
      setMessage('Your password has been updated successfully!');
      
      // Redirect to dashboard after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
      
    } catch (error) {
      console.error('Password reset error:', error);
      setMessage(error.message || 'Failed to update password. The reset link may have expired. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-container">
      {/* Header */}
      <header className="landing-header">
        <div className="header-content">
          <div className="logo-section">
            <Baby className="logo-icon" size={32} />
            <span className="logo-text">Baby Steps Planner</span>
          </div>
        </div>
      </header>

      {/* Reset Password Form */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="modal-content" style={{ 
            background: 'white', 
            borderRadius: '12px', 
            padding: '2rem', 
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            maxWidth: '400px',
            margin: '0 auto'
          }}>
            {isSuccess ? (
              <div className="success-state">
                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                  <div style={{ 
                    background: '#dcfce7', 
                    borderRadius: '50%', 
                    width: '60px', 
                    height: '60px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    margin: '0 auto 1rem'
                  }}>
                    <Check size={30} style={{ color: '#16a34a' }} />
                  </div>
                  <h2 style={{ color: '#16a34a', marginBottom: '0.5rem' }}>
                    Password Updated!
                  </h2>
                  <p style={{ color: '#666', margin: 0 }}>
                    Redirecting you to your dashboard...
                  </p>
                </div>
              </div>
            ) : (
              <>
                <h2>Set New Password</h2>
                <p className="modal-description" style={{ marginBottom: '1.5rem' }}>
                  Choose a strong password for your Baby Steps account.
                </p>
                
                <form onSubmit={handleResetPassword}>
                  <div style={{ marginBottom: '1rem' }}>
                    <input
                      type="password"
                      placeholder="New Password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ width: '100%' }}
                    />
                  </div>
                  
                  <div style={{ marginBottom: '1.5rem' }}>
                    <input
                      type="password"
                      placeholder="Confirm New Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      style={{ width: '100%' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    disabled={loading}
                    className="cta-primary"
                    style={{ 
                      width: '100%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      gap: '0.5rem'
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Password'}
                    {!loading && <ArrowRight size={20} />}
                  </button>
                </form>

                <div className="auth-links" style={{ marginTop: '1.5rem' }}>
                  <p style={{ textAlign: 'center' }}>
                    <button 
                      className="link-btn"
                      onClick={() => navigate('/')}
                    >
                      ← Back to Home
                    </button>
                  </p>
                </div>
              </>
            )}
            
            {message && (
              <div 
                className={`message ${isSuccess ? 'success' : (message.includes('Invalid') || message.includes('Failed') ? 'error' : 'info')}`}
                style={{ 
                  marginTop: '1rem',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  textAlign: 'center'
                }}
              >
                {message}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

export default ResetPassword;
