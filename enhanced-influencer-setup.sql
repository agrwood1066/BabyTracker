-- Enhanced influencer setup function with all required fields
CREATE OR REPLACE FUNCTION make_influencer_premium(
  p_email TEXT,
  p_code TEXT,
  p_name TEXT DEFAULT NULL,
  p_tier TEXT DEFAULT 'micro'
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
  
  -- Make them an influencer with proper premium status
  UPDATE profiles SET
    is_influencer = true,
    influencer_verified_at = NOW(),
    subscription_status = 'influencer_premium',      -- Proper influencer status
    subscription_plan = 'premium_monthly',
    locked_in_price = 0,                             -- Free for influencers
    admin_notes = 'Manually approved influencer - ' || p_tier || ' tier',
    updated_at = NOW()
  WHERE id = v_user_id;
  
  -- Create their promo code
  INSERT INTO promo_codes (
    code,
    influencer_name,
    influencer_email,
    influencer_user_id,
    tier,
    free_months,
    active,
    claimed_at
  ) VALUES (
    UPPER(p_code),
    COALESCE(p_name, (SELECT full_name FROM profiles WHERE id = v_user_id)),
    p_email,
    v_user_id,
    p_tier,
    CASE 
      WHEN p_tier = 'micro' THEN 1
      WHEN p_tier = 'mid' THEN 2  
      WHEN p_tier = 'major' THEN 3
      ELSE 1
    END,
    true,
    NOW()  -- Mark as claimed immediately
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'user_id', v_user_id,
    'promo_code', UPPER(p_code),
    'tier', p_tier,
    'message', 'Influencer onboarded successfully with ' || p_tier || ' tier access. Remember to create promo code ' || UPPER(p_code) || ' in Stripe Dashboard!'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION make_influencer_premium TO authenticated;

-- Usage examples:
-- SELECT make_influencer_premium('sarah@example.com', 'SARAH-2', 'Sarah Johnson', 'micro');
-- SELECT make_influencer_premium('alex@example.com', 'ALEX-1', 'Alex Smith', 'mid');
