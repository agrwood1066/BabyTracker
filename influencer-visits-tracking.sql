-- Influencer Visits Tracking Database Updates
-- Run this script to enable visit tracking for the two-step influencer approach

-- 1. Create promo_visits table for tracking link clicks
CREATE TABLE IF NOT EXISTS promo_visits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    promo_code TEXT NOT NULL,
    visited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_agent TEXT,
    referrer TEXT,
    ip_address INET DEFAULT inet_client_addr(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS promo_visits_code_date_idx ON promo_visits(promo_code, visited_at);
CREATE INDEX IF NOT EXISTS promo_visits_date_idx ON promo_visits(visited_at);

-- 2. Drop existing functions and recreate with new return types
DROP FUNCTION IF EXISTS get_influencer_stats_secure(uuid, text);
DROP FUNCTION IF EXISTS get_influencer_weekly_stats_secure(uuid, text);

-- Create updated influencer stats function to use visits instead of signups
CREATE OR REPLACE FUNCTION get_influencer_stats_secure(
    p_user_id UUID,
    p_code TEXT
)
RETURNS TABLE(
    total_visits BIGINT,
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
BEGIN
    -- Check if user owns this promo code
    IF NOT EXISTS (
        SELECT 1 FROM promo_codes 
        WHERE code = p_code 
        AND influencer_user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized access to promo code';
    END IF;
    
    RETURN QUERY
    SELECT 
        -- Count total visits to the promo landing page
        COALESCE((
            SELECT COUNT(*) FROM promo_visits 
            WHERE promo_code = p_code
        ), 0) as total_visits,
        
        -- Count active trials from actual signups
        COALESCE((
            SELECT COUNT(DISTINCT pcu.user_id) 
            FROM promo_code_usage pcu
            JOIN profiles p ON pcu.user_id = p.id
            WHERE pcu.promo_code = p_code 
            AND p.subscription_status = 'trial'
            AND p.trial_ends_at > NOW()
        ), 0) as active_trials,
        
        -- Count paid conversions
        COALESCE((
            SELECT COUNT(DISTINCT pcu.user_id)
            FROM promo_code_usage pcu
            JOIN profiles p ON pcu.user_id = p.id
            WHERE pcu.promo_code = p_code 
            AND p.subscription_status = 'active'
        ), 0) as paid_conversions,
        
        -- Calculate conversion rate (paid conversions / total visits)
        CASE 
            WHEN (SELECT COUNT(*) FROM promo_visits WHERE promo_code = p_code) > 0 THEN
                ROUND(
                    (SELECT COUNT(DISTINCT pcu.user_id)
                     FROM promo_code_usage pcu
                     JOIN profiles p ON pcu.user_id = p.id
                     WHERE pcu.promo_code = p_code 
                     AND p.subscription_status = 'active')::numeric / 
                    (SELECT COUNT(*) FROM promo_visits WHERE promo_code = p_code)::numeric * 100, 
                    1
                )
            ELSE 0
        END as conversion_rate,
        
        -- Pending commission
        COALESCE((
            SELECT SUM(amount) 
            FROM influencer_commissions ic
            WHERE ic.influencer_code = p_code 
            AND ic.paid = false
        ), 0) as pending_commission,
        
        -- Paid commission
        COALESCE((
            SELECT SUM(amount) 
            FROM influencer_commissions ic
            WHERE ic.influencer_code = p_code 
            AND ic.paid = true
        ), 0) as paid_commission,
        
        -- Monthly revenue generated (paid customers * average price)
        COALESCE((
            SELECT COUNT(DISTINCT pcu.user_id) * 6.99
            FROM promo_code_usage pcu
            JOIN profiles p ON pcu.user_id = p.id
            WHERE pcu.promo_code = p_code 
            AND p.subscription_status = 'active'
        ), 0) as monthly_revenue;
END;
$$;

-- 3. Create updated weekly stats function for visits
CREATE OR REPLACE FUNCTION get_influencer_weekly_stats_secure(
    p_user_id UUID,
    p_code TEXT
)
RETURNS TABLE(
    week_num INTEGER,
    visits BIGINT,
    signups BIGINT,
    conversions BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if user owns this promo code
    IF NOT EXISTS (
        SELECT 1 FROM promo_codes 
        WHERE code = p_code 
        AND influencer_user_id = p_user_id
    ) THEN
        RAISE EXCEPTION 'Unauthorized access to promo code';
    END IF;
    
    RETURN QUERY
    WITH weeks AS (
        SELECT generate_series(
            DATE_TRUNC('week', NOW() - INTERVAL '12 weeks'),
            DATE_TRUNC('week', NOW()),
            INTERVAL '1 week'
        )::date as week_start
    ),
    visit_stats AS (
        SELECT 
            DATE_TRUNC('week', visited_at)::date as week_start,
            COUNT(*) as visit_count
        FROM promo_visits 
        WHERE promo_code = p_code
        AND visited_at >= NOW() - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', visited_at)::date
    ),
    signup_stats AS (
        SELECT 
            DATE_TRUNC('week', pcu.applied_at)::date as week_start,
            COUNT(DISTINCT pcu.user_id) as signup_count
        FROM promo_code_usage pcu
        WHERE pcu.promo_code = p_code
        AND pcu.applied_at >= NOW() - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', pcu.applied_at)::date
    ),
    conversion_stats AS (
        SELECT 
            DATE_TRUNC('week', pcu.first_payment_at)::date as week_start,
            COUNT(DISTINCT pcu.user_id) as conversion_count
        FROM promo_code_usage pcu
        JOIN profiles p ON pcu.user_id = p.id
        WHERE pcu.promo_code = p_code
        AND pcu.first_payment_at >= NOW() - INTERVAL '12 weeks'
        AND p.subscription_status = 'active'
        GROUP BY DATE_TRUNC('week', pcu.first_payment_at)::date
    )
    SELECT 
        ROW_NUMBER() OVER (ORDER BY w.week_start)::INTEGER as week_num,
        COALESCE(vs.visit_count, 0) as visits,
        COALESCE(ss.signup_count, 0) as signups,
        COALESCE(cs.conversion_count, 0) as conversions
    FROM weeks w
    LEFT JOIN visit_stats vs ON w.week_start = vs.week_start
    LEFT JOIN signup_stats ss ON w.week_start = ss.week_start
    LEFT JOIN conversion_stats cs ON w.week_start = cs.week_start
    ORDER BY w.week_start;
END;
$$;

-- 4. Add RLS policy for promo_visits (allow inserts from anyone, selects only for influencers)
ALTER TABLE promo_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public inserts on promo_visits" ON promo_visits
    FOR INSERT
    WITH CHECK (true);

CREATE POLICY "Allow influencers to view their visits" ON promo_visits
    FOR SELECT
    USING (
        promo_code IN (
            SELECT code FROM promo_codes 
            WHERE influencer_user_id = auth.uid()
        )
    );

-- 5. Grant necessary permissions
GRANT INSERT ON promo_visits TO authenticated;
GRANT INSERT ON promo_visits TO anon;
GRANT SELECT ON promo_visits TO authenticated;

-- 6. Create a function to clean up old visit data (optional - run monthly)
CREATE OR REPLACE FUNCTION cleanup_old_promo_visits()
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Delete visits older than 6 months
    DELETE FROM promo_visits 
    WHERE visited_at < NOW() - INTERVAL '6 months';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    
    RETURN deleted_count;
END;
$$;

-- 7. Test the new functions (optional)
-- SELECT * FROM get_influencer_stats_secure(
--     (SELECT id FROM profiles WHERE email = 'your-influencer@email.com'),
--     'SARAH-1'
-- );

COMMIT;

-- Success message
SELECT 'Influencer visits tracking setup complete! 🎉' as status;
