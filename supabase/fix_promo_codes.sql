-- Fix Promo Codes and Functions for Baby Steps Paywall
-- Run this if promo codes are not working

-- First, ensure apply_promo_code function exists
CREATE OR REPLACE FUNCTION apply_promo_code(
    p_user_id UUID,
    p_code TEXT
)
RETURNS jsonb AS $$
DECLARE
    v_promo RECORD;
    v_existing RECORD;
    v_result jsonb;
BEGIN
    -- Check if user already used a promo code
    SELECT * INTO v_existing
    FROM promo_code_usage
    WHERE user_id = p_user_id;
    
    IF v_existing IS NOT NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'You have already used a promo code'
        );
    END IF;
    
    -- Get promo code details
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND active = true;
    
    IF v_promo IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'Invalid promo code'
        );
    END IF;
    
    -- Check usage limit
    IF v_promo.usage_limit IS NOT NULL AND v_promo.times_used >= v_promo.usage_limit THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'This promo code has reached its usage limit'
        );
    END IF;
    
    -- Check expiry
    IF v_promo.expires_at IS NOT NULL AND v_promo.expires_at < NOW() THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'This promo code has expired'
        );
    END IF;
    
    -- Apply the promo code
    INSERT INTO promo_code_usage (
        promo_code_id,
        user_id,
        applied_at
    ) VALUES (
        v_promo.id,
        p_user_id,
        NOW()
    );
    
    -- Update promo code usage count
    UPDATE promo_codes
    SET times_used = times_used + 1
    WHERE id = v_promo.id;
    
    -- Extend user's trial based on promo code
    UPDATE profiles
    SET trial_ends_at = NOW() + (v_promo.free_months || ' months')::interval
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'message', format('Promo code applied! You get %s month(s) free trial', v_promo.free_months),
        'free_months', v_promo.free_months,
        'influencer_name', v_promo.influencer_name
    );
END;
$$ LANGUAGE plpgsql;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION apply_promo_code TO authenticated;
GRANT EXECUTE ON FUNCTION apply_promo_code TO anon;

-- Insert sample promo codes (if they don't exist)
INSERT INTO promo_codes (code, influencer_name, influencer_email, tier, free_months, usage_limit, active, notes)
VALUES 
    ('SARAH-1', 'Sarah Smith', 'sarah@example.com', 'micro', 1, NULL, true, 'Test influencer - micro tier'),
    ('EMMA-2', 'Emma Johnson', 'emma@example.com', 'mid', 2, NULL, true, 'Test influencer - mid tier'),
    ('LAUNCH50', 'Launch Promo', NULL, 'micro', 1, 50, true, 'Limited launch promotion'),
    ('TEST30', 'Test 30 Days', NULL, 'micro', 1, NULL, true, 'Test code for 30 day trial')
ON CONFLICT (code) DO UPDATE SET
    active = true,
    free_months = EXCLUDED.free_months,
    notes = EXCLUDED.notes;

-- Verify promo codes exist
SELECT code, influencer_name, free_months, usage_limit, times_used, active 
FROM promo_codes 
ORDER BY created_at DESC;

-- Check if RLS is properly configured
ALTER TABLE promo_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE promo_code_usage ENABLE ROW LEVEL SECURITY;

-- Create or replace RLS policies
DROP POLICY IF EXISTS "Public can view active promo codes" ON promo_codes;
CREATE POLICY "Public can view active promo codes" ON promo_codes
    FOR SELECT USING (active = true);

DROP POLICY IF EXISTS "Users can view own promo usage" ON promo_code_usage;
CREATE POLICY "Users can view own promo usage" ON promo_code_usage
    FOR SELECT USING (user_id = auth.uid());

-- Test query to verify everything is set up
-- This should return the promo codes if successful
SELECT 
    'Promo codes setup: ' || COUNT(*)::text || ' codes available' as status
FROM promo_codes 
WHERE active = true;
