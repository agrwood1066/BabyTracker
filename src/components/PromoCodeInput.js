import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Gift, CheckCircle, XCircle } from 'lucide-react';
import './PromoCodeInput.css';

const PromoCodeInput = ({ onSuccess }) => {
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check URL params for promo code
    const urlParams = new URLSearchParams(window.location.search);
    const codeFromUrl = urlParams.get('code');
    
    if (codeFromUrl) {
      setPromoCode(codeFromUrl.toUpperCase());
      // Auto-apply if from URL
      applyCode(codeFromUrl);
    }
  }, []);

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
        throw error;
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
          freeMonths: data.free_months,
          influencer: data.influencer
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
      setMessage('Unable to apply promo code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    applyCode();
  };

  return (
    <div className="promo-code-container">
      <div className="promo-code-header">
        <Gift size={24} />
        <h3>Have a Promo Code?</h3>
      </div>
      
      <form onSubmit={handleSubmit} className="promo-code-form">
        <div className="promo-input-group">
          <input
            type="text"
            placeholder="Enter code (e.g., SARAH-1)"
            value={promoCode}
            onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
            disabled={loading || status === 'success'}
            className={`promo-input ${status}`}
          />
          <button
            type="submit"
            disabled={loading || status === 'success'}
            className="promo-button"
          >
            {loading ? 'Applying...' : 'Apply'}
          </button>
        </div>
      </form>

      {status && (
        <div className={`promo-status ${status}`}>
          {status === 'success' ? (
            <>
              <CheckCircle size={20} />
              <span>{message}</span>
            </>
          ) : (
            <>
              <XCircle size={20} />
              <span>{message}</span>
            </>
          )}
        </div>
      )}

      <div className="promo-benefits">
        <p>✨ Get up to 2 months free with influencer codes</p>
        <p>💰 Launch pricing available: £6.99/month</p>
        <p>🎁 Share with friends for rewards</p>
      </div>
    </div>
  );
};

export default PromoCodeInput;
