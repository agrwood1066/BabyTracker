-- Check which item might be missing
-- This query will help us identify if any item failed to insert

WITH expected_items AS (
    SELECT unnest(ARRAY[
        'Baby bath tub', 'Hooded towels', 'Bottles', 'Bottle steriliser', 
        'Bottle brush', 'Formula powder', 'Muslin cloths', 'Bibs', 
        'Breast pump', 'Nursing pillow', 'High chair', 'Weaning spoons',
        'Nappies - Newborn', 'Nappies - Size 2', 'Wipes', 'Changing mat',
        'Nappy cream', 'Nappy bags', 'Changing bag', 'Portable changing mat',
        'Vests - Newborn', 'Sleepsuits - Newborn', 'Vests - 0-3 months', 
        'Sleepsuits - 0-3 months', 'Cardigans', 'Hats', 'Scratch mittens', 'Socks',
        'Moses basket/Crib', 'Cot', 'Mattresses', 'Fitted sheets', 'Sleeping bags',
        'Baby monitor', 'Blackout blinds', 'Night light', 'Room thermometer', 
        'White noise machine', 'Digital thermometer', 'Baby nail clippers',
        'Cotton wool', 'Baby bath thermometer', 'Calpol/Paracetamol', 
        'Vitamin D drops', 'Car seat', 'Play mat', 'Soft toys', 'Books'
    ]) AS item_name
),
actual_items AS (
    SELECT item_name 
    FROM preset_list_items 
    WHERE preset_list_id = (SELECT id FROM preset_lists WHERE slug = 'essentials')
)
SELECT 
    'Missing item:' as status,
    e.item_name
FROM expected_items e
LEFT JOIN actual_items a ON e.item_name = a.item_name
WHERE a.item_name IS NULL;

-- Also show what we do have
SELECT COUNT(*) as total_items, 
       STRING_AGG(category_name, ', ' ORDER BY category_name) as categories
FROM preset_list_items 
WHERE preset_list_id = (SELECT id FROM preset_lists WHERE slug = 'essentials')
GROUP BY preset_list_id;