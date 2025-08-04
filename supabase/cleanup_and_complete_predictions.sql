-- ============================================
-- COMPLETE CLEANUP AND REBUILD OF ons_name_predictions
-- Remove duplicates and add predictions for ALL names in ons_baby_names
-- ============================================

-- Step 1: Clear all existing predictions (clean slate)
DELETE FROM ons_name_predictions;

-- Step 2: Generate predictions for ALL names in ons_baby_names
-- Using a systematic approach based on current trends and cultural categories

INSERT INTO ons_name_predictions (name_id, prediction_year, predicted_rank, confidence_score, prediction_type, created_at)
SELECT 
    n.id as name_id,
    year_val as prediction_year,
    CASE 
        -- RISING FAST names - aggressive upward trajectory
        WHEN t.trend_category = 'RISING FAST' THEN 
            GREATEST(1, t.current_rank - (year_val - 2024) * 8)
        
        -- STRONG MOMENTUM names - steady upward movement
        WHEN t.trend_category = 'STRONG MOMENTUM' THEN 
            GREATEST(1, t.current_rank - (year_val - 2024) * 5)
        
        -- STABLE names - minimal change
        WHEN t.trend_category = 'STABLE' THEN 
            t.current_rank + ROUND(RANDOM() * 4 - 2) -- +/- 2 positions randomly
        
        -- COOLING names - gradual decline
        WHEN t.trend_category = 'COOLING' THEN 
            LEAST(200, t.current_rank + (year_val - 2024) * 3)
        
        -- FALLING names - steady decline
        WHEN t.trend_category = 'FALLING' THEN 
            LEAST(200, t.current_rank + (year_val - 2024) * 6)
        
        -- NEW ENTRY names - cautious optimism
        WHEN t.trend_category = 'NEW ENTRY' THEN 
            GREATEST(1, t.current_rank - (year_val - 2024) * 3)
        
        -- No trend data - conservative estimate based on current rank
        ELSE 
            CASE 
                WHEN t.current_rank IS NULL THEN NULL
                WHEN t.current_rank <= 20 THEN t.current_rank + ROUND(RANDOM() * 6 - 3)
                WHEN t.current_rank <= 50 THEN t.current_rank + ROUND(RANDOM() * 10 - 5)
                ELSE t.current_rank + ROUND(RANDOM() * 20 - 10)
            END
    END as predicted_rank,
    
    CASE 
        -- Confidence decreases with time distance and increases with stability
        WHEN year_val = 2025 THEN 
            CASE 
                WHEN t.trend_category IN ('STABLE', 'RISING FAST') THEN 0.85 + RANDOM() * 0.10
                WHEN t.trend_category IN ('STRONG MOMENTUM', 'COOLING') THEN 0.75 + RANDOM() * 0.10
                ELSE 0.65 + RANDOM() * 0.10
            END
        WHEN year_val = 2026 THEN 
            CASE 
                WHEN t.trend_category IN ('STABLE', 'RISING FAST') THEN 0.75 + RANDOM() * 0.10
                WHEN t.trend_category IN ('STRONG MOMENTUM', 'COOLING') THEN 0.65 + RANDOM() * 0.10
                ELSE 0.55 + RANDOM() * 0.10
            END
        WHEN year_val = 2027 THEN 
            CASE 
                WHEN t.trend_category IN ('STABLE', 'RISING FAST') THEN 0.65 + RANDOM() * 0.10
                WHEN t.trend_category IN ('STRONG MOMENTUM', 'COOLING') THEN 0.55 + RANDOM() * 0.10
                ELSE 0.45 + RANDOM() * 0.10
            END
        ELSE 0.50
    END as confidence_score,
    
    CASE 
        WHEN t.trend_category IN ('RISING FAST', 'STRONG MOMENTUM', 'NEW ENTRY') THEN 'Momentum'
        WHEN t.trend_category IN ('FALLING', 'COOLING') THEN 'Declining'
        WHEN n.cultural_category IN ('Cultural', 'Islamic', 'Celtic', 'Nature') THEN 'Cultural'
        ELSE 'Conservative'
    END as prediction_type,
    
    NOW() as created_at

FROM ons_baby_names n
LEFT JOIN ons_name_trends t ON n.id = t.name_id
CROSS JOIN (VALUES (2025), (2026), (2027)) AS years(year_val)
WHERE n.name IS NOT NULL;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check total predictions created
SELECT COUNT(*) as total_predictions FROM ons_name_predictions;

-- Check predictions per name (should be 3 for each name)
SELECT 
    COUNT(DISTINCT n.id) as total_names,
    COUNT(p.id) as total_predictions,
    ROUND(COUNT(p.id)::DECIMAL / COUNT(DISTINCT n.id), 2) as avg_predictions_per_name
FROM ons_baby_names n
LEFT JOIN ons_name_predictions p ON n.id = p.name_id;

-- Check prediction types distribution
SELECT 
    prediction_type, 
    COUNT(*) as count,
    ROUND(COUNT(*)::DECIMAL * 100 / (SELECT COUNT(*) FROM ons_name_predictions), 2) as percentage
FROM ons_name_predictions 
GROUP BY prediction_type 
ORDER BY count DESC;

-- Sample of predictions for trending names
SELECT 
    n.name,
    n.cultural_category,
    t.trend_category,
    t.current_rank,
    p.prediction_year,
    p.predicted_rank,
    p.confidence_score,
    p.prediction_type
FROM ons_baby_names n
JOIN ons_name_trends t ON n.id = t.name_id
JOIN ons_name_predictions p ON n.id = p.name_id
WHERE t.trend_category IN ('RISING FAST', 'STRONG MOMENTUM')
AND p.prediction_year = 2025
ORDER BY t.momentum_score DESC
LIMIT 20;

-- Check for any duplicate predictions (should be 0)
SELECT 
    name_id, 
    prediction_year, 
    COUNT(*) as duplicate_count
FROM ons_name_predictions 
GROUP BY name_id, prediction_year 
HAVING COUNT(*) > 1;

-- Names without predictions (should be 0)
SELECT 
    n.name, 
    n.cultural_category
FROM ons_baby_names n
LEFT JOIN ons_name_predictions p ON n.id = p.name_id
WHERE p.id IS NULL;
