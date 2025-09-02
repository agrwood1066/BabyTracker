import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Baby, Gift, Star, Check, ChevronRight } from 'lucide-react';
import './PromoLanding.css';

const PromoLanding = () => {
  const { code } = useParams(); // URL: /with/{ANY_PROMO_CODE} - Works with any code!
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [promoDetails, setPromoDetails] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    validatePromoCode();
  }, [code]);

  const validatePromoCode = async () => {
    const { data, error } = await supabase
      .from('promo_codes')
      .select('*')
      .eq('code', code.toUpperCase())
      .eq('active', true)
      .single();

    if (!data || error) {
      setError('Invalid or expired promo code');
      setTimeout(() => navigate('/signup'), 3000);
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
              promo_code: code.toUpperCase(),
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
          promo_code: code.toUpperCase(),
          status: 'pending',
          free_months: promoDetails.free_months
        });

        // Update profile with promo code
        await supabase
          .from('profiles')
          .update({ 
            promo_code_used: code.toUpperCase(),
            stripe_promotion_code_id: promoDetails.stripe_promotion_code_id
          })
          .eq('id', userId);
      }

      // Store email in session storage for webhook matching
      sessionStorage.setItem('promo_email', email.toLowerCase());
      sessionStorage.setItem('promo_code', code.toUpperCase());

      // Redirect to Stripe Payment Link with promo code
      // Using your actual Stripe monthly Payment Link (promo codes only work with monthly)
      const stripeUrl = `https://buy.stripe.com/fZu4gzdiC2eE0Kx8opeME01?prefilled_email=${encodeURIComponent(email)}&prefilled_promo_code=${code.toUpperCase()}`;
      
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

          {/* Benefits */}
          <div className="benefits-list">
            <div className="benefit-item">
              <Check size={20} className="check-icon" />
              <span>Complete pregnancy planner & tracker</span>
            </div>
            <div className="benefit-item">
              <Check size={20} className="check-icon" />
              <span>Shopping lists with budget tracking</span>
            </div>
            <div className="benefit-item">
              <Check size={20} className="check-icon" />
              <span>Baby names voting with partner</span>
            </div>
            <div className="benefit-item">
              <Check size={20} className="check-icon" />
              <span>Hospital bag checklist</span>
            </div>
            <div className="benefit-item">
              <Check size={20} className="check-icon" />
              <span>Share with family members</span>
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
            <p>Loved by 1,000+ UK parents</p>
            <div className="rating">
              {'⭐'.repeat(5)} 4.9/5 rating
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PromoLanding;