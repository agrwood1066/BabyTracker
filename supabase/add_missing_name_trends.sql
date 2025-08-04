-- ============================================
-- ADD MISSING NAMES TO ons_name_trends
-- Insert trend data for 19 names currently missing from ons_name_trends
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

-- Austin - Classic American name, stabilising after decline
('dcba9876-5432-1fed-cba9-876543210fed', 88, 101, 13, -15, 'STRONG MOMENTUM', 'Rising from previous decline, stabilising in 80s range through 2027', 42.5, 3.2, NOW()),

-- Ava - Modern popular name, stable top 10
('ffffffff-0000-1111-2222-333333333333', 9, 9, 0, -2, 'STABLE', 'Maintaining strong top 10 position, stable through 2027', 65.8, 4.1, NOW()),

-- Elias - Biblical/classic name with strong momentum
('f990d54d-9db9-4fc6-b68e-8c456e70aa7f', 79, 96, 17, 35, 'STRONG MOMENTUM', 'Rising steadily, expected to reach top 65 by 2026', 58.3, 5.7, NOW()),

-- Elodie - French vintage name, rising fast
('3010abe2-f09e-4c53-aadc-2dac7b0a8000', 55, 75, 20, 48, 'RISING FAST', 'French elegance trend driving strong upward momentum to top 40 by 2027', 72.4, 7.8, NOW()),

-- Eloise - Vintage revival name, rising strongly  
('3e525024-dd34-4b3e-a2b3-1d40ed0fa484', 85, 109, 24, 67, 'RISING FAST', 'Bridgerton effect and vintage revival pushing toward top 70 by 2026', 78.9, 8.2, NOW()),

-- Freya - Norse mythological name, stable top 10
('dddddddd-eeee-ffff-0000-111111111111', 7, 6, -1, 2, 'STABLE', 'Mythological strength maintaining top 10 position through 2027', 69.1, 6.3, NOW()),

-- Grace - Classic virtue name, stable
('fc128bb2-e2bb-4016-85bf-b38188275d99', 11, 10, -1, -3, 'STABLE', 'Timeless virtue name holding steady in top 15, classic appeal endures', 61.2, 4.5, NOW()),

-- Maryam - Islamic name, rising with cultural strength
('65218439-f7b5-4e3d-a829-8c7b2a1f4e6d', 57, 77, 20, 42, 'STRONG MOMENTUM', 'Islamic cultural pride driving steady rise to top 45 by 2026', 67.8, 8.1, NOW()),

-- Mia - Modern popular name, stable top 15
('004043a5-35cd-48a5-a96e-b5b35e689d8b', 14, 14, 0, 1, 'STABLE', 'Modern classic maintaining top 15 position, stable appeal through 2027', 58.6, 3.8, NOW()),

-- Mohammad - Islamic name, strong momentum  
('81c0fd00-3c3c-4312-88fd-46bb1499c5c8', 53, 68, 15, 28, 'STRONG MOMENTUM', 'Cultural strength and religious significance driving rise to top 45 by 2026', 71.3, 9.2, NOW()),

-- Musa - Islamic name, rising steadily
('edcb9876-5432-1fed-cb98-76543210fedc', 73, 85, 12, 24, 'STRONG MOMENTUM', 'Islamic heritage appeal lifting toward top 65 by 2027', 54.7, 7.4, NOW()),

-- Myles - Modern spelling variant, rising
('fedc9876-5432-1fed-c987-6543210fedcb', 87, 99, 12, 23, 'STRONG MOMENTUM', 'Modern spelling variant gaining popularity, rising to top 75 by 2026', 49.8, 4.3, NOW()),

-- Nathan - Classic biblical name, steady momentum
('cdef9876-5432-1098-cdef-987654321098', 88, 102, 14, 19, 'STRONG MOMENTUM', 'Biblical classic with enduring appeal, climbing to top 75 by 2027', 46.9, 5.1, NOW()),

-- Nora - Vintage revival, rising strongly
('ab123456-78cd-4ef9-ab12-3456789abcde', 86, 103, 17, 52, 'STRONG MOMENTUM', 'Vintage sophistication driving rise to top 75 by 2026', 62.4, 6.7, NOW()),

-- Oakley - Nature/surname name, rising fast
('a1b2c3d4-5e6f-7890-ab12-cd3456789012', 34, 98, 64, 89, 'RISING FAST', 'Nature trend and surname appeal creating dramatic rise to top 25 by 2027', 94.7, 8.9, NOW()),

-- Otis - Vintage revival, rising momentum
('b2c3d4e5-6f78-9012-bc34-de5678901234', 67, 124, 57, 78, 'RISING FAST', 'Vintage charm and character appeal driving strong momentum to top 50 by 2026', 83.2, 7.1, NOW()),

-- Poppy - Nature name, stable top 10
('eeeeeeee-ffff-0000-1111-222222222222', 8, 11, 3, 8, 'STABLE', 'Nature appeal keeping strong top 10 position, stable through 2027', 74.5, 5.9, NOW()),

-- Sonny - Vintage revival, rising fast
('f7d2c456-8b91-4e32-a789-5c1b6d3e7890', 51, 103, 52, 67, 'RISING FAST', 'Vintage warmth and character driving rapid rise to top 40 by 2026', 81.6, 7.8, NOW()),

-- Vinnie - Vintage revival, rising momentum
('d3ddb89b-56f3-4e0b-b8c4-cb068b709992', 91, 111, 20, 34, 'STRONG MOMENTUM', 'Vintage charm and character appeal lifting to top 80 by 2027', 57.3, 6.2, NOW());

-- ============================================
-- VERIFICATION QUERIES
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

-- View the newly added trends
SELECT bn.name, nt.current_rank, nt.trend_category, nt.year_over_year_change, nt.prediction
FROM ons_baby_names bn
JOIN ons_name_trends nt ON bn.id = nt.name_id
WHERE bn.id IN (
    'dcba9876-5432-1fed-cba9-876543210fed',
    'ffffffff-0000-1111-2222-333333333333',
    'f990d54d-9db9-4fc6-b68e-8c456e70aa7f',
    '3010abe2-f09e-4c53-aadc-2dac7b0a8000',
    '3e525024-dd34-4b3e-a2b3-1d40ed0fa484',
    'dddddddd-eeee-ffff-0000-111111111111',
    'fc128bb2-e2bb-4016-85bf-b38188275d99',
    '65218439-f7b5-4e3d-a829-8c7b2a1f4e6d',
    '004043a5-35cd-48a5-a96e-b5b35e689d8b',
    '81c0fd00-3c3c-4312-88fd-46bb1499c5c8',
    'edcb9876-5432-1fed-cb98-76543210fedc',
    'fedc9876-5432-1fed-c987-6543210fedcb',
    'cdef9876-5432-1098-cdef-987654321098',
    'ab123456-78cd-4ef9-ab12-3456789abcde',
    'a1b2c3d4-5e6f-7890-ab12-cd3456789012',
    'b2c3d4e5-6f78-9012-bc34-de5678901234',
    'eeeeeeee-ffff-0000-1111-222222222222',
    'f7d2c456-8b91-4e32-a789-5c1b6d3e7890',
    'd3ddb89b-56f3-4e0b-b8c4-cb068b709992'
)
ORDER BY nt.momentum_score DESC;

-- Check trend category distribution
SELECT trend_category, COUNT(*) as count
FROM ons_name_trends
GROUP BY trend_category
ORDER BY count DESC;
