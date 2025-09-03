// useSubscription.js - Hook for managing subscription state and feature access
import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../supabaseClient';

// Create subscription context
const SubscriptionContext = createContext(null);

// Custom hook to use subscription context
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

// Provider component
export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [vaultData, setVaultData] = useState({});
  const [promoStatus, setPromoStatus] = useState(null);

  // Check feature access with data vault logic
  const checkFeatureAccess = async (feature, currentCount = 0) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { hasAccess: false, isPremium: false };

      const { data, error } = await supabase
        .rpc('check_feature_access', {
          p_user_id: user.id,
          p_feature: feature,
          p_current_count: currentCount
        });

      if (error) {
        console.error('Error checking feature access:', error);
        return { hasAccess: false, isPremium: false };
      }

      if (data) {
        setVaultData(prev => ({ ...prev, [feature]: data }));
      }

      return data || { hasAccess: false, isPremium: false };
    } catch (err) {
      console.error('Error in checkFeatureAccess:', err);
      return { hasAccess: false, isPremium: false };
    }
  };

  // Check if user has premium access - prioritize Stripe status
  const isPremium = () => {
    // If we have Stripe subscription status, use that as the source of truth
    if (subscription?.stripe_subscription_status) {
      return ['trialing', 'active'].includes(subscription.stripe_subscription_status);
    }
    
    // Fall back to local subscription status
    return ['trial', 'active', 'lifetime_admin', 'influencer_premium'].includes(subscription?.subscription_status);
  };

  // New function to check if can start trial
  const canStartTrial = () => {
    return subscription?.subscription_status === 'free' && 
           !subscription?.has_added_card;
  };

  // Check for pending promo
  const checkPromoStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data } = await supabase
        .rpc('get_user_promo_status', {
          p_user_id: user.id
        });
      
      setPromoStatus(data);
      return data;
    } catch (error) {
      console.error('Error checking promo status:', error);
      return null;
    }
  };

  // Get promotional message
  const getPromoMessage = () => {
    if (!promoStatus || !promoStatus.has_promo) return null;
    
    const totalDays = promoStatus.total_free_days || (14 + (promoStatus.free_months * 30));
    return `You have a special offer: ${totalDays} days free!`;
  };

  // Check if subscription data is synced with Stripe
  const isSubscriptionSynced = () => {
    if (!subscription) return false;
    
    // If user has Stripe data, check if local status matches
    if (subscription.stripe_subscription_status) {
      const stripeStatus = subscription.stripe_subscription_status;
      const localStatus = subscription.subscription_status;
      
      // Map Stripe status to local status for comparison
      const statusMap = {
        'trialing': 'trial',
        'active': 'active',
        'canceled': 'free',
        'incomplete': 'free',
        'incomplete_expired': 'free',
        'past_due': 'active',
        'unpaid': 'free'
      };
      
      return statusMap[stripeStatus] === localStatus;
    }
    
    // If no Stripe data, assume synced (legacy users)
    return true;
  };

  // Get days left in trial - prioritize Stripe data
  const getDaysLeftInTrial = () => {
    if (subscription?.subscription_status !== 'trial') return 0;
    
    let trialEnd;
    
    // Priority 1: Use Stripe trial end if available (most accurate)
    if (subscription?.stripe_trial_end) {
      trialEnd = new Date(subscription.stripe_trial_end);
    }
    // Priority 2: Use Stripe current period end if in trialing status
    else if (subscription?.stripe_subscription_status === 'trialing' && subscription?.stripe_current_period_end) {
      trialEnd = new Date(subscription.stripe_current_period_end);
    }
    // Priority 3: If user has promo code with extended trial, calculate from promo months
    else if (subscription?.promo_months_granted && subscription?.created_at) {
      const createdDate = new Date(subscription.created_at);
      trialEnd = new Date(createdDate.setMonth(createdDate.getMonth() + subscription.promo_months_granted));
    }
    // Priority 4: Fall back to local trial_ends_at field
    else {
      trialEnd = new Date(subscription.trial_ends_at);
    }
    
    const now = new Date();
    const daysLeft = Math.ceil((trialEnd - now) / (1000 * 60 * 60 * 24));
    return Math.max(0, daysLeft);
  };

  // Get appropriate Stripe checkout URL
  const getUpgradeUrl = (priceType = 'monthly', promoCode = null) => {
    // Stripe Payment Links - simplified to one monthly option
    const urls = {
      monthly: process.env.REACT_APP_STRIPE_LAUNCH_MONTHLY_URL || 'https://buy.stripe.com/fZu4gzdiC2eE0Kx8opeME01',
      annual: process.env.REACT_APP_STRIPE_ANNUAL_URL || 'https://buy.stripe.com/5kQ6oH7Yi8D2gJveMNeME00'
    };

    let url = urls[priceType] || urls.monthly;
    
    // Add promo code if provided
    if (promoCode) {
      url += `?prefilled_promo_code=${promoCode}`;
    }
    
    // Add customer email if available
    if (subscription?.email) {
      const separator = promoCode ? '&' : '?';
      url += `${separator}prefilled_email=${encodeURIComponent(subscription.email)}`;
    }

    return url;
  };

  // Check if trial has expired and update status
  const checkAndUpdateTrialStatus = async () => {
    if (!subscription) return;

    if (subscription.subscription_status === 'trial' && 
        new Date(subscription.trial_ends_at) < new Date()) {
      // Trial has expired, update to free
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
          .from('profiles')
          .update({ 
            subscription_status: 'free',
            subscription_plan: 'free'
          })
          .eq('id', user.id);

        if (!error) {
          setSubscription(prev => ({
            ...prev,
            subscription_status: 'free',
            subscription_plan: 'free'
          }));
        }
      } catch (err) {
        console.error('Error updating trial status:', err);
      }
    }
  };

  // Load subscription data
  const loadSubscription = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading subscription:', error);
      } else {
        setSubscription(data);
        // Check trial status after loading
        if (data?.subscription_status === 'trial') {
          await checkAndUpdateTrialStatus();
        }
        // Check for pending promo
        await checkPromoStatus();
      }
    } catch (err) {
      console.error('Error in loadSubscription:', err);
    } finally {
      setLoading(false);
    }
  };

  // Get feature limits for current plan
  const getFeatureLimits = () => {
    if (isPremium()) {
      return {
        shopping_items: -1, // Unlimited
        budget_categories: -1,
        baby_names: -1,
        hospital_bag: -1,
        family_sharing: -1,
        wishlist: -1,
        parenting_vows: -1, // Premium feature
        export_pdf: true
      };
    }

    // Free tier limits
    return {
      shopping_items: 10,
      budget_categories: 3,
      baby_names: 5,
      hospital_bag: 0, // Premium only
      family_sharing: 0, // Premium only
      wishlist: 0, // Premium only
      parenting_vows: 0, // Premium only
      export_pdf: false
    };
  };

  // Check if a specific feature is available
  const hasFeature = (featureName) => {
    const limits = getFeatureLimits();
    return limits[featureName] !== 0;
  };

  // Get subscription display info with Stripe integration details
  const getSubscriptionInfo = () => {
    if (!subscription) return { status: 'Unknown', badge: null };

    // Check if we have Stripe integration
    const hasStripeData = !!subscription.stripe_customer_id;
    const syncStatus = isSubscriptionSynced();

    switch (subscription.subscription_status) {
      case 'lifetime_admin':
        return { 
          status: 'Lifetime Premium', 
          badge: '👑',
          color: 'gold',
          hasStripeData,
          syncStatus,
          details: 'Admin granted lifetime access'
        };
      case 'influencer_premium':
        return { 
          status: 'Influencer Premium', 
          badge: '✨',
          color: 'purple',
          hasStripeData,
          syncStatus,
          details: 'Complimentary influencer access'
        };
      case 'active':
        const planType = subscription.subscription_plan === 'premium_annual' ? 'Annual' : 'Monthly';
        let details = planType;
        
        // Add next billing date if available
        if (subscription.stripe_current_period_end) {
          const nextBilling = new Date(subscription.stripe_current_period_end).toLocaleDateString();
          details += ` • Next billing: ${nextBilling}`;
        }
        
        // Add payment method if available
        if (subscription.payment_method_brand && subscription.payment_method_last4) {
          details += ` • ${subscription.payment_method_brand.toUpperCase()} ****${subscription.payment_method_last4}`;
        }
        
        return { 
          status: planType,
          badge: '⭐',
          color: 'green',
          hasStripeData,
          syncStatus,
          details
        };
      case 'trial':
        const daysLeft = getDaysLeftInTrial();
        let trialDetails = '';
        
        // Show promo code info if available
        if (subscription.promo_code_used && subscription.promo_months_granted) {
          trialDetails = `${subscription.promo_months_granted} month${subscription.promo_months_granted > 1 ? 's' : ''} free trial`;
        } else {
          trialDetails = '14-day free trial';
        }
        
        // Add trial end date if available from Stripe
        if (subscription.stripe_trial_end) {
          const trialEnd = new Date(subscription.stripe_trial_end).toLocaleDateString();
          trialDetails += ` • Expires: ${trialEnd}`;
        }
        
        return { 
          status: `Trial (${daysLeft} days left)`,
          badge: '🎁',
          color: daysLeft <= 3 ? 'orange' : 'blue',
          hasStripeData,
          syncStatus,
          details: trialDetails
        };
      case 'free':
        return { 
          status: 'Free',
          badge: null,
          color: 'gray',
          hasStripeData,
          syncStatus,
          details: hasStripeData ? 'Subscription ended or canceled' : 'No active subscription'
        };
      default:
        return { 
          status: 'Free',
          badge: null,
          color: 'gray',
          hasStripeData,
          syncStatus,
          details: 'Unknown status'
        };
    }
  };

  // Initialize on mount
  useEffect(() => {
    loadSubscription();

    // Subscribe to auth changes
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        loadSubscription();
      } else if (event === 'SIGNED_OUT') {
        setSubscription(null);
        setVaultData({});
      }
    });

    // Check trial status every hour
    const intervalId = setInterval(checkAndUpdateTrialStatus, 60 * 60 * 1000);

    return () => {
      authListener?.subscription?.unsubscribe();
      clearInterval(intervalId);
    };
  }, []);

  const value = {
    subscription,
    loading,
    isPremium,
    canStartTrial,
    checkFeatureAccess,
    getDaysLeftInTrial,
    getUpgradeUrl,
    vaultData,
    getFeatureLimits,
    hasFeature,
    getSubscriptionInfo,
    refreshSubscription: loadSubscription,
    isSubscriptionSynced,
    hasStripeIntegration: !!subscription?.stripe_customer_id,
    promoStatus,
    checkPromoStatus,
    getPromoMessage
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
