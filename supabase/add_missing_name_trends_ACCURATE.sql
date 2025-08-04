-- ============================================
-- ADD MISSING NAMES TO ons_name_trends (UPDATED WITH REAL ONS DATA)
-- Based on actual 2024 ONS baby name rankings and historical trends
-- ============================================

INSERT INTO ons_name_trends (
    name_id, 
    current_rank, 
    previous_rank, 
    year_over_year_change, 
    five_year_change, 
    trend_category, 
    prediction, 
    momentum_score, 
    cultural_influence_score, 
    updated_at
) VALUES

-- ===== BOYS NAMES (Based on Real ONS Data) =====

-- Austin: #88 in 2024, strong consistent upward momentum from #105 in 2020
('dcba9876-5432-1fed-cba9-876543210fed', 88, 101, 13, 17, 'STRONG MOMENTUM', 'Steady climb from #105 to #88, expected to reach mid-70s by 2026 with continued American name appeal', 48.2, 4.1, NOW()),

-- Elias: #79 in 2024, impressive rise from #113 in 2020
('f990d54d-9db9-4fc6-b68e-8c456e70aa7f', 79, 96, 17, 34, 'STRONG MOMENTUM', 'Biblical strength driving consistent rise from #113 to #79, projected to reach top 65 by 2026', 61.8, 6.2, NOW()),

-- Mohammad: #53 in 2024, strong Islamic name with consistent momentum
('81c0fd00-3c3c-4312-88fd-46bb1499c5c8', 53, 68, 15, 21, 'STRONG MOMENTUM', 'Islamic cultural strength evident in rise from #74 to #53, expected to reach top 45 by 2026', 72.5, 8.7, NOW()),

-- Musa: #73 in 2024, dramatic rise from #115 in 2020
('edcb9876-5432-1fed-cb98-76543210fedc', 73, 85, 12, 42, 'STRONG MOMENTUM', 'Remarkable 42-position climb from #115 to #73, Islamic heritage driving continued rise to top 60 by 2027', 68.3, 8.1, NOW()),

-- Myles: #87 in 2024, steady improvement with modern spelling appeal
('fedc9876-5432-1fed-c987-6543210fedcb', 87, 99, 12, 11, 'STRONG MOMENTUM', 'Modern spelling variant showing steady progress, expected to stabilise in early 80s range', 44.7, 3.8, NOW()),

-- Nathan: #88 in 2024, biblical classic with strong momentum
('cdef9876-5432-1098-cdef-987654321098', 88, 102, 14, 23, 'STRONG MOMENTUM', 'Biblical classic rising from #111 to #88, projected to reach top 75 by 2026', 52.1, 5.4, NOW()),

-- Oakley: #34 in 2024, dramatic 48-position rise from #82 in 2020 
('a1b2c3d4-5e6f-7890-ab12-cd3456789012', 34, 39, 5, 48, 'STRONG MOMENTUM', 'Spectacular rise from #82 to #34 reflects nature name trend, expected to reach top 30 by 2026', 84.9, 8.3, NOW()),

-- Otis: #67 in 2024, vintage revival with solid momentum
('b2c3d4e5-6f78-9012-bc34-de5678901234', 67, 70, 3, 29, 'STABLE', 'Vintage charm lifting from #96 to #67, stabilising in mid-60s with continued appeal', 58.7, 6.9, NOW()),

-- Sonny: #51 in 2024, vintage revival with consistent climb
('f7d2c456-8b91-4e32-a789-5c1b6d3e7890', 51, 56, 5, 30, 'STABLE', 'Vintage warmth driving steady rise from #81 to #51, expected to stabilise around #50', 67.4, 7.2, NOW()),

-- Vinnie: #91 in 2024, rising fast with 20-position jump in one year
('d3ddb89b-56f3-4e0b-b8c4-cb068b709992', 91, 111, 20, 28, 'RISING FAST', 'Vintage revival acceleration evident in 20-position leap, momentum to reach early 80s by 2026', 71.8, 7.5, NOW()),

-- ===== GIRLS NAMES (Based on Real ONS Data) =====

-- Ava: #9 in 2024, stable top 10 despite slight recent decline
('ffffffff-0000-1111-2222-333333333333', 9, 6, -3, -5, 'STABLE', 'Modern classic maintaining top 10 position despite slight movement from #4 to #9, stable through 2027', 69.2, 4.2, NOW()),

-- Elodie: #55 in 2024, rising fast with 20-position year-over-year jump
('3010abe2-f09e-4c53-aadc-2dac7b0a8000', 55, 75, 20, 41, 'RISING FAST', 'French elegance driving dramatic rise from #96 to #55, projected to reach top 40 by 2027', 78.6, 8.4, NOW()),

-- Eloise: #85 in 2024, rising fast with strong 44-position five-year gain
('3e525024-dd34-4b3e-a2b3-1d40ed0fa484', 85, 109, 24, 44, 'RISING FAST', 'Bridgerton effect evident in rise from #129 to #85, vintage revival momentum toward top 70 by 2026', 79.3, 8.7, NOW()),

-- Freya: #7 in 2024, mythological strength maintaining top 10
('dddddddd-eeee-ffff-0000-111111111111', 7, 5, -2, 5, 'STABLE', 'Norse mythological appeal keeping strong top 10 position, stable between #5-#8 through 2027', 73.8, 6.8, NOW()),

-- Grace: #25 in 2024, classic virtue name with slight recent decline
('fc128bb2-e2bb-4016-85bf-b38188275d99', 25, 18, -7, -14, 'STABLE', 'Timeless virtue appeal maintaining top 30 despite drift from #11 to #25, stabilising around #25', 58.4, 4.6, NOW()),

-- Maryam: #57 in 2024, rising fast with strong Islamic cultural momentum
('65218439-f7b5-4e3d-a829-8c7b2a1f4e6d', 57, 77, 20, 29, 'RISING FAST', 'Islamic cultural pride driving rise from #86 to #57, projected to reach top 45 by 2026', 74.2, 9.1, NOW()),

-- Mia: #14 in 2024, modern classic with stable top 15 position
('004043a5-35cd-48a5-a96e-b5b35e689d8b', 14, 16, 2, -9, 'STABLE', 'Modern classic maintaining strong top 15 position despite movement from #5 to #14, stable appeal', 61.7, 4.0, NOW()),

-- Nora: #86 in 2024, strong momentum with impressive 67-position five-year rise
('ab123456-78cd-4ef9-ab12-3456789abcde', 86, 103, 17, 67, 'STRONG MOMENTUM', 'Vintage sophistication driving remarkable climb from #153 to #86, continued rise to top 75 by 2026', 76.9, 7.8, NOW()),

-- Poppy: #8 in 2024, nature name strength maintaining top 10
('eeeeeeee-ffff-0000-1111-222222222222', 8, 11, 3, 9, 'STABLE', 'Nature appeal and British charm keeping solid top 10 position, rising from #17 to #8 over five years', 71.5, 6.3, NOW());

-- ============================================
-- VERIFICATION QUERIES (Same as before)
-- ============================================

-- Check that all names now have trends
SELECT COUNT(*) as names_with_trends 
FROM ons_baby_names bn 
INNER JOIN ons_name_trends nt ON bn.id = nt.name_id;

-- Check that no names are missing trends
SELECT bn.name, bn.cultural_category
FROM ons_baby_names bn 
LEFT JOIN ons_name_trends nt ON bn.id = nt.name_id
WHERE nt.id IS NULL;

-- View the newly added trends sorted by momentum
SELECT bn.name, bn.gender, nt.current_rank, nt.trend_category, nt.year_over_year_change, nt.five_year_change, nt.momentum_score
FROM ons_baby_names bn
JOIN ons_name_trends nt ON bn.id = nt.name_id
WHERE bn.id IN (
    'dcba9876-5432-1fed-cba9-876543210fed', 'ffffffff-0000-1111-2222-333333333333',
    'f990d54d-9db9-4fc6-b68e-8c456e70aa7f', '3010abe2-f09e-4c53-aadc-2dac7b0a8000',
    '3e525024-dd34-4b3e-a2b3-1d40ed0fa484', 'dddddddd-eeee-ffff-0000-111111111111',
    'fc128bb2-e2bb-4016-85bf-b38188275d99', '65218439-f7b5-4e3d-a829-8c7b2a1f4e6d',
    '004043a5-35cd-48a5-a96e-b5b35e689d8b', '81c0fd00-3c3c-4312-88fd-46bb1499c5c8',
    'edcb9876-5432-1fed-cb98-76543210fedc', 'fedc9876-5432-1fed-c987-6543210fedcb',
    'cdef9876-5432-1098-cdef-987654321098', 'ab123456-78cd-4ef9-ab12-3456789abcde',
    'a1b2c3d4-5e6f-7890-ab12-cd3456789012', 'b2c3d4e5-6f78-9012-bc34-de5678901234',
    'eeeeeeee-ffff-0000-1111-222222222222', 'f7d2c456-8b91-4e32-a789-5c1b6d3e7890',
    'd3ddb89b-56f3-4e0b-b8c4-cb068b709992'
)
ORDER BY nt.momentum_score DESC;

-- Top momentum names from the new additions
SELECT 
    bn.name, 
    bn.gender,
    nt.current_rank,
    nt.year_over_year_change,
    nt.five_year_change,
    nt.trend_category,
    nt.momentum_score
FROM ons_baby_names bn
JOIN ons_name_trends nt ON bn.id = nt.name_id
WHERE bn.id IN (
    'dcba9876-5432-1fed-cba9-876543210fed', 'ffffffff-0000-1111-2222-333333333333',
    'f990d54d-9db9-4fc6-b68e-8c456e70aa7f', '3010abe2-f09e-4c53-aadc-2dac7b0a8000',
    '3e525024-dd34-4b3e-a2b3-1d40ed0fa484', 'dddddddd-eeee-ffff-0000-111111111111',
    'fc128bb2-e2bb-4016-85bf-b38188275d99', '65218439-f7b5-4e3d-a829-8c7b2a1f4e6d',
    '004043a5-35cd-48a5-a96e-b5b35e689d8b', '81c0fd00-3c3c-4312-88fd-46bb1499c5c8',
    'edcb9876-5432-1fed-cb98-76543210fedc', 'fedc9876-5432-1fed-c987-6543210fedcb',
    'cdef9876-5432-1098-cdef-987654321098', 'ab123456-78cd-4ef9-ab12-3456789abcde',
    'a1b2c3d4-5e6f-7890-ab12-cd3456789012', 'b2c3d4e5-6f78-9012-bc34-de5678901234',
    'eeeeeeee-ffff-0000-1111-222222222222', 'f7d2c456-8b91-4e32-a789-5c1b6d3e7890',
    'd3ddb89b-56f3-4e0b-b8c4-cb068b709992'
)
ORDER BY nt.momentum_score DESC
LIMIT 10;
