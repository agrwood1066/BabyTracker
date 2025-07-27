-- Migration: Enhance wishlist_items table for shopping list integration
-- Add columns to support moving items between Shopping List and Wishlist

-- Add new columns to wishlist_items table
ALTER TABLE wishlist_items 
ADD COLUMN shopping_list_data JSONB,           -- Store all shopping list fields when moved
ADD COLUMN moved_from_shopping_list BOOLEAN DEFAULT false,  -- Track if item came from shopping list
ADD COLUMN original_baby_item_id UUID;         -- Reference to original shopping list item

-- Add comment for documentation
COMMENT ON COLUMN wishlist_items.shopping_list_data IS 'Stores complete shopping list data (quantity, priority, budget_category_id, etc.) when item is moved from shopping list';
COMMENT ON COLUMN wishlist_items.moved_from_shopping_list IS 'TRUE if this wishlist item was moved from the shopping list, FALSE if added directly to wishlist';
COMMENT ON COLUMN wishlist_items.original_baby_item_id IS 'Original baby_items.id when moved from shopping list (for reference)';

-- Update the updated_at trigger to handle the new columns
-- (This ensures the updated_at timestamp changes when these fields are modified)
