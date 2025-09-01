// PaywallModal.js - Soft paywall modal for upgrade prompts
import React, { useState, useEffect } from 'react';
import { X, Lock, Star, TrendingUp, Users, Download, Gift, Check, Crown, Clock, CreditCard } from 'lucide-react';
import { useSubscription } from '../hooks/useSubscription';
import './PaywallModal.css';

const PaywallModal = ({ show, trigger, onClose, customMessage }) => {
  const { getDaysLeftInTrial, getUpgradeUrl, subscription, promoStatus, checkPromoStatus } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  const [loading, setLoading] = useState(false);
  const [pendingPromo, setPendingPromo] = useState(null);
  
  useEffect(() => {
    if (show) {
      checkPromoStatus();
    }
  }, [show]);

  useEffect(() => {
    if (promoStatus && promoStatus.has_promo && promoStatus.status === 'pending') {
      setPendingPromo({
        code: promoStatus.promo_code,
        totalDays: promoStatus.total_free_days || (14 + (promoStatus.free_months * 30)),
        freeMonths: promoStatus.free_months
      });
    }
  }, [promoStatus]);
  
  if (!show) return null;

  const daysLeftInTrial = getDaysLeftInTrial();
  
  // Define trigger-specific content
  const triggerContent = {
    limit: {
      icon: <Lock size={48} />,
      title: 'You\'ve Reached Your Free Limit',
      message: customMessage || 'Upgrade to Premium for unlimited access to all features!'
    },
    family: {
      icon: <Users size={48} />,
      title: 'Family Sharing is Premium Only',
      message: 'Share lists and collaborate with your partner and family members'
    },
    export: {
      icon: <Download size={48} />,
      title: 'Export Features Require Premium',
      message: 'Download beautiful PDFs and Excel files of your lists and budgets'
    },
    wishlist: {
      icon: <Gift size={48} />,
      title: 'Wishlist is a Premium Feature',
      message: 'Create and share beautiful wishlists with automatic product images'
    },
    hospital_bag: {
      icon: <Star size={48} />,
      title: 'Hospital Bag Customisation is Premium',
      message: 'Create and customise your perfect hospital bag checklist'
    },
    milestone: {
      icon: <TrendingUp size={48} />,
      title: `You're ${customMessage}!`,
      message: 'Unlock trimester-specific features and insights with Premium'
    }
  };

  const content = triggerContent[trigger] || triggerContent.limit;

  const handleUpgrade = () => {
    setLoading(true);
    const url = getUpgradeUrl(selectedPlan);
    
    // Debug log to check URL
    console.log('Upgrade URL:', url);
    console.log('Selected plan:', selectedPlan);
    
    // Redirect to Stripe Checkout
    if (url && url.startsWith('http')) {
      // Add trial period parameter if promo exists
      const finalUrl = pendingPromo 
        ? `${url}${url.includes('?') ? '&' : '?'}trial_days=${pendingPromo.totalDays}`
        : url;
      window.location.href = finalUrl;
    } else {
      // More informative error message
      console.error('Stripe URLs not configured:', {
        monthly: process.env.REACT_APP_STRIPE_LAUNCH_MONTHLY_URL,
        annual: process.env.REACT_APP_STRIPE_ANNUAL_URL
      });
      alert('Stripe payment links are not configured. Please check environment variables.');
      setLoading(false);
    }
  };

  const features = [
    { icon: '♾️', text: 'Unlimited shopping items, budget categories & baby names' },
    { icon: '👨‍👩‍👧', text: 'Share with partner & family members' },
    { icon: '🎁', text: 'Create beautiful wishlists for gifts' },
    { icon: '📊', text: 'Export to PDF & Excel' },
    { icon: '🏥', text: 'Full hospital bag customisation' },
    { icon: '📱', text: 'Priority support & weekly insights' }
  ];

  return (
    <div className="paywall-modal-overlay" onClick={onClose}>
      <div className="paywall-modal" onClick={e => e.stopPropagation()}>
        <button 
          className="paywall-close-button" 
          onClick={onClose}
          aria-label="Close"
          type="button"
        >
          ✕
        </button>

        {/* Promo Banner if available */}
        {pendingPromo && (
          <div className="promo-banner">
            <Gift size={20} />
            <div>
              <strong>Special Offer Active!</strong>
              <p>{pendingPromo.totalDays} days free (14-day trial + {pendingPromo.freeMonths} month{pendingPromo.freeMonths > 1 ? 's' : ''} free)</p>
            </div>
          </div>
        )}
        
        {/* Trial Banner if applicable */}
        {daysLeftInTrial > 0 && !pendingPromo && (
          <div className="trial-banner">
            🎉 You have {daysLeftInTrial} days left in your free trial
          </div>
        )}

        {/* Icon and Title */}
        <div className="modal-header">
          <div className="modal-icon">{content.icon}</div>
          <h2>{content.title}</h2>
          <p className="modal-subtitle">{content.message}</p>
        </div>

        {/* Trial Period Display */}
        {(pendingPromo || subscription?.subscription_status === 'free') && (
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
        )}

        {/* Pricing Cards */}
        <div className="pricing-cards">
          {/* Monthly Plan */}
          <div 
            className={`pricing-card ${selectedPlan === 'monthly' ? 'selected' : ''}`}
            onClick={() => setSelectedPlan('monthly')}
          >
            <h3>Monthly</h3>
            <div className="price">
              <span className="currency">£</span>
              <span className="amount">6.99</span>
              <span className="period">/month</span>
            </div>
            <p className="billing-info">
              {pendingPromo ? `Billed after ${pendingPromo.totalDays} days` : 'Billed after 14 days'}
            </p>
            <div className="plan-features">
              <div className="feature-item">
                <Check size={16} className="check-icon" />
                <span>Cancel anytime</span>
              </div>
              <div className="feature-item">
                <Check size={16} className="check-icon" />
                <span>All premium features</span>
              </div>
            </div>
          </div>

          {/* Annual Plan */}
          <div 
            className={`pricing-card ${selectedPlan === 'annual' ? 'selected' : ''} popular`}
            onClick={() => setSelectedPlan('annual')}
          >
            <div className="badge popular-badge">
              <Crown size={14} /> Most Popular
            </div>
            <h3>Annual</h3>
            <div className="price">
              <span className="currency">£</span>
              <span className="amount">69.99</span>
              <span className="period">/year</span>
            </div>
            <p className="savings">
              Save £14 vs monthly!
            </p>
            <p className="billing-info">
              {pendingPromo ? `Billed after ${pendingPromo.totalDays} days` : 'Billed after 14 days'}
            </p>
            <div className="plan-features">
              <div className="feature-item">
                <Check size={16} className="check-icon" />
                <span>Best value</span>
              </div>
              <div className="feature-item">
                <Check size={16} className="check-icon" />
                <span>All premium features</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features List */}
        <div className="features-list">
          <h4>Everything in Premium:</h4>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-item">
                <span className="feature-icon">{feature.icon}</span>
                <span className="feature-text">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="modal-actions">
          <button 
            className="upgrade-btn primary"
            onClick={handleUpgrade}
            disabled={loading}
          >
            <CreditCard size={20} />
            {loading ? 'Processing...' : (
              pendingPromo 
                ? `Start ${pendingPromo.totalDays}-Day Free Trial`
                : (daysLeftInTrial > 0 
                  ? `Continue with ${selectedPlan === 'annual' ? 'Annual' : 'Monthly'} Plan`
                  : 'Start 14-Day Free Trial'
                )
            )}
          </button>
          <button className="cancel-btn" onClick={onClose}>
            Maybe Later
          </button>
        </div>

        {/* Trust Signals */}
        <div className="trust-signals">
          <p>🔒 Card required • Cancel anytime • No hidden fees</p>
          {pendingPromo && (
            <p className="promo-terms">
              Your card won't be charged for {pendingPromo.totalDays} days
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaywallModal;
