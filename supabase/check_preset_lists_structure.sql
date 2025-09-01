-- ============================================
-- DIAGNOSTIC QUERY - Run this FIRST to check existing structure
-- ============================================

-- Check what's in the preset_lists table
SELECT column_name, data_type, character_maximum_length, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'preset_lists'
ORDER BY ordinal_position;

-- Check constraints on preset_lists
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'preset_lists'::regclass;

-- Check existing data
SELECT * FROM preset_lists LIMIT 5;

-- Check what list_type values exist
SELECT DISTINCT list_type FROM preset_lists;
