-- ============================================
-- FIND THE ACTUAL CHECK CONSTRAINT
-- This will show us exactly what values are allowed
-- ============================================

-- Get ALL constraints on the preset_lists table
SELECT 
    con.conname AS constraint_name,
    con.contype AS constraint_type,
    pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_namespace nsp ON nsp.oid = con.connamespace
JOIN pg_class cls ON cls.oid = con.conrelid
WHERE cls.relname = 'preset_lists';

-- Also check if maybe the constraint is on a different schema
SELECT 
    n.nspname as schema_name,
    c.relname as table_name,
    con.conname as constraint_name,
    pg_get_constraintdef(con.oid) as constraint_definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relname = 'preset_lists'
ORDER BY n.nspname, con.conname;

-- And let's see what values currently exist
SELECT DISTINCT list_type FROM preset_lists;

-- Try inserting with NULL list_type since it's nullable
-- This is a test to see if NULL works
SELECT 'If list_type is nullable, we could try NULL instead' as suggestion;
