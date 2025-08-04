-- ============================================
-- OPTION B: ENHANCED PREDICTIONS SYSTEM
-- Use ons_name_predictions to show detailed future projections
-- ============================================

-- First, run the cleanup script to remove duplicates and add all predictions
-- (Use the cleanup_and_complete_predictions.sql file)

-- Then, this enhanced function will return detailed predictions
CREATE OR REPLACE FUNCTION get_detailed_name_predictions(name_input TEXT)
RETURNS TABLE (
    name TEXT,
    current_rank INTEGER,
    trend_category TEXT,
    general_prediction TEXT,
    prediction_year INTEGER,
    predicted_rank INTEGER,
    confidence_score DECIMAL(5,2),
    prediction_type TEXT,
    rank_change_from_current INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bn.name,
        nt.current_rank,
        nt.trend_category,
        nt.prediction as general_prediction,
        p.prediction_year,
        p.predicted_rank,
        p.confidence_score,
        p.prediction_type,
        (nt.current_rank - p.predicted_rank) as rank_change_from_current
    FROM ons_baby_names bn
    JOIN ons_name_trends nt ON bn.id = nt.name_id
    JOIN ons_name_predictions p ON bn.id = p.name_id
    WHERE LOWER(bn.name) = LOWER(name_input)
    ORDER BY p.prediction_year;
END;
$$;

-- Test the function
-- SELECT * FROM get_detailed_name_predictions('Raya');
