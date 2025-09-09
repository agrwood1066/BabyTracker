-- ============================================
-- FIX: PostgreSQL Error 42803 - Subquery uses ungrouped column
-- ============================================
-- This fixes the SQL aggregation error in get_influencer_stats_secure

-- The issue is in this line:
-- COALESCE((SELECT locked_in_price FROM profiles WHERE id = pcu.user_id AND locked_in_price IS NOT NULL LIMIT 1), 6.99)
-- This subquery references pcu.user_id which is not in the GROUP BY clause

CREATE OR REPLACE FUNCTION get_influencer_stats_secure(p_user_id UUID, p_code TEXT)
RETURNS TABLE (
    total_signups BIGINT,
    active_trials BIGINT,
    paid_conversions BIGINT,
    conversion_rate NUMERIC,
    pending_commission NUMERIC,
    paid_commission NUMERIC,
    monthly_revenue NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
BEGIN
    -- Verify the user owns this promo code
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND influencer_user_id = p_user_id;
    
    IF v_promo IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: You do not have access to this promo code';
    END IF;
    
    -- Return the stats with fixed aggregation
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT pcu.user_id)::BIGINT as total_signups,
        COUNT(DISTINCT CASE 
            WHEN p.subscription_status = 'trial' 
            AND p.trial_ends_at > NOW() 
            THEN pcu.user_id 
        END)::BIGINT as active_trials,
        COUNT(DISTINCT CASE 
            WHEN p.subscription_status = 'active' 
            THEN pcu.user_id 
        END)::BIGINT as paid_conversions,
        ROUND(
            COALESCE(
                COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pcu.user_id END)::numeric / 
                NULLIF(COUNT(DISTINCT pcu.user_id), 0) * 100, 
                0
            ), 
            1
        ) as conversion_rate,
        COALESCE(SUM(
            CASE WHEN ic.paid = false THEN ic.amount ELSE 0 END
        ), 0) as pending_commission,
        COALESCE(SUM(
            CASE WHEN ic.paid = true THEN ic.amount ELSE 0 END
        ), 0) as paid_commission,
        -- FIXED: Use aggregate function instead of subquery
        COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pcu.user_id END)::numeric * 
        COALESCE(
            AVG(CASE WHEN p.locked_in_price IS NOT NULL THEN p.locked_in_price ELSE NULL END),
            6.99
        ) as monthly_revenue
    FROM promo_codes pc
    LEFT JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
    LEFT JOIN profiles p ON pcu.user_id = p.id
    LEFT JOIN influencer_commissions ic ON ic.influencer_code = pc.code AND ic.user_id = pcu.user_id
    WHERE pc.code = p_code
    GROUP BY pc.code;
END;
$$;

-- Alternative approach: If you want more precise revenue calculation per user,
-- we can create a separate function or use a different approach
CREATE OR REPLACE FUNCTION get_influencer_stats_secure_detailed(p_user_id UUID, p_code TEXT)
RETURNS TABLE (
    total_signups BIGINT,
    active_trials BIGINT,
    paid_conversions BIGINT,
    conversion_rate NUMERIC,
    pending_commission NUMERIC,
    paid_commission NUMERIC,
    monthly_revenue NUMERIC
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_promo RECORD;
    v_revenue NUMERIC := 0;
BEGIN
    -- Verify the user owns this promo code
    SELECT * INTO v_promo
    FROM promo_codes
    WHERE UPPER(code) = UPPER(p_code)
    AND influencer_user_id = p_user_id;
    
    IF v_promo IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: You do not have access to this promo code';
    END IF;
    
    -- Calculate revenue separately to handle different pricing per user
    SELECT COALESCE(SUM(COALESCE(p.locked_in_price, 6.99)), 0)
    INTO v_revenue
    FROM promo_codes pc
    JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
    JOIN profiles p ON pcu.user_id = p.id
    WHERE pc.code = p_code
    AND p.subscription_status = 'active';
    
    -- Return the stats
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT pcu.user_id)::BIGINT as total_signups,
        COUNT(DISTINCT CASE 
            WHEN p.subscription_status = 'trial' 
            AND p.trial_ends_at > NOW() 
            THEN pcu.user_id 
        END)::BIGINT as active_trials,
        COUNT(DISTINCT CASE 
            WHEN p.subscription_status = 'active' 
            THEN pcu.user_id 
        END)::BIGINT as paid_conversions,
        ROUND(
            COALESCE(
                COUNT(DISTINCT CASE WHEN p.subscription_status = 'active' THEN pcu.user_id END)::numeric / 
                NULLIF(COUNT(DISTINCT pcu.user_id), 0) * 100, 
                0
            ), 
            1
        ) as conversion_rate,
        COALESCE(SUM(
            CASE WHEN ic.paid = false THEN ic.amount ELSE 0 END
        ), 0) as pending_commission,
        COALESCE(SUM(
            CASE WHEN ic.paid = true THEN ic.amount ELSE 0 END
        ), 0) as paid_commission,
        v_revenue as monthly_revenue
    FROM promo_codes pc
    LEFT JOIN promo_code_usage pcu ON pc.id = pcu.promo_code_id
    LEFT JOIN profiles p ON pcu.user_id = p.id
    LEFT JOIN influencer_commissions ic ON ic.influencer_code = pc.code AND ic.user_id = pcu.user_id
    WHERE pc.code = p_code
    GROUP BY pc.code;
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_influencer_stats_secure_detailed TO authenticated;

-- Test the function (optional - run this manually to verify)
-- SELECT * FROM get_influencer_stats_secure('your-user-id', 'SARAH-1');
