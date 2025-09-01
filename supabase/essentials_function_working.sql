-- ============================================
-- WORKING IMPORT FUNCTION - Fixed preset_list_usage columns
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
    v_priority TEXT;
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
        IF NOT v_has_imported_before AND v_current_items <= 2 THEN
            v_is_essentials_exception := true;
            RAISE NOTICE 'User qualifies for essentials exception: % items, not imported before', v_current_items;
        END IF;
    END IF;
    
    -- Check permissions based on subscription
    IF v_subscription.subscription_status IN ('trial', 'active', 'lifetime_admin') THEN
        RAISE NOTICE 'Premium user - unlimited import allowed';
    ELSIF v_is_essentials_exception THEN
        RAISE NOTICE 'Essentials exception granted for new user';
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
        SELECT 
            item_name,
            COALESCE(quantity, 1) as quantity,
            priority,
            category_name
        FROM preset_list_items 
        WHERE preset_list_id = v_preset_list.id
        ORDER BY sort_order
    LOOP
        -- Check if item already exists
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
        
        -- Normalize priority value to match constraint
        v_priority := CASE 
            WHEN v_item.priority IS NULL THEN 'medium'
            WHEN LOWER(v_item.priority) IN ('high', 'medium', 'low') THEN LOWER(v_item.priority)
            ELSE 'medium'
        END;
        
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
        
        -- Insert the item with validated priority
        INSERT INTO baby_items (
            family_id,
            added_by,
            item_name,
            quantity,
            priority,
            budget_category_id,
            purchased,
            starred
        ) VALUES (
            p_family_id,
            p_user_id,
            v_item.item_name,
            v_item.quantity,
            v_priority,
            v_budget_category_id,
            false,
            false
        );
        
        v_imported_count := v_imported_count + 1;
        
        -- For free users (not essentials exception), check if we've hit the limit
        IF v_subscription.subscription_status = 'free' 
           AND NOT v_is_essentials_exception 
           AND (v_current_items + v_imported_count) >= 10 THEN
            RAISE NOTICE 'Free user hit 10 item limit, stopping import';
            EXIT;
        END IF;
    END LOOP;
    
    -- Record the import (without imported_by column)
    INSERT INTO preset_list_usage (
        family_id,
        preset_list_id,
        items_imported
    ) VALUES (
        p_family_id,
        v_preset_list.id,
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

-- Let's check what columns actually exist in preset_list_usage
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'preset_list_usage'
ORDER BY ordinal_position;

-- Success message
SELECT 'Function updated - removed imported_by column!' as status;
