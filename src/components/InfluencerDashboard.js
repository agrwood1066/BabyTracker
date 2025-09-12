import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { TrendingUp, Users, DollarSign, Award, Calendar, BarChart3, LogIn, UserPlus, AlertCircle, Eye, Copy } from 'lucide-react';
import './InfluencerDashboard.css';

const InfluencerDashboard = () => {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [journey, setJourney] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [influencerInfo, setInfluencerInfo] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user && code) {
      loadInfluencerData();
    }
  }, [user, code]);

  const checkAuth = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        setUser(currentUser);
        // Check if user is an influencer
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_influencer')
          .eq('id', currentUser.id)
          .single();
        
        if (!profile?.is_influencer) {
          setError('You need to be a registered influencer to access this dashboard.');
          setShowAuthModal(true);
        }
      } else {
        setShowAuthModal(true);
        setError('Please sign in to access your influencer dashboard.');
      }
    } catch (err) {
      console.error('Auth check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);

    try {
      if (authMode === 'signup') {
        // Sign up new influencer
        const { data: authData, error: signUpError } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });

        if (signUpError) throw signUpError;

        if (authData.user) {
          // Try to claim the promo code
          const { data: claimResult, error: claimError } = await supabase
            .rpc('claim_influencer_code', {
              p_user_id: authData.user.id,
              p_user_email: authEmail,
              p_code: code.toUpperCase()
            });

          if (claimError) {
            setAuthError('Unable to claim promo code. Please contact support.');
          } else if (!claimResult.success) {
            setAuthError(claimResult.error || 'Unable to claim promo code.');
          } else {
            // Success!
            setUser(authData.user);
            setShowAuthModal(false);
            loadInfluencerData();
          }
        }
      } else {
        // Log in existing influencer
        const { data: authData, error: loginError } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });

        if (loginError) throw loginError;

        if (authData.user) {
          setUser(authData.user);
          setShowAuthModal(false);
          loadInfluencerData();
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  const loadInfluencerData = async () => {
    try {
      setLoading(true);
      const upperCode = code.toUpperCase();

      if (!user) {
        setError('You must be logged in to view this dashboard.');
        return;
      }

      // Load promo code info (now checks ownership)
      const { data: promoData, error: promoError } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('code', upperCode)
        .eq('influencer_user_id', user.id)
        .single();

      if (promoError || !promoData) {
        // Check if this is their code but not claimed yet
        const { data: unclaimedPromo } = await supabase
          .from('promo_codes')
          .select('*')
          .eq('code', upperCode)
          .is('influencer_user_id', null)
          .single();

        if (unclaimedPromo) {
          setError('This promo code has not been claimed yet. Please sign up with the email associated with this code.');
          setShowAuthModal(true);
          setAuthMode('signup');
        } else {
          setError('You do not have access to this promo code.');
        }
        return;
      }

      if (!promoData.active) {
        setError('This influencer code is no longer active.');
        return;
      }

      setInfluencerInfo(promoData);

      // Load stats using secure RPC function
      const { data: statsData, error: statsError } = await supabase
        .rpc('get_influencer_stats_secure', { 
          p_user_id: user.id,
          p_code: upperCode 
        });

      if (statsError) {
        console.error('Stats error:', statsError);
        if (statsError.message.includes('Unauthorized')) {
          setError('You are not authorized to view this dashboard.');
          return;
        }
      } else {
        setStats(statsData[0] || {
          total_visits: 0,
          active_trials: 0,
          paid_conversions: 0,
          conversion_rate: 0,
          pending_commission: 0,
          paid_commission: 0,
          monthly_revenue: 0
        });
      }

      // Load user journey (anonymized)
      const { data: journeyData, error: journeyError } = await supabase
        .rpc('get_influencer_journey_secure', { 
          p_user_id: user.id,
          p_code: upperCode 
        });

      if (!journeyError && journeyData) {
        setJourney(journeyData.slice(0, 20));
      }

      // Load weekly trend data
      const { data: weeklyStatsData } = await supabase
        .rpc('get_influencer_weekly_stats_secure', { 
          p_user_id: user.id,
          p_code: upperCode 
        });
      
      if (weeklyStatsData) {
        setWeeklyData(weeklyStatsData);
      }

    } catch (err) {
      console.error('Error loading influencer data:', err);
      setError('Unable to load dashboard. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Auth Modal Component
  const AuthModal = () => (
    <div className="auth-modal-overlay" onClick={() => setShowAuthModal(false)}>
      <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{authMode === 'login' ? 'Sign In to Your Dashboard' : 'Create Influencer Account'}</h2>
          {error && (
            <div className="auth-info-message">
              <AlertCircle size={20} />
              {error}
            </div>
          )}
        </div>

        <form onSubmit={handleAuth} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              placeholder={authMode === 'signup' ? 'Use email linked to your promo code' : 'Your email'}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              placeholder="Enter password"
              required
              minLength={6}
            />
          </div>

          {authError && (
            <div className="auth-error">
              {authError}
            </div>
          )}

          <button 
            type="submit" 
            className="auth-submit-btn"
            disabled={authLoading}
          >
            {authLoading ? 'Processing...' : (authMode === 'login' ? 'Sign In' : 'Create Account & Claim Code')}
          </button>
        </form>

        <div className="auth-switch">
          {authMode === 'login' ? (
            <p>
              First time here? 
              <button onClick={() => {setAuthMode('signup'); setAuthError('');}}>
                Create an account
              </button>
            </p>
          ) : (
            <p>
              Already have an account? 
              <button onClick={() => {setAuthMode('login'); setAuthError('');}}>
                Sign in
              </button>
            </p>
          )}
        </div>

        {authMode === 'signup' && (
          <div className="auth-help">
            <p><strong>Note:</strong> Use the email address that was registered with your promo code "{code?.toUpperCase()}"</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="influencer-dashboard loading">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  if (!code) {
    return <Navigate to="/" />;
  }

  if (showAuthModal) {
    return <AuthModal />;
  }

  if (error && !showAuthModal) {
    return (
      <div className="influencer-dashboard error">
        <div className="error-container">
          <h2>Access Denied</h2>
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-button">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  // Use production URL with fallback to localhost for development
  const baseUrl = 'https://www.babystepsplanner.com';
  const landingUrl = `${baseUrl}/?code=${code.toUpperCase()}`;
  const promoCode = code.toUpperCase();
  
  const copyLandingLink = () => {
    navigator.clipboard.writeText(landingUrl);
    alert('Landing page link copied to clipboard!');
  };
  
  const copyPromoCode = () => {
    navigator.clipboard.writeText(promoCode);
    alert('Promo code copied to clipboard!');
  };

  return (
    <div className="influencer-dashboard">
      {/* User Info Bar */}
      {user && (
        <div className="user-bar">
          <span>Signed in as: {user.email}</span>
          <button onClick={handleSignOut} className="sign-out-btn">
            Sign Out
          </button>
        </div>
      )}

      {/* Header */}
      <div className="dashboard-header">
        <h1>Welcome back, {influencerInfo?.influencer_name || 'Partner'}! 👋</h1>
        <p className="subtitle">Your Baby Steps Partner Dashboard</p>
      </div>

      {/* Share Section - Two Step Approach */}
      <div className="share-section">
        <h2>Your Partner Links & Code</h2>
        
        <div className="share-options">
          {/* Landing Page Link */}
          <div className="share-item">
            <h3>🔗 Landing Page Link</h3>
            <p className="share-description">
              Perfect for posts & stories - showcases the full app with your special offer
            </p>
            <div className="share-box">
              <input 
                type="text" 
                value={landingUrl} 
                readOnly 
                className="share-input"
              />
              <button onClick={copyLandingLink} className="copy-button">
                <Copy size={16} />
                Copy Link
              </button>
            </div>
          </div>
          
          {/* Promo Code */}
          <div className="share-item">
            <h3>📋 Your Promo Code</h3>
            <p className="share-description">
              Give this code to followers for {influencerInfo?.free_months || 1} free month{influencerInfo?.free_months > 1 ? 's' : ''}
            </p>
            <div className="promo-code-display">
              <span className="promo-code-text">{promoCode}</span>
              <button onClick={copyPromoCode} className="copy-button">
                <Copy size={16} />
                Copy Code
              </button>
            </div>
          </div>
        </div>
        
        <div className="usage-tips">
          <h4>💡 How to Use</h4>
          <ul>
            <li><strong>Share the link</strong> when showing the app features</li>
            <li><strong>Mention the code</strong> when highlighting the free offer</li>
            <li><strong>Both work together</strong> - link shows value, code claims offer</li>
          </ul>
        </div>
      </div>

      {/* Rest of the dashboard content remains the same... */}
      {/* Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card">
          <div className="metric-icon">
            <Eye size={24} />
          </div>
          <div className="metric-content">
            <h3>{stats?.total_visits || 0}</h3>
            <p>Link Visits</p>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon">
            <TrendingUp size={24} />
          </div>
          <div className="metric-content">
            <h3>{stats?.active_trials || 0}</h3>
            <p>Active Trials</p>
          </div>
        </div>

        <div className="metric-card success">
          <div className="metric-icon">
            <Award size={24} />
          </div>
          <div className="metric-content">
            <h3>{stats?.paid_conversions || 0}</h3>
            <p>Paid Customers</p>
            <small>{stats?.conversion_rate || 0}% conversion</small>
          </div>
        </div>

        <div className="metric-card money">
          <div className="metric-icon">
            <DollarSign size={24} />
          </div>
          <div className="metric-content">
            <h3>£{stats?.pending_commission || 0}</h3>
            <p>Pending Commission</p>
            {stats?.paid_commission > 0 && (
              <small>£{stats.paid_commission} already paid</small>
            )}
          </div>
        </div>
      </div>

      {/* Performance Chart */}
      {weeklyData.length > 0 && (
        <div className="performance-section">
          <h2>Weekly Performance</h2>
          <div className="chart-container">
            <div className="simple-chart">
              {weeklyData.map((week, idx) => {
                const maxVisits = Math.max(...weeklyData.map(w => w.visits || 0));
                const height = maxVisits > 0 ? (week.visits / maxVisits) * 100 : 0;
                
                return (
                  <div key={idx} className="chart-bar-wrapper">
                    <div 
                      className="chart-bar"
                      style={{ height: `${height}%` }}
                      title={`Week ${week.week_num}: ${week.visits} visits`}
                    >
                      <span className="bar-value">{week.visits}</span>
                    </div>
                    <span className="bar-label">W{week.week_num}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* User Journey Table */}
      <div className="user-journey-section">
        <h2>Recent Activity (Last 90 Days)</h2>
        {journey.length > 0 ? (
          <div className="journey-table-container">
            <table className="journey-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Anonymous ID</th>
                  <th>Status</th>
                  <th>Plan</th>
                  <th>Commission Status</th>
                </tr>
              </thead>
              <tbody>
                {journey.map((user, idx) => (
                  <tr key={idx}>
                    <td>{new Date(user.signup_date).toLocaleDateString('en-GB')}</td>
                    <td className="user-id">{user.anonymous_user_id}</td>
                    <td>
                      <span className={`status-badge ${user.current_status.toLowerCase().replace(' ', '-')}`}>
                        {user.current_status}
                      </span>
                    </td>
                    <td>{user.plan_type || '-'}</td>
                    <td>{user.commission_status || 'Pending'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="no-data">No visits yet. Share your link to get started!</p>
        )}
        
        <p className="privacy-note">
          🔒 User IDs are anonymised to protect privacy while maintaining transparency
        </p>
      </div>

      {/* Commission Details */}
      <div className="commission-details">
        <h2>Commission Structure</h2>
        <div className="commission-info">
          {influencerInfo?.tier === 'micro' && (
            <>
              <p>✅ £5 after user completes 3 paid months</p>
              <p>✅ £5 bonus if user upgrades to annual</p>
              <p className="total">Maximum per user: £10</p>
            </>
          )}
          {influencerInfo?.tier === 'mid' && (
            <>
              <p>✅ £7.50 after user completes 3 paid months</p>
              <p>✅ £7.50 after user completes 6 paid months</p>
              <p>✅ £10 bonus for annual upgrades</p>
              <p className="total">Maximum per user: £25</p>
            </>
          )}
          {influencerInfo?.tier === 'major' && (
            <>
              <p>✅ Custom commission structure</p>
              <p>Contact your account manager for details</p>
            </>
          )}
        </div>
      </div>

      {/* Tips Section */}
      <div className="tips-section">
        <h2>Tips for Success</h2>
        <div className="tips-grid">
          <div className="tip-card">
            <h3>🎯 Be Authentic</h3>
            <p>Share your genuine experience with Baby Steps and why you recommend it to expecting parents.</p>
          </div>
          <div className="tip-card">
            <h3>📱 Show the App</h3>
            <p>Screen recordings and feature demos convert better than just talking about it.</p>
          </div>
          <div className="tip-card">
            <h3>🎁 Highlight the Free Trial</h3>
            <p>Remind followers they get {influencerInfo?.free_months || 1} month{influencerInfo?.free_months > 1 ? 's' : ''} completely free with your code.</p>
          </div>
          <div className="tip-card">
            <h3>📅 Post Regularly</h3>
            <p>Mention Baby Steps naturally when discussing pregnancy planning or baby prep.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="dashboard-footer">
        <p>Questions? Email us at <a href="mailto:hello@babystepsplanner.com">hello@babystepsplanner.com</a></p>
        <p className="refresh-note">Dashboard updates every hour</p>
      </div>
    </div>
  );
};

export default InfluencerDashboard;
