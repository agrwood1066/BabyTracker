import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Baby, Gift, Star, Check, ChevronRight } from 'lucide-react';
import './PromoLanding.css';

const PromoLanding = () => {
  const { code } = useParams(); // URL: /with/{code}
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [promoDetails, setPromoDetails] = useState(null);
  const [error, setError] = useState('');
  const [showSignUp, setShowSignUp] = useState(false);
  
  // Get promo code from URL params or query string
  const getPromoCode = () => {
    if (code) return code; // From /with/{code}
    const params = new URLSearchParams(location.search);
    return params.get('code'); // From /signup?code=CODE
  };
  
  const promoCode = getPromoCode();

  useEffect(() => {
    if (promoCode) {
      validatePromoCode();
      trackPromoVisit();
    } else {
      // No promo code, redirect to regular landing page
      navigate('/');
    }
  }, [promoCode]);

  const trackPromoVisit = async () => {
    try {
      // Track the visit for analytics
      await supabase
        .from('promo_visits')
        .insert({
          promo_code: promoCode.toUpperCase(),
          visited_at: new Date().toISOString(),
          user_agent: navigator.userAgent,
          referrer: document.referrer || null
        });
    } catch (error) {
      console.log('Visit tracking failed:', error);
      // Don't block the user experience for tracking failures
    }
  };

  const validatePromoCode = async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', promoCode.toUpperCase())
      .eq('active', true)
      .single();

    if (!data || error) {
      setError('Invalid or expired promo code');
      setTimeout(() => navigate('/'), 3000);
      return;
    }

    setPromoDetails(data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Check if user exists
      let { data: existingUser } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email.toLowerCase())
        .single();

      let userId;

      if (!existingUser) {
        // Create new auth user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: email.toLowerCase(),
          password: Math.random().toString(36).slice(-12) + 'Aa1!', // Temp password they'll reset
          options: {
            data: {
              promo_code: promoCode.toUpperCase(),
              full_name: '' // They'll complete profile later
            }
          }
        });

        if (authError) throw authError;
        userId = authData.user?.id;
      } else {
        userId = existingUser.id;
      }

      // Track promo activation
      if (userId) {
        await supabase.from('promo_activations').upsert({
          user_id: userId,
          promo_code: promoCode.toUpperCase(),
          status: 'pending',
          free_months: promoDetails.free_months
        });

        // Update profile with promo code
        await supabase
          .from('profiles')
          .update({ 
            promo_code_used: promoCode.toUpperCase(),
            stripe_promotion_code_id: promoDetails.stripe_promotion_code_id
          })
          .eq('id', userId);
      }

      // Store email in session storage for webhook matching
      sessionStorage.setItem('promo_email', email.toLowerCase());
      sessionStorage.setItem('promo_code', promoCode.toUpperCase());

      // Redirect to Stripe Payment Link with promo code
      // Using your actual Stripe monthly Payment Link (promo codes only work with monthly)
      const stripeUrl = `https://buy.stripe.com/fZu4gzdiC2eE0Kx8opeME01?prefilled_email=${encodeURIComponent(email)}&prefilled_promo_code=${promoCode.toUpperCase()}`;
      
      window.location.href = stripeUrl;
    } catch (error) {
      console.error('Error:', error);
      setError('Something went wrong. Please try again or contact support.');
      setLoading(false);
    }
  };

  if (error && !promoDetails) {
    return (
      <div className="promo-landing error-state">
        <div className="error-message">
          <p>{error}</p>
          <p>Redirecting to signup...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="promo-landing">
      <div className="promo-container">
        {/* Header with influencer info */}
        {promoDetails && (
          <div className="influencer-badge">
            <Gift size={20} />
            <span>Special offer from {promoDetails.influencer_name}</span>
          </div>
        )}

        {/* Main Content */}
        <div className="promo-content">
          <div className="logo-section">
            <Baby size={48} className="logo-icon" />
            <h1>Baby Steps Planner</h1>
          </div>

          <div className="offer-highlight">
            <Star className="star-icon" />
            <h2>
              Get {promoDetails?.free_months || 1} Month{promoDetails?.free_months > 1 ? 's' : ''} FREE
            </h2>
            <p className="offer-subtitle">
              Exclusive offer for {promoDetails?.influencer_name}'s community
            </p>
          </div>

          {/* App Features Showcase */}
          <div className="features-showcase">
            <h3>Everything You Need for Your Baby Journey</h3>
            
            <div className="features-grid">
              <div className="feature-card">
                <div className="feature-icon">🛒</div>
                <h4>Smart Shopping Lists</h4>
                <p>Organised shopping with budget tracking and mobile shopping mode</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💰</div>
                <h4>Budget Planner</h4>
                <p>Track spending across categories with visual progress and insights</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">💕</div>
                <h4>Baby Names</h4>
                <p>Collaborate with your partner to find the perfect name</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🏥</div>
                <h4>Hospital Bag</h4>
                <p>Never forget anything with our comprehensive checklist</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">🎁</div>
                <h4>Gift Wishlist</h4>
                <p>Shareable wishlists with automatic product images</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">👨‍👩‍👧‍👦</div>
                <h4>Family Sharing</h4>
                <p>Include your partner and family in the planning process</p>
              </div>
            </div>
          </div>
          
          {/* Key Benefits */}
          <div className="benefits-list">
            <div className="benefit-item">
              <Check size={20} className="check-icon" />
              <span>Complete pregnancy planner in one app</span>
            </div>
            <div className="benefit-item">
              <Check size={20} className="check-icon" />
              <span>Budget tracking prevents overspending</span>
            </div>
            <div className="benefit-item">
              <Check size={20} className="check-icon" />
              <span>Partner collaboration on all decisions</span>
            </div>
            <div className="benefit-item">
              <Check size={20} className="check-icon" />
              <span>Export lists to PDF & Excel</span>
            </div>
            <div className="benefit-item">
              <Check size={20} className="check-icon" />
              <span>Works perfectly on mobile & desktop</span>
            </div>
          </div>

          {/* Email Form */}
          <form onSubmit={handleSubmit} className="promo-form">
            <div className="form-group">
              <input
                type="email"
                placeholder="Enter your email to get started"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="email-input"
              />
              <button 
                type="submit" 
                disabled={loading || !email}
                className="submit-button"
              >
                {loading ? (
                  <span>Loading...</span>
                ) : (
                  <>
                    <span>Claim Your {promoDetails?.free_months || 1} Free Month{promoDetails?.free_months > 1 ? 's' : ''}</span>
                    <ChevronRight size={20} />
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="error-text">
                {error}
              </div>
            )}

            <p className="terms-text">
              No payment today • Cancel anytime • £6.99/month after free period
            </p>
          </form>

          {/* Trust signals */}
          <div className="trust-signals">
            <div className="trust-item">
              <span className="trust-number">1,000+</span>
              <span className="trust-text">UK Parents Trust Us</span>
            </div>
            <div className="trust-item">
              <span className="trust-rating">{'⭐'.repeat(5)}</span>
              <span className="trust-text">4.9/5 Rating</span>
            </div>
            <div className="trust-item">
              <span className="trust-number">£0</span>
              <span className="trust-text">Payment Today</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoLanding;