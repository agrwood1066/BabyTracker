-- ============================================
-- ESSENTIALS IMPORT - SAFE NON-DESTRUCTIVE VERSION
-- This version will not delete or overwrite anything
-- ============================================

-- Step 1: Try to insert the essentials list (will skip if already exists)
INSERT INTO preset_lists (
    name,
    description,
    slug,
    list_type,
    item_count
) 
VALUES (
    'Baby Essentials Starter Pack',
    '48 must-have items curated by thousands of parents',
    'essentials',
    'standard',
    48
) 
ON CONFLICT (slug) DO NOTHING;  -- Changed to DO NOTHING - won't update if exists

-- Step 2: Add items only if they don't exist
DO $$
DECLARE
    v_list_id UUID;
    v_existing_count INTEGER;
BEGIN
    -- Get the essentials list ID
    SELECT id INTO v_list_id FROM preset_lists WHERE slug = 'essentials';
    
    IF v_list_id IS NULL THEN
        RAISE NOTICE 'Essentials list not found - may need to check list_type constraint';
        RETURN;
    END IF;
    
    -- Create items table if it doesn't exist
    CREATE TABLE IF NOT EXISTS preset_list_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        preset_list_id UUID REFERENCES preset_lists(id) ON DELETE CASCADE,
        item_name TEXT NOT NULL,
        quantity INTEGER DEFAULT 1,
        notes TEXT,
        priority TEXT DEFAULT 'medium',
        category_name TEXT,
        expected_price DECIMAL(10,2),
        price_currency TEXT DEFAULT 'GBP',
        price_source TEXT,
        needed_by TEXT,
        sort_order INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Check if items already exist
    SELECT COUNT(*) INTO v_existing_count 
    FROM preset_list_items 
    WHERE preset_list_id = v_list_id;
    
    IF v_existing_count > 0 THEN
        RAISE NOTICE 'Items already exist for essentials list (% items). Skipping insert.', v_existing_count;
        RETURN;
    END IF;
    
    -- Insert all 48 essential items ONLY if none exist
    INSERT INTO preset_list_items (preset_list_id, item_name, quantity, notes, priority, category_name, expected_price, price_source, needed_by, sort_order) VALUES
    -- Bathing (2 items)
    (v_list_id, 'Baby bath tub', 1, 'Ergonomic design with newborn insert', 'high', 'Bathing', 25.00, 'Amazon', 'Before birth', 1),
    (v_list_id, 'Hooded towels', 3, 'Soft bamboo or cotton', 'high', 'Bathing', 20.00, 'John Lewis', 'Before birth', 2),
    
    -- Feeding (10 items)
    (v_list_id, 'Bottles', 6, 'Anti-colic, various sizes', 'high', 'Feeding', 30.00, 'Boots', 'Before birth', 3),
    (v_list_id, 'Bottle steriliser', 1, 'Electric or microwave', 'high', 'Feeding', 50.00, 'Amazon', 'Before birth', 4),
    (v_list_id, 'Bottle brush', 2, 'For cleaning bottles and teats', 'medium', 'Feeding', 8.00, 'Tesco', 'Before birth', 5),
    (v_list_id, 'Formula powder', 2, 'If not exclusively breastfeeding', 'high', 'Feeding', 20.00, 'Boots', 'Before birth', 6),
    (v_list_id, 'Muslin cloths', 12, 'For burping and spills', 'high', 'Feeding', 15.00, 'Amazon', 'Before birth', 7),
    (v_list_id, 'Bibs', 10, 'Mix of dribble and feeding bibs', 'medium', 'Feeding', 15.00, 'Next', 'Before birth', 8),
    (v_list_id, 'Breast pump', 1, 'Manual or electric', 'medium', 'Feeding', 100.00, 'John Lewis', 'After birth', 9),
    (v_list_id, 'Nursing pillow', 1, 'Support for breastfeeding', 'medium', 'Feeding', 30.00, 'Amazon', 'Before birth', 10),
    (v_list_id, 'High chair', 1, 'For when baby starts solids', 'low', 'Feeding', 80.00, 'IKEA', '6 months', 11),
    (v_list_id, 'Weaning spoons', 4, 'Soft-tipped for first foods', 'low', 'Feeding', 8.00, 'Boots', '6 months', 12),
    
    -- Changing (8 items)
    (v_list_id, 'Nappies - Newborn', 2, 'Size 1 (2-5kg)', 'high', 'Changing', 20.00, 'Tesco', 'Before birth', 13),
    (v_list_id, 'Nappies - Size 2', 2, 'Size 2 (3-6kg)', 'high', 'Changing', 20.00, 'Tesco', '1 month', 14),
    (v_list_id, 'Wipes', 12, 'Sensitive, fragrance-free', 'high', 'Changing', 24.00, 'Amazon', 'Before birth', 15),
    (v_list_id, 'Changing mat', 1, 'Wipe-clean with raised edges', 'high', 'Changing', 20.00, 'Boots', 'Before birth', 16),
    (v_list_id, 'Nappy cream', 2, 'Barrier cream for nappy rash', 'high', 'Changing', 10.00, 'Boots', 'Before birth', 17),
    (v_list_id, 'Nappy bags', 300, 'Scented disposal bags', 'medium', 'Changing', 10.00, 'Tesco', 'Before birth', 18),
    (v_list_id, 'Changing bag', 1, 'With multiple compartments', 'high', 'Changing', 50.00, 'John Lewis', 'Before birth', 19),
    (v_list_id, 'Portable changing mat', 1, 'For changing on the go', 'medium', 'Changing', 15.00, 'Amazon', 'Before birth', 20),
    
    -- Clothing (8 items)
    (v_list_id, 'Vests - Newborn', 7, 'Short and long sleeve mix', 'high', 'Clothing', 20.00, 'Next', 'Before birth', 21),
    (v_list_id, 'Sleepsuits - Newborn', 7, 'Day and night wear', 'high', 'Clothing', 35.00, 'Next', 'Before birth', 22),
    (v_list_id, 'Vests - 0-3 months', 7, 'Short and long sleeve mix', 'high', 'Clothing', 20.00, 'Next', 'Before birth', 23),
    (v_list_id, 'Sleepsuits - 0-3 months', 7, 'Day and night wear', 'high', 'Clothing', 35.00, 'Next', 'Before birth', 24),
    (v_list_id, 'Cardigans', 2, 'For layering', 'medium', 'Clothing', 20.00, 'M&S', 'Before birth', 25),
    (v_list_id, 'Hats', 3, 'Newborn size', 'medium', 'Clothing', 10.00, 'Next', 'Before birth', 26),
    (v_list_id, 'Scratch mittens', 3, 'To prevent scratching', 'medium', 'Clothing', 6.00, 'Boots', 'Before birth', 27),
    (v_list_id, 'Socks', 6, 'Newborn and 0-3 months', 'low', 'Clothing', 8.00, 'Next', 'Before birth', 28),
    
    -- Sleeping (5 items)
    (v_list_id, 'Moses basket/Crib', 1, 'For first few months', 'high', 'Sleeping', 80.00, 'John Lewis', 'Before birth', 29),
    (v_list_id, 'Cot', 1, 'Full-size cot or cot bed', 'high', 'Sleeping', 150.00, 'IKEA', '3 months', 30),
    (v_list_id, 'Mattresses', 2, 'For moses basket and cot', 'high', 'Sleeping', 80.00, 'John Lewis', 'Before birth', 31),
    (v_list_id, 'Fitted sheets', 6, '3 for each bed', 'high', 'Sleeping', 30.00, 'Amazon', 'Before birth', 32),
    (v_list_id, 'Sleeping bags', 3, 'Different togs for seasons', 'medium', 'Sleeping', 60.00, 'John Lewis', 'Before birth', 33),
    
    -- Nursery/Room (5 items)
    (v_list_id, 'Baby monitor', 1, 'Audio or video', 'high', 'Nursery', 80.00, 'Amazon', 'Before birth', 34),
    (v_list_id, 'Blackout blinds', 1, 'For better sleep', 'medium', 'Nursery', 30.00, 'Amazon', 'Before birth', 35),
    (v_list_id, 'Night light', 1, 'Soft glow for night feeds', 'medium', 'Nursery', 20.00, 'Amazon', 'Before birth', 36),
    (v_list_id, 'Room thermometer', 1, 'To monitor temperature', 'medium', 'Nursery', 10.00, 'Boots', 'Before birth', 37),
    (v_list_id, 'White noise machine', 1, 'Helps baby sleep', 'low', 'Nursery', 30.00, 'Amazon', 'After birth', 38),
    
    -- Healthcare (6 items)
    (v_list_id, 'Digital thermometer', 1, 'For checking temperature', 'high', 'Healthcare', 10.00, 'Boots', 'Before birth', 39),
    (v_list_id, 'Baby nail clippers', 1, 'Safety scissors or file', 'medium', 'Healthcare', 5.00, 'Boots', 'Before birth', 40),
    (v_list_id, 'Cotton wool', 2, 'For cleaning', 'high', 'Healthcare', 4.00, 'Boots', 'Before birth', 41),
    (v_list_id, 'Baby bath thermometer', 1, 'To check water temperature', 'medium', 'Healthcare', 8.00, 'Boots', 'Before birth', 42),
    (v_list_id, 'Calpol/Paracetamol', 1, 'Infant suspension', 'medium', 'Healthcare', 5.00, 'Boots', '2 months', 43),
    (v_list_id, 'Vitamin D drops', 1, 'Daily supplement', 'medium', 'Healthcare', 8.00, 'Boots', 'Before birth', 44),
    
    -- Travel (1 item)
    (v_list_id, 'Car seat', 1, 'Group 0+ for newborns', 'high', 'Travel', 150.00, 'Halfords', 'Before birth', 45),
    
    -- Play (3 items)
    (v_list_id, 'Play mat', 1, 'With sensory features', 'low', 'Play', 40.00, 'Amazon', '1 month', 46),
    (v_list_id, 'Soft toys', 3, 'Age-appropriate', 'low', 'Play', 20.00, 'John Lewis', '1 month', 47),
    (v_list_id, 'Books', 5, 'Board books for babies', 'low', 'Play', 25.00, 'Waterstones', '1 month', 48);
    
    RAISE NOTICE 'Successfully inserted 48 essential items for list ID: %', v_list_id;
END $$;

-- Step 3: Create the usage tracking table (safe - won't overwrite)
CREATE TABLE IF NOT EXISTS preset_list_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    preset_list_id UUID REFERENCES preset_lists(id),
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    imported_by UUID REFERENCES profiles(id),
    items_imported INTEGER DEFAULT 0,
    UNIQUE(family_id, preset_list_id)
);

-- Verification (read-only, safe)
SELECT 
    'Setup Status:' as info,
    (SELECT COUNT(*) FROM preset_lists WHERE slug = 'essentials') as lists_count,
    (SELECT COUNT(*) FROM preset_list_items 
     WHERE preset_list_id = (SELECT id FROM preset_lists WHERE slug = 'essentials')) as items_count;
