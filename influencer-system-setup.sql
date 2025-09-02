-- Influencer System SQL Functions and Setup
-- Run this file in Supabase SQL editor to set up influencer tracking

-- ============================================
-- PART 1: MANUAL INFLUENCER ONBOARDING
-- ============================================

-- Function to onboard an influencer and grant them lifetime premium
CREATE OR REPLACE FUNCTION make_influencer(
  p_email TEXT,
  p_code TEXT,
  p_name TEXT DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_user_id UUID;
  v_existing_code UUID;
BEGIN
  -- Get user ID from email
  SELECT id INTO v_user_id 
  FROM profiles 
  WHERE email = p_email;
  
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found with email: ' || p_email
    );
  END IF;
  
  -- Check if promo code already exists
  SELECT id INTO v_existing_code
  FROM promo_codes
  WHERE code = UPPER(p_code);
  
  IF v_existing_code IS NOT NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Promo code already exists: ' || p_code
    );
  END IF;
  
  -- Make them an influencer with lifetime premium
  UPDATE profiles SET
    is_influencer = true,
    subscription_status = 'lifetime_admin',
    subscription_plan = 'premium_monthly',
    admin_notes = 'Influencer account - lifetime premium',
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Create their promo code (you still need to create it in Stripe!)
  INSERT INTO promo_codes (
    code,
    influencer_name,
    influencer_email,
    influencer_user_id,
    tier,
    free_months,
    active
  ) VALUES (
    UPPER(p_code),
    COALESCE(p_name, (SELECT full_name FROM profiles WHERE id = v_user_id)),
    p_email,
    v_user_id,
    'micro', -- Default tier, can be updated later
    1, -- Default 1 month free
    true
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'promo_code', UPPER(p_code),
    'message', 'Influencer onboarded successfully. Remember to create promo code ' || UPPER(p_code) || ' in Stripe Dashboard!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 2: COMMISSION TRACKING VIEWS
-- ============================================

-- Create a view for tracking commission obligations
CREATE OR REPLACE VIEW influencer_commission_summary AS
SELECT 
  pc.code as promo_code,
  pc.influencer_name,
  pc.influencer_email,
  COUNT(DISTINCT pcu.user_id) as total_signups,
  COUNT(DISTINCT CASE 
    WHEN p.subscription_status = 'active' 
    THEN pcu.user_id 
  END) as active_users,
  COUNT(DISTINCT CASE 
    WHEN p.subscription_status = 'cancelled' 
    THEN pcu.user_id 
  END) as churned_users,
  -- Commission calculations
  COUNT(DISTINCT CASE 
    WHEN ic.milestone = 'first_month' AND ic.paid = false 
    THEN ic.id 
  END) as pending_first_month,
  COUNT(DISTINCT CASE 
    WHEN ic.milestone = '3_months' AND ic.paid = false 
    THEN ic.id 
  END) as pending_3_month_bonus,
  COUNT(DISTINCT CASE 
    WHEN ic.milestone = '6_months' AND ic.paid = false 
    THEN ic.id 
  END) as pending_6_month_bonus,
  -- Total amounts
  COALESCE(SUM(
    CASE WHEN ic.paid = false THEN ic.amount ELSE 0 END
  ), 0) as total_pending_commission,
  COALESCE(SUM(
    CASE WHEN ic.paid = true THEN ic.amount ELSE 0 END
  ), 0) as total_paid_commission
FROM promo_codes pc
LEFT JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
LEFT JOIN profiles p ON pcu.user_id = p.id
LEFT JOIN influencer_commissions ic ON ic.influencer_code = pc.code
GROUP BY pc.code, pc.influencer_name, pc.influencer_email
ORDER BY total_signups DESC;

-- ============================================
-- PART 3: ADMIN PAYMENT TRACKING
-- ============================================

-- Function to mark commissions as paid
CREATE OR REPLACE FUNCTION mark_commissions_paid(
  p_influencer_code TEXT,
  p_milestone TEXT DEFAULT NULL,
  p_payment_reference TEXT DEFAULT NULL
)
RETURNS jsonb AS $$
DECLARE
  v_updated_count INTEGER;
  v_total_amount DECIMAL;
BEGIN
  -- Update commissions based on criteria
  IF p_milestone IS NULL THEN
    -- Pay all pending commissions for this influencer
    UPDATE influencer_commissions
    SET 
      paid = true,
      paid_date = NOW()::date,
      payment_reference = p_payment_reference
    WHERE 
      influencer_code = p_influencer_code
      AND paid = false
    RETURNING amount INTO v_total_amount;
  ELSE
    -- Pay specific milestone commissions
    UPDATE influencer_commissions
    SET 
      paid = true,
      paid_date = NOW()::date,
      payment_reference = p_payment_reference
    WHERE 
      influencer_code = p_influencer_code
      AND milestone = p_milestone
      AND paid = false;
  END IF;
  
  GET DIAGNOSTICS v_updated_count = ROW_COUNT;
  
  -- Calculate total amount paid
  SELECT SUM(amount) INTO v_total_amount
  FROM influencer_commissions
  WHERE 
    influencer_code = p_influencer_code
    AND paid = true
    AND paid_date = NOW()::date;
  
  RETURN jsonb_build_object(
    'success', true,
    'commissions_marked_paid', v_updated_count,
    'total_amount', v_total_amount,
    'payment_reference', p_payment_reference
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 4: INFLUENCER DASHBOARD DATA
-- ============================================

-- Function for influencers to get their own stats
CREATE OR REPLACE FUNCTION get_influencer_stats(p_user_id UUID)
RETURNS jsonb AS $$
DECLARE
  v_stats jsonb;
  v_promo_code TEXT;
BEGIN
  -- Check if user is an influencer
  IF NOT EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = p_user_id AND is_influencer = true
  ) THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Not an influencer account'
    );
  END IF;
  
  -- Get their promo code
  SELECT code INTO v_promo_code
  FROM promo_codes
  WHERE influencer_user_id = p_user_id
  LIMIT 1;
  
  IF v_promo_code IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'No promo code found for this influencer'
    );
  END IF;
  
  -- Gather stats
  SELECT jsonb_build_object(
    'success', true,
    'promo_code', v_promo_code,
    'share_link', 'https://babystepsplanner.com/with/' || v_promo_code,
    'stats', jsonb_build_object(
      'total_signups', (
        SELECT COUNT(DISTINCT pcu.user_id)
        FROM promo_code_usage pcu
        JOIN promo_codes pc ON pcu.promo_code_id = pc.id
        WHERE pc.code = v_promo_code
      ),
      'active_users', (
        SELECT COUNT(DISTINCT pcu.user_id)
        FROM promo_code_usage pcu
        JOIN promo_codes pc ON pcu.promo_code_id = pc.id
        JOIN profiles p ON pcu.user_id = p.id
        WHERE pc.code = v_promo_code
        AND p.subscription_status = 'active'
      ),
      'pending_commission', (
        SELECT COALESCE(SUM(amount), 0)
        FROM influencer_commissions
        WHERE influencer_code = v_promo_code
        AND paid = false
      ),
      'paid_commission', (
        SELECT COALESCE(SUM(amount), 0)
        FROM influencer_commissions
        WHERE influencer_code = v_promo_code
        AND paid = true
      )
    ),
    'recent_signups', (
      SELECT jsonb_agg(
        jsonb_build_object(
          'signup_date', pcu.applied_at::date,
          'status', p.subscription_status,
          'commission_status', CASE
            WHEN EXISTS (
              SELECT 1 FROM influencer_commissions ic
              WHERE ic.user_id = pcu.user_id
              AND ic.paid = false
            ) THEN 'pending'
            WHEN EXISTS (
              SELECT 1 FROM influencer_commissions ic
              WHERE ic.user_id = pcu.user_id
              AND ic.paid = true
            ) THEN 'paid'
            ELSE 'not_eligible'
          END
        ) ORDER BY pcu.applied_at DESC
      )
      FROM (
        SELECT pcu.*, p.subscription_status
        FROM promo_code_usage pcu
        JOIN promo_codes pc ON pcu.promo_code_id = pc.id
        JOIN profiles p ON pcu.user_id = p.id
        WHERE pc.code = v_promo_code
        ORDER BY pcu.applied_at DESC
        LIMIT 20
      ) as recent
      JOIN profiles p ON recent.user_id = p.id
      JOIN promo_code_usage pcu ON recent.user_id = pcu.user_id
    )
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- PART 5: ROW LEVEL SECURITY
-- ============================================

-- Enable RLS on influencer tables (if not already enabled)
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE influencer_commissions ENABLE ROW LEVEL SECURITY;

-- Policy for influencers to see their own promo codes
CREATE POLICY "Influencers can view own promo codes"
  ON promo_codes
  FOR SELECT
  USING (influencer_user_id = auth.uid());

-- Policy for influencers to see usage of their codes
CREATE POLICY "Influencers can view own code usage"
  ON promo_code_usage
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM promo_codes
      WHERE promo_codes.id = promo_code_usage.promo_code_id
      AND promo_codes.influencer_user_id = auth.uid()
    )
  );

-- Policy for influencers to see their commissions
CREATE POLICY "Influencers can view own commissions"
  ON influencer_commissions
  FOR SELECT
  USING (
    influencer_code IN (
      SELECT code FROM promo_codes
      WHERE influencer_user_id = auth.uid()
    )
  );

-- ============================================
-- PART 6: HELPER FUNCTIONS
-- ============================================

-- Function to get all pending payments (for admin)
CREATE OR REPLACE FUNCTION get_all_pending_commissions()
RETURNS TABLE(
  influencer_name TEXT,
  promo_code TEXT,
  milestone TEXT,
  user_count BIGINT,
  total_amount DECIMAL,
  oldest_eligible_date DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pc.influencer_name,
    ic.influencer_code as promo_code,
    ic.milestone,
    COUNT(DISTINCT ic.user_id) as user_count,
    SUM(ic.amount) as total_amount,
    MIN(ic.eligible_date::date) as oldest_eligible_date
  FROM influencer_commissions ic
  JOIN promo_codes pc ON ic.influencer_code = pc.code
  WHERE ic.paid = false
  GROUP BY pc.influencer_name, ic.influencer_code, ic.milestone
  ORDER BY pc.influencer_name, ic.milestone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- USAGE EXAMPLES
-- ============================================

-- To onboard an influencer:
-- SELECT make_influencer('sarah@example.com', 'SARAH2', 'Sarah Johnson');

-- To mark commissions as paid:
-- SELECT mark_commissions_paid('SARAH2', NULL, 'BANK-TRANSFER-2025-01-15');

-- To get influencer stats (as the influencer):
-- SELECT get_influencer_stats(auth.uid());

-- To see all pending commissions (admin):
-- SELECT * FROM get_all_pending_commissions();

-- To see commission summary:
-- SELECT * FROM influencer_commission_summary;