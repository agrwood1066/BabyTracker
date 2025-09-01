// SubscriptionActivation.js - Handle post-Stripe checkout activation
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

      if (data && data.success) {
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
        throw new Error(data?.error || 'Failed to activate trial');
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