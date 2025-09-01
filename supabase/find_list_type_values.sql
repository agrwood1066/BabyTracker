-- ============================================
-- FIND OUT WHAT LIST_TYPE VALUES ARE ALLOWED
-- Run this to see what the constraint accepts
-- ============================================

-- Method 1: Check the constraint definition
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'preset_lists'::regclass
AND conname LIKE '%list_type%';

-- Method 2: See what values already exist in the table
SELECT DISTINCT list_type, COUNT(*) as count
FROM preset_lists
GROUP BY list_type
ORDER BY count DESC;

-- Method 3: Try to extract the CHECK constraint
SELECT 
    CHECK_CLAUSE
FROM information_schema.check_constraints
WHERE constraint_name LIKE '%list_type%';

-- Method 4: Get full table definition
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'preset_lists'
AND column_name = 'list_type';
