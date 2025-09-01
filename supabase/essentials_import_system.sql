-- ============================================
-- ESSENTIALS IMPORT SYSTEM
-- Special case: Allow new users to import essentials even on free plan
-- ============================================

-- Create preset lists table to store our curated lists
CREATE TABLE IF NOT EXISTS preset_lists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    item_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create preset list items table
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

-- Track which users have imported which preset lists
CREATE TABLE IF NOT EXISTS preset_list_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    preset_list_id UUID REFERENCES preset_lists(id),
    imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    imported_by UUID REFERENCES profiles(id),
    items_imported INTEGER DEFAULT 0,
    UNIQUE(family_id, preset_list_id)
);

-- Insert the essentials preset list
INSERT INTO preset_lists (slug, name, description, item_count) 
VALUES (
    'essentials',
    'Baby Essentials Starter Pack',
    '48 must-have items curated by thousands of parents',
    48
) ON CONFLICT (slug) DO NOTHING;

-- Get the essentials list ID
DO $$
DECLARE
    v_list_id UUID;
BEGIN
    SELECT id INTO v_list_id FROM preset_lists WHERE slug = 'essentials';
    
    -- Insert all 48 essential items
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
    (v_list_id, 'Books', 5, 'Board books for babies', 'low', 'Play', 25.00, 'Waterstones', '1 month', 48)
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- IMPORT FUNCTION WITH ESSENTIALS EXCEPTION
-- ============================================

CREATE OR REPLACE FUNCTION import_preset_list(
    p_family_id UUID,
    p_user_id UUID,
    p_preset_slug TEXT,
    p_skip_existing BOOLEAN DEFAULT true
)
RETURNS jsonb AS $$
DECLARE
    v_subscription RECORD;
    v_preset_list RECORD;
    v_current_items INTEGER;
    v_imported_count INTEGER := 0;
    v_skipped_count INTEGER := 0;
    v_is_essentials_exception BOOLEAN := false;
    v_has_imported_before BOOLEAN := false;
    v_budget_category_id UUID;
    v_item RECORD;
BEGIN
    -- Get user subscription
    SELECT * INTO v_subscription
    FROM profiles
    WHERE id = p_user_id;
    
    -- Get preset list info
    SELECT * INTO v_preset_list
    FROM preset_lists
    WHERE slug = p_preset_slug;
    
    IF v_preset_list IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'Preset list not found',
            'imported', 0
        );
    END IF;
    
    -- Check if this is the essentials list
    IF p_preset_slug = 'essentials' THEN
        -- Check if user has already imported essentials
        SELECT EXISTS(
            SELECT 1 FROM preset_list_usage 
            WHERE family_id = p_family_id 
            AND preset_list_id = v_preset_list.id
        ) INTO v_has_imported_before;
        
        -- Count current items
        SELECT COUNT(*) INTO v_current_items
        FROM baby_items
        WHERE family_id = p_family_id;
        
        -- SPECIAL EXCEPTION: Allow essentials import for new users (0-2 items) even on free plan
        -- This gives new users a great starting experience
        IF NOT v_has_imported_before AND v_current_items <= 2 THEN
            v_is_essentials_exception := true;
        END IF;
    END IF;
    
    -- Check permissions based on subscription
    IF v_subscription.subscription_status IN ('trial', 'active', 'lifetime_admin') THEN
        -- Premium users can import everything
        NULL; -- Proceed with import
    ELSIF v_is_essentials_exception THEN
        -- Special case: new free users get essentials as a one-time gift
        NULL; -- Proceed with import
    ELSE
        -- Free users who don't qualify for exception
        SELECT COUNT(*) INTO v_current_items
        FROM baby_items
        WHERE family_id = p_family_id;
        
        IF v_current_items >= 10 THEN
            RETURN jsonb_build_object(
                'success', false,
                'message', 'Free accounts are limited to 10 items. Upgrade to add more!',
                'imported', 0,
                'current_count', v_current_items,
                'limit', 10
            );
        END IF;
    END IF;
    
    -- Import the items
    FOR v_item IN 
        SELECT * FROM preset_list_items 
        WHERE preset_list_id = v_preset_list.id
        ORDER BY sort_order
    LOOP
        -- Check if item already exists (if skip_existing is true)
        IF p_skip_existing THEN
            IF EXISTS(
                SELECT 1 FROM baby_items 
                WHERE family_id = p_family_id 
                AND LOWER(item_name) = LOWER(v_item.item_name)
            ) THEN
                v_skipped_count := v_skipped_count + 1;
                CONTINUE;
            END IF;
        END IF;
        
        -- Get or create budget category
        v_budget_category_id := NULL;
        IF v_item.category_name IS NOT NULL THEN
            -- Check if category exists
            SELECT id INTO v_budget_category_id
            FROM budget_categories
            WHERE family_id = p_family_id
            AND LOWER(name) = LOWER(v_item.category_name);
            
            -- Create category if it doesn't exist
            IF v_budget_category_id IS NULL THEN
                INSERT INTO budget_categories (family_id, name, expected_budget)
                VALUES (
                    p_family_id, 
                    v_item.category_name,
                    CASE v_item.category_name
                        WHEN 'Bathing' THEN 45
                        WHEN 'Feeding' THEN 350
                        WHEN 'Changing' THEN 150
                        WHEN 'Clothing' THEN 200
                        WHEN 'Sleeping' THEN 400
                        WHEN 'Nursery' THEN 170
                        WHEN 'Healthcare' THEN 40
                        WHEN 'Travel' THEN 150
                        WHEN 'Play' THEN 85
                        ELSE 100
                    END
                )
                RETURNING id INTO v_budget_category_id;
            END IF;
        END IF;
        
        -- Insert the item
        INSERT INTO baby_items (
            family_id,
            added_by,
            item_name,
            quantity,
            notes,
            priority,
            budget_category_id,
            price,
            price_currency,
            price_source,
            needed_by,
            purchased,
            starred
        ) VALUES (
            p_family_id,
            p_user_id,
            v_item.item_name,
            v_item.quantity,
            v_item.notes,
            v_item.priority,
            v_budget_category_id,
            v_item.expected_price,
            v_item.price_currency,
            v_item.price_source,
            v_item.needed_by,
            false,
            false
        );
        
        v_imported_count := v_imported_count + 1;
        
        -- For free users (not essentials exception), check if we've hit the limit
        IF v_subscription.subscription_status = 'free' 
           AND NOT v_is_essentials_exception 
           AND (v_current_items + v_imported_count) >= 10 THEN
            EXIT; -- Stop importing at limit
        END IF;
    END LOOP;
    
    -- Record the import
    INSERT INTO preset_list_usage (
        family_id,
        preset_list_id,
        imported_by,
        items_imported
    ) VALUES (
        p_family_id,
        v_preset_list.id,
        p_user_id,
        v_imported_count
    ) ON CONFLICT (family_id, preset_list_id) 
    DO UPDATE SET 
        items_imported = preset_list_usage.items_imported + v_imported_count,
        imported_at = NOW();
    
    -- Return success with appropriate message
    IF v_is_essentials_exception THEN
        RETURN jsonb_build_object(
            'success', true,
            'imported', v_imported_count,
            'skipped', v_skipped_count,
            'message', format('Welcome gift! Added %s essential items to get you started. After these, free accounts are limited to 10 items total.', v_imported_count),
            'is_exception', true
        );
    ELSE
        RETURN jsonb_build_object(
            'success', true,
            'imported', v_imported_count,
            'skipped', v_skipped_count,
            'message', format('Successfully imported %s items', v_imported_count),
            'is_exception', false
        );
    END IF;
    
EXCEPTION WHEN OTHERS THEN
    RETURN jsonb_build_object(
        'success', false,
        'message', format('Error importing items: %s', SQLERRM),
        'imported', 0
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION import_preset_list TO authenticated;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_preset_list_items_list_id ON preset_list_items(preset_list_id);
CREATE INDEX IF NOT EXISTS idx_preset_list_usage_family ON preset_list_usage(family_id);
CREATE INDEX IF NOT EXISTS idx_baby_items_family_name ON baby_items(family_id, LOWER(item_name));

-- Add RLS policies
ALTER TABLE preset_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_list_usage ENABLE ROW LEVEL SECURITY;

-- Everyone can read preset lists and items
CREATE POLICY "preset_lists_read" ON preset_lists FOR SELECT TO authenticated USING (true);
CREATE POLICY "preset_list_items_read" ON preset_list_items FOR SELECT TO authenticated USING (true);

-- Users can only see their own usage
CREATE POLICY "preset_list_usage_read" ON preset_list_usage FOR SELECT TO authenticated 
USING (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));

-- Users can insert their own usage
CREATE POLICY "preset_list_usage_insert" ON preset_list_usage FOR INSERT TO authenticated 
WITH CHECK (family_id IN (SELECT family_id FROM profiles WHERE id = auth.uid()));
