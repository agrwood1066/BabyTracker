// useInfluencer.js - Hook for checking influencer status and managing influencer data
import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export const useInfluencer = () => {
  const [isInfluencer, setIsInfluencer] = useState(false);
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkInfluencerStatus();
  }, []);

  const checkInfluencerStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsInfluencer(false);
        setLoading(false);
        return;
      }

      // Check if user is an influencer
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_influencer')
        .eq('id', user.id)
        .single();

      if (profile?.is_influencer) {
        setIsInfluencer(true);
        // Load their promo codes
        await loadPromoCodes(user.id);
      } else {
        setIsInfluencer(false);
      }
    } catch (error) {
      console.error('Error checking influencer status:', error);
      setIsInfluencer(false);
    } finally {
      setLoading(false);
    }
  };

  const loadPromoCodes = async (userId) => {
    try {
      const { data, error } = await supabase
        .rpc('get_my_promo_codes', { p_user_id: userId });

      if (error) {
        console.error('Error loading promo codes:', error);
      } else {
        setPromoCodes(data || []);
      }
    } catch (error) {
      console.error('Error in loadPromoCodes:', error);
    }
  };

  const getPrimaryPromoCode = () => {
    return promoCodes.length > 0 ? promoCodes[0] : null;
  };

  const getInfluencerDashboardUrl = () => {
    const primaryCode = getPrimaryPromoCode();
    return primaryCode ? `/influencer/${primaryCode.code}` : null;
  };

  return {
    isInfluencer,
    promoCodes,
    loading,
    getPrimaryPromoCode,
    getInfluencerDashboardUrl,
    refreshInfluencerData: checkInfluencerStatus
  };
};
