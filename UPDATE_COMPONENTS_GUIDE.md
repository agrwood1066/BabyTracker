# Component Updates for Card-First Trial

## 📝 Update PromoCodeInput.js

Replace the `applyCode` function (around line 25) with the new version that stores but doesn't activate:

```javascript
// src/components/PromoCodeInput.js

const applyCode = async (code = promoCode) => {
  if (!code.trim()) {
    setStatus('error');
    setMessage('Please enter a promo code');
    return;
  }

  setLoading(true);
  setStatus(null);
  setMessage('');

  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setStatus('error');
      setMessage('Please sign up or log in first');
      return;
    }

    // NEW: Store promo code (doesn't activate trial)
    const { data, error } = await supabase
      .rpc('store_promo_code', {  // ← Changed from 'apply_promo_code'
        p_user_id: user.id,
        p_code: code.toUpperCase()
      });

    if (error) {
      setStatus('error');
      setMessage(error.message || 'Invalid promo code');
      return;
    }

    if (data && data.success) {
      setStatus('success');
      setMessage(
        `🎉 ${data.total_free_days} days free ready to activate! ` +
        `Add payment details to start your trial.`
      );
      
      // Store promo details in session for later
      sessionStorage.setItem('pendingPromo', JSON.stringify({
        code: code.toUpperCase(),
        freeDays: data.total_free_days,
        freeMonths: data.free_months
      }));
      
      if (onSuccess) {
        onSuccess(data);
      }
    } else {
      setStatus('error');
      setMessage(data?.error || 'Could not apply promo code');
    }
  } catch (error) {
    console.error('Error applying promo code:', error);
    setStatus('error');
    setMessage('An error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};
```

## 📝 Update PaywallModal.js

Update the modal to detect pending promos and show enhanced messaging:

```javascript
// src/components/PaywallModal.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Gift, CreditCard, Clock } from 'lucide-react';
import './PaywallModal.css';

const PaywallModal = ({ show, onClose, trigger }) => {
  const navigate = useNavigate();
  const [pendingPromo, setPendingPromo] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkForPendingPromo();
  }, []);

  const checkForPendingPromo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for pending promo in database
      const { data } = await supabase
        .rpc('get_user_promo_status', {
          p_user_id: user.id
        });

      if (data && data.has_promo && data.status === 'pending') {
        setPendingPromo({
          code: data.promo_code,
          totalDays: data.total_free_days,
          freeMonths: data.free_months
        });
      }
    } catch (error) {
      console.error('Error checking promo status:', error);
    }
  };

  const handleStartTrial = async () => {
    setLoading(true);
    
    // Get Stripe checkout URL based on plan
    const checkoutUrl = selectedPlan === 'annual' 
      ? process.env.REACT_APP_STRIPE_ANNUAL_URL
      : process.env.REACT_APP_STRIPE_MONTHLY_URL;
    
    // Add trial period parameter if promo exists
    const urlParams = pendingPromo 
      ? `?trial_days=${pendingPromo.totalDays}`
      : '?trial_days=14';
    
    // Redirect to Stripe
    window.location.href = checkoutUrl + urlParams;
  };

  if (!show) return null;

  return (
    <div className="paywall-modal-overlay" onClick={onClose}>
      <div className="paywall-modal" onClick={e => e.stopPropagation()}>
        {/* Promo Banner */}
        {pendingPromo && (
          <div className="promo-banner">
            <Gift size={20} />
            <div>
              <strong>Special Offer Active!</strong>
              <p>{pendingPromo.totalDays} days free (14-day trial + {pendingPromo.freeMonths} month{pendingPromo.freeMonths > 1 ? 's' : ''} free)</p>
            </div>
          </div>
        )}

        <h2>Unlock Premium Features</h2>
        
        {/* Trigger Message */}
        <div className="trigger-message">
          {trigger === 'limit' && (
            <p>You've reached your free plan limit. Upgrade for unlimited access!</p>
          )}
          {trigger === 'family' && (
            <p>Share with your partner and family members with Premium!</p>
          )}
          {trigger === 'export' && (
            <p>Export your data to PDF and Excel with Premium!</p>
          )}
        </div>

        {/* Trial Period Display */}
        <div className="trial-info">
          <Clock size={32} />
          <div className="trial-days">
            <span className="big-number">
              {pendingPromo ? pendingPromo.totalDays : 14}
            </span>
            <span>days free</span>
          </div>
          {pendingPromo && (
            <p className="trial-breakdown">
              14-day trial + {pendingPromo.freeMonths} month{pendingPromo.freeMonths > 1 ? 's' : ''} free
            </p>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="pricing-cards">
          <div 
            className={`pricing-card ${selectedPlan === 'monthly' ? 'selected' : ''}`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <h3>Monthly</h3>
            <div className="price">
              £6.99
              <span>/month</span>
            </div>
            <p className="billing-info">
              Billed after {pendingPromo ? pendingPromo.totalDays : 14} days
            </p>
          </div>

          <div 
            className={`pricing-card ${selectedPlan === 'annual' ? 'selected' : ''} popular`}
            onClick={() => setSelectedPlan('annual')}
          >
            <div className="badge">Save £14</div>
            <h3>Annual</h3>
            <div className="price">
              £69.99
              <span>/year</span>
            </div>
            <p className="billing-info">
              Billed after {pendingPromo ? pendingPromo.totalDays : 14} days
            </p>
          </div>
        </div>

        {/* Features */}
        <div className="features-list">
          <h4>Everything in Premium:</h4>
          <ul>
            <li>✅ Unlimited shopping items, budget categories & baby names</li>
            <li>✅ Share with partner & family members</li>
            <li>✅ Create wishlists for gifts</li>
            <li>✅ Export to PDF & Excel</li>
            <li>✅ Weekly pregnancy insights</li>
            <li>✅ Priority support</li>
          </ul>
        </div>

        {/* CTA */}
        <button 
          className="cta-button"
          onClick={handleStartTrial}
          disabled={loading}
        >
          <CreditCard size={20} />
          {loading ? 'Loading...' : `Start ${pendingPromo ? pendingPromo.totalDays : 14}-Day Free Trial`}
        </button>

        {/* Terms */}
        <div className="terms">
          <p>🔒 Card required • Cancel anytime • No hidden fees</p>
          {pendingPromo && (
            <p className="promo-terms">
              Your card won't be charged for {pendingPromo.totalDays} days
            </p>
          )}
        </div>

        {/* Close button */}
        <button className="close-btn" onClick={onClose}>
          Maybe Later
        </button>
      </div>
    </div>
  );
};

export default PaywallModal;
```

## 📝 Update Dashboard.js

Add status banner to show promo availability:

```javascript
// src/components/Dashboard.js - Add this component within Dashboard

const PromoStatusBanner = () => {
  const [promoStatus, setPromoStatus] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get subscription status
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setSubscription(profile);

    // Check promo status
    const { data: promo } = await supabase
      .rpc('get_user_promo_status', {
        p_user_id: user.id
      });
    
    setPromoStatus(promo);
  };

  // Show promo banner for free users with pending promo
  if (subscription?.subscription_status === 'free' && promoStatus?.has_promo && promoStatus?.status === 'pending') {
    return (
      <div className="status-banner promo-available">
        <div className="banner-content">
          <Gift size={20} />
          <span>
            🎉 You have {promoStatus.total_free_days} days free waiting! 
            Activate your special offer to unlock all Premium features.
          </span>
          <button 
            className="activate-btn"
            onClick={() => navigate('/subscribe')}
          >
            Activate Offer
          </button>
        </div>
      </div>
    );
  }

  // Show trial status for trial users
  if (subscription?.subscription_status === 'trial') {
    const daysLeft = Math.ceil(
      (new Date(subscription.trial_ends_at) - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    return (
      <div className="status-banner trial-active">
        <div className="banner-content">
          <Clock size={20} />
          <span>
            Premium Trial Active • {daysLeft} days remaining
            {promoStatus?.free_months > 0 && ` (includes ${promoStatus.free_months} month${promoStatus.free_months > 1 ? 's' : ''} free)`}
          </span>
        </div>
      </div>
    );
  }

  // Show free tier limits
  if (subscription?.subscription_status === 'free') {
    return (
      <div className="status-banner free-tier">
        <div className="banner-content">
          <span>Free Plan • 10 items • 3 budgets • 5 names</span>
          <button 
            className="upgrade-btn"
            onClick={() => navigate('/subscribe')}
          >
            Start 14-Day Trial
          </button>
        </div>
      </div>
    );
  }

  return null;
};
```

## 📝 Create SubscriptionActivation.js

New component to handle post-Stripe checkout activation:

```javascript
// src/components/SubscriptionActivation.js

import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CheckCircle, Loader } from 'lucide-react';
import './SubscriptionActivation.css';

const SubscriptionActivation = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('processing');
  const [message, setMessage] = useState('Activating your trial...');
  const [details, setDetails] = useState(null);

  useEffect(() => {
    activateTrial();
  }, []);

  const activateTrial = async () => {
    try {
      const sessionId = searchParams.get('session_id');
      const customerId = searchParams.get('customer_id');
      
      if (!sessionId || !customerId) {
        throw new Error('Missing required parameters');
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not logged in');
      }

      // Activate trial with payment method
      const { data, error } = await supabase
        .rpc('activate_trial_with_payment', {
          p_user_id: user.id,
          p_stripe_customer_id: customerId,
          p_subscription_plan: searchParams.get('plan') || 'monthly'
        });

      if (error) throw error;

      if (data.success) {
        setStatus('success');
        setMessage(data.message);
        setDetails({
          trialEnds: data.trial_ends,
          daysLeft: data.days_free,
          promoApplied: data.promo_applied
        });

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } else {
        throw new Error(data.error || 'Failed to activate trial');
      }
    } catch (error) {
      console.error('Activation error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to activate trial');
    }
  };

  return (
    <div className="activation-container">
      <div className="activation-card">
        {status === 'processing' && (
          <>
            <Loader size={48} className="spinner" />
            <h2>{message}</h2>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle size={48} className="success-icon" />
            <h2>Trial Activated!</h2>
            <p className="success-message">{message}</p>
            
            {details && (
              <div className="trial-details">
                <div className="detail-item">
                  <span className="label">Trial ends:</span>
                  <span className="value">
                    {new Date(details.trialEnds).toLocaleDateString()}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Days free:</span>
                  <span className="value">{details.daysLeft}</span>
                </div>
                {details.promoApplied && (
                  <div className="promo-applied">
                    ✨ Promo code benefits applied!
                  </div>
                )}
              </div>
            )}
            
            <p className="redirect-message">
              Redirecting to dashboard...
            </p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="error-icon">⚠️</div>
            <h2>Activation Failed</h2>
            <p className="error-message">{message}</p>
            <button 
              className="retry-btn"
              onClick={() => navigate('/subscribe')}
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionActivation;
```

## 📝 Update App.js Routes

Add the new activation route:

```javascript
// src/App.js - Add this route

import SubscriptionActivation from './components/SubscriptionActivation';

// In your routes:
<Route 
  path="/subscription/activate" 
  element={<SubscriptionActivation />} 
/>
```

## 📝 Update Environment Variables

Add to `.env`:

```bash
# Stripe Checkout URLs
REACT_APP_STRIPE_MONTHLY_URL=https://checkout.stripe.com/c/pay/YOUR_MONTHLY_LINK
REACT_APP_STRIPE_ANNUAL_URL=https://checkout.stripe.com/c/pay/YOUR_ANNUAL_LINK

# Return URLs (after Stripe checkout)
REACT_APP_STRIPE_SUCCESS_URL=https://yourdomain.com/subscription/activate
REACT_APP_STRIPE_CANCEL_URL=https://yourdomain.com/subscribe
```

## 📝 CSS Updates

Add these styles for the new components:

```css
/* Add to PaywallModal.css */

.promo-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
  animation: slideDown 0.3s ease-out;
}

.promo-banner svg {
  flex-shrink: 0;
}

.trial-info {
  text-align: center;
  padding: 24px;
  background: #f7f9fc;
  border-radius: 12px;
  margin: 20px 0;
}

.trial-days {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 12px;
}

.big-number {
  font-size: 48px;
  font-weight: bold;
  color: #667eea;
  line-height: 1;
}

.trial-breakdown {
  margin-top: 8px;
  color: #64748b;
  font-size: 14px;
}

/* Add to Dashboard.css */

.status-banner {
  padding: 12px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  animation: slideDown 0.3s ease-out;
}

.status-banner.promo-available {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.status-banner.trial-active {
  background: #e0f2fe;
  color: #0369a1;
}

.status-banner.free-tier {
  background: #f1f5f9;
  color: #475569;
}

.banner-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.activate-btn,
.upgrade-btn {
  padding: 8px 16px;
  border-radius: 6px;
  font-weight: 600;
  transition: all 0.2s;
}

.activate-btn {
  background: white;
  color: #667eea;
}

.upgrade-btn {
  background: #667eea;
  color: white;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## ✅ Testing Checklist

1. **Test Regular Signup (No Promo)**
   - [ ] Sign up → Should start on FREE
   - [ ] Dashboard shows "Free Plan" banner
   - [ ] Hit limit → PaywallModal shows "14 days free"
   - [ ] Click trial → Redirects to Stripe
   - [ ] Complete payment → Returns to activation page
   - [ ] Trial activates for 14 days

2. **Test Promo Code Signup**
   - [ ] Sign up with ?code=TEST-1 in URL
   - [ ] PromoCodeInput auto-applies code
   - [ ] Dashboard shows "44 days free waiting" banner
   - [ ] PaywallModal shows enhanced offer
   - [ ] Complete payment → Trial for 44 days

3. **Test Invalid Promo**
   - [ ] Enter "INVALID" code
   - [ ] Shows error message
   - [ ] Can still upgrade normally

4. **Test Existing User**
   - [ ] Login as existing free user
   - [ ] Apply promo code
   - [ ] Shows in dashboard
   - [ ] Activates correctly

## 🚀 Deployment Checklist

1. [ ] Run SQL migration script
2. [ ] Update all component files
3. [ ] Update environment variables
4. [ ] Deploy to Cloudflare/Vercel
5. [ ] Test complete flow in production
6. [ ] Monitor error logs
7. [ ] Check Stripe webhook handling