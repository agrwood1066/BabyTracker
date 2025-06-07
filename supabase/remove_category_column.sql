-- Remove the category column from baby_items table
-- This migration removes the item category functionality from the shopping list

-- Check if the column exists before attempting to drop it
DO $$ 
BEGIN
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'baby_items' 
        AND column_name = 'category'
    ) THEN
        ALTER TABLE baby_items DROP COLUMN category;
        RAISE NOTICE 'Column "category" dropped from baby_items table';
    ELSE
        RAISE NOTICE 'Column "category" does not exist in baby_items table';
    END IF;
END $$;
