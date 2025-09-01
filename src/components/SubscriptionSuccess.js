import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './SubscriptionSuccess.css';

const SubscriptionSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading, success, error
  const [message, setMessage] = useState('');

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const success = searchParams.get('success');
    const canceled = searchParams.get('canceled');

    if (canceled === 'true') {
      setStatus('canceled');
      setMessage('Payment was cancelled. You can try again anytime.');
      setTimeout(() => navigate('/dashboard'), 3000);
      return;
    }

    if (success === 'true') {
      verifySubscription();
    } else {
      setStatus('error');
      setMessage('Something went wrong. Please contact support.');
    }
  }, [searchParams, navigate]);

  const verifySubscription = async () => {
    try {
      // Wait a moment for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Check if user's subscription is now active
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No user found');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('subscription_status, subscription_plan, locked_in_price')
        .eq('id', user.id)
        .single();

      if (profile && profile.subscription_status === 'active') {
        setStatus('success');
        
        // Check if they got launch pricing
        if (profile.locked_in_price === 6.99) {
          setMessage('🎉 Welcome to Premium! You locked in our launch price of £6.99/month forever!');
        } else if (profile.subscription_plan === 'premium_annual') {
          setMessage('🎉 Welcome to Premium! You\'re saving £14 with our annual plan!');
        } else {
          setMessage('🎉 Welcome to Premium! You now have unlimited access to all features!');
        }

        // Redirect to dashboard after 3 seconds
        setTimeout(() => navigate('/dashboard'), 3000);
      } else {
        // Webhook might still be processing
        setStatus('processing');
        setMessage('Setting up your subscription... This may take a few moments.');
        
        // Try again in 3 seconds
        setTimeout(() => verifySubscription(), 3000);
      }
    } catch (error) {
      console.error('Error verifying subscription:', error);
      setStatus('error');
      setMessage('Unable to verify subscription. Please refresh the page or contact support.');
    }
  };

  return (
    <div className="subscription-success-page">
      <div className="success-container">
        {status === 'loading' && (
          <>
            <Loader className="spinner" size={48} />
            <h2>Processing your subscription...</h2>
            <p>Please wait while we set up your account.</p>
          </>
        )}

        {status === 'processing' && (
          <>
            <Loader className="spinner" size={48} />
            <h2>Almost there...</h2>
            <p>{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <CheckCircle className="success-icon" size={64} color="#10b981" />
            <h2>Payment Successful!</h2>
            <p>{message}</p>
            <div className="features-unlocked">
              <h3>You now have access to:</h3>
              <ul>
                <li>✅ Unlimited shopping items</li>
                <li>✅ Unlimited budget categories</li>
                <li>✅ Unlimited baby names</li>
                <li>✅ Wishlist creation & sharing</li>
                <li>✅ Hospital bag customisation</li>
                <li>✅ Family sharing & collaboration</li>
                <li>✅ PDF & Excel exports</li>
                <li>✅ Priority support</li>
              </ul>
            </div>
            <p className="redirect-notice">Redirecting to your dashboard...</p>
          </>
        )}

        {status === 'canceled' && (
          <>
            <XCircle className="error-icon" size={64} color="#ef4444" />
            <h2>Payment Cancelled</h2>
            <p>{message}</p>
            <button onClick={() => navigate('/dashboard')} className="return-button">
              Return to Dashboard
            </button>
          </>
        )}

        {status === 'error' && (
          <>
            <XCircle className="error-icon" size={64} color="#ef4444" />
            <h2>Something went wrong</h2>
            <p>{message}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
            <button onClick={() => navigate('/dashboard')} className="return-button">
              Return to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default SubscriptionSuccess;
