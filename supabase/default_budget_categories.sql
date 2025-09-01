-- ==================================================
-- DEFAULT BUDGET CATEGORIES FOR NEW USERS
-- ==================================================
-- This script creates default budget categories for new users
-- based on alexgrwood@me.com's categories
-- ==================================================

-- Step 1: Create a function to add default budget categories
CREATE OR REPLACE FUNCTION create_default_budget_categories()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create categories if this is a new family (no existing categories)
    IF NOT EXISTS (
        SELECT 1 FROM budget_categories WHERE family_id = NEW.family_id
    ) THEN
        -- Insert default budget categories from alexgrwood@me.com
        INSERT INTO budget_categories (family_id, name, expected_budget) VALUES
            (NEW.family_id, 'Bathing', 100.00),
            (NEW.family_id, 'Changing', 200.00),
            (NEW.family_id, 'Clothing', 200.00),
            (NEW.family_id, 'Feeding', 300.00),
            (NEW.family_id, 'Furniture', 500.00),
            (NEW.family_id, 'Healthcare', 150.00),
            (NEW.family_id, 'Sleeping', 200.00),
            (NEW.family_id, 'Toys', 50.00);
        
        -- Log for debugging (optional)
        RAISE NOTICE 'Created 8 default budget categories for family_id: %', NEW.family_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 2: Create a trigger that fires after a new profile is created
DROP TRIGGER IF EXISTS create_default_categories_trigger ON profiles;

CREATE TRIGGER create_default_categories_trigger
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_default_budget_categories();

-- ==================================================
-- OPTIONAL: Backfill existing users who have no categories
-- ==================================================
-- Uncomment and run this section if you want to add default categories 
-- to existing users who don't have any:

/*
DO $$
DECLARE
    family_record RECORD;
    categories_added INTEGER := 0;
BEGIN
    -- Find families without any budget categories
    FOR family_record IN 
        SELECT DISTINCT p.family_id 
        FROM profiles p
        LEFT JOIN budget_categories bc ON p.family_id = bc.family_id
        WHERE bc.id IS NULL
    LOOP
        -- Insert default categories for this family
        INSERT INTO budget_categories (family_id, name, expected_budget) VALUES
            (family_record.family_id, 'Bathing', 100.00),
            (family_record.family_id, 'Changing', 200.00),
            (family_record.family_id, 'Clothing', 200.00),
            (family_record.family_id, 'Feeding', 300.00),
            (family_record.family_id, 'Furniture', 1500.00),
            (family_record.family_id, 'Healthcare', 150.00),
            (family_record.family_id, 'Sleeping', 200.00),
            (family_record.family_id, 'Toys', 50.00);
            
        categories_added := categories_added + 1;
        RAISE NOTICE 'Added default categories to family_id: %', family_record.family_id;
    END LOOP;
    
    RAISE NOTICE 'Total families updated: %', categories_added;
END $$;
*/

-- ==================================================
-- VERIFICATION QUERIES
-- ==================================================

-- 1. Check if trigger was created successfully:
/*
SELECT 
    tgname as trigger_name,
    tgrelid::regclass as table_name,
    proname as function_name
FROM pg_trigger t
JOIN pg_proc p ON t.tgfoid = p.oid
WHERE tgname = 'create_default_categories_trigger';
*/

-- 2. Test with a specific new user (after they sign up):
/*
SELECT * FROM budget_categories 
WHERE family_id = (
    SELECT family_id 
    FROM profiles 
    WHERE email = 'newuser@example.com'
)
ORDER BY name;
*/

-- 3. Check how many families have categories:
/*
SELECT 
    COUNT(DISTINCT p.family_id) as total_families,
    COUNT(DISTINCT bc.family_id) as families_with_categories,
    COUNT(DISTINCT p.family_id) - COUNT(DISTINCT bc.family_id) as families_without_categories
FROM profiles p
LEFT JOIN budget_categories bc ON p.family_id = bc.family_id;
*/

-- 4. See the total expected budget for new users:
/*
SELECT SUM(expected_budget) as total_expected_budget
FROM (VALUES 
    (100.00),  -- Bathing
    (200.00),  -- Changing
    (200.00),  -- Clothing
    (300.00),  -- Feeding
    (1500.00), -- Furniture
    (150.00),  -- Healthcare
    (200.00),  -- Sleeping
    (50.00)    -- Toys
) as t(expected_budget);
-- Total: £2,700.00
*/

-- ==================================================
-- ROLLBACK (if needed)
-- ==================================================
/*
-- To remove the trigger and function:
DROP TRIGGER IF EXISTS create_default_categories_trigger ON profiles;
DROP FUNCTION IF EXISTS create_default_budget_categories();
*/
