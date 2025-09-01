-- Quick fix for the apply_subscription_pricing function syntax error
-- Run this after the main migration if you get an error

DROP FUNCTION IF EXISTS apply_subscription_pricing(UUID, TEXT);

CREATE OR REPLACE FUNCTION apply_subscription_pricing(
    p_user_id UUID,
    p_plan TEXT
)
RETURNS jsonb AS $$
DECLARE
    v_price DECIMAL(10,2);
BEGIN
    -- Set standard pricing
    IF p_plan = 'premium_monthly' THEN
        v_price := 6.99;
    ELSIF p_plan = 'premium_annual' THEN
        v_price := 69.99;
    ELSE
        v_price := 0;
    END IF;
    
    -- Lock in the price
    UPDATE profiles 
    SET 
        locked_in_price = v_price,
        subscription_plan = p_plan,
        subscription_status = 'active',
        updated_at = NOW()
    WHERE id = p_user_id;
    
    RETURN jsonb_build_object(
        'success', true,
        'price_locked', v_price,
        'plan', p_plan,
        'message', CASE 
            WHEN p_plan = 'premium_monthly' THEN 
                'Subscription activated at £6.99/month'
            WHEN p_plan = 'premium_annual' THEN
                'Annual subscription activated at £69.99/year - You save £14!'
            ELSE 
                'Subscription updated'
        END
    );
END;
$$ LANGUAGE plpgsql;
