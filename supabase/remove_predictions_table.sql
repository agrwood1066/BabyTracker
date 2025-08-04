-- ============================================
-- REMOVE ons_name_predictions TABLE (Option A)
-- Since it's not being used in the blog post UI
-- ============================================

-- Step 1: Remove the table and all references
DROP TABLE IF EXISTS ons_name_predictions CASCADE;

-- Step 2: Update the database function to not reference predictions
CREATE OR REPLACE FUNCTION get_name_trajectory(name_input TEXT)
RETURNS TABLE (
    name TEXT,
    year INTEGER,
    rank INTEGER,
    trend_category TEXT,
    prediction TEXT,
    origin TEXT,
    meaning TEXT,
    cultural_category TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        bn.name,
        nr.year,
        nr.rank,
        nt.trend_category,
        nt.prediction, -- This comes from ons_name_trends, which is what's actually used
        bn.origin,
        bn.meaning,
        bn.cultural_category
    FROM ons_baby_names bn
    JOIN ons_name_rankings nr ON bn.id = nr.name_id
    LEFT JOIN ons_name_trends nt ON bn.id = nt.name_id
    WHERE LOWER(bn.name) = LOWER(name_input)
    ORDER BY nr.year;
END;
$$;

-- ============================================
-- VERIFICATION
-- ============================================
-- Check that the function still works without ons_name_predictions:
-- SELECT * FROM get_name_trajectory('Raya') LIMIT 5;
