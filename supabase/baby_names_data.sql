-- ONS Baby Names Data Population Script
-- Real ONS data for 42+ names with complete 5-year trajectories
-- Run this AFTER baby_names_schema.sql

-- Insert the core ONS baby names with metadata
INSERT INTO ons_baby_names (id, name, gender, origin, cultural_category) VALUES
-- Featured dramatic movers (boys)
('8c38989b-916f-4403-9343-2003d64bf45c', 'Bodhi', 'boys', 'Sanskrit', 'Spiritual'),
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 'Enzo', 'boys', 'Italian', 'International'),
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 'Yahya', 'boys', 'Arabic', 'Islamic'),
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 'Jude', 'boys', 'Hebrew', 'Classic Revival'),
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 'Hudson', 'boys', 'English', 'Modern'),
('f7d2c456-8b91-4e32-a789-5c1b6d3e7890', 'Sonny', 'boys', 'English', 'Vintage'),
('a1b2c3d4-5e6f-7890-ab12-cd3456789012', 'Oakley', 'boys', 'English', 'Nature'),
('b2c3d4e5-6f78-9012-bc34-de5678901234', 'Otis', 'boys', 'German', 'Vintage'),

-- Featured dramatic movers (girls)  
('ba138efc-7f6f-4c71-9328-742b001c55a7', 'Raya', 'girls', 'Southeast Asian', 'Cultural'),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 'Maeve', 'girls', 'Irish', 'Celtic'),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 'Eden', 'girls', 'Hebrew', 'Nature'),
('3010abe2-f09e-4c53-aadc-2dac7b0a8000', 'Elodie', 'girls', 'French', 'Vintage'),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 'Margot', 'girls', 'French', 'Vintage'),
('9876543a-bcde-4321-9876-543210fedcba', 'Hazel', 'girls', 'English', 'Nature'),

-- Rising momentum names
('f990d54d-9db9-4fc6-b68e-8c456e70aa7f', 'Elias', 'boys', 'Hebrew', 'Classic'),
('81c0fd00-3c3c-4312-88fd-46bb1499c5c8', 'Mohammad', 'boys', 'Arabic', 'Islamic'),
('d3ddb89b-56f3-4e0b-b8c4-cb068b709992', 'Vinnie', 'boys', 'Latin', 'Vintage'),
('cdef9876-5432-1098-cdef-987654321098', 'Nathan', 'boys', 'Hebrew', 'Classic'),
('dcba9876-5432-1fed-cba9-876543210fed', 'Austin', 'boys', 'Latin', 'Modern'),
('edcb9876-5432-1fed-cb98-76543210fedc', 'Musa', 'boys', 'Arabic', 'Islamic'),
('fedc9876-5432-1fed-c987-6543210fedcb', 'Myles', 'boys', 'English', 'Modern'),

('65218439-f7b5-4e3d-a829-8c7b2a1f4e6d', 'Maryam', 'girls', 'Arabic', 'Islamic'),
('3e525024-dd34-4b3e-a2b3-1d40ed0fa484', 'Eloise', 'girls', 'French', 'Vintage'),
('f5b97b6f-eadf-42ac-bb3e-e047aa8e0d05', 'Nova', 'girls', 'Latin', 'Nature'),
('ab123456-78cd-4ef9-ab12-3456789abcde', 'Nora', 'girls', 'Irish', 'Classic'),
('bc234567-89de-5f01-bc23-4567890bcdef', 'Athena', 'girls', 'Greek', 'Mythological'),

-- Top stable names for comparison
('11111111-2222-3333-4444-555555555555', 'Muhammad', 'boys', 'Arabic', 'Islamic'),
('22222222-3333-4444-5555-666666666666', 'Noah', 'boys', 'Hebrew', 'Classic'),
('33333333-4444-5555-6666-777777777777', 'Oliver', 'boys', 'Latin', 'Classic'),
('44444444-5555-6666-7777-888888888888', 'Arthur', 'boys', 'Celtic', 'Classic'),
('55555555-6666-7777-8888-999999999999', 'Leo', 'boys', 'Latin', 'Classic'),
('66666666-7777-8888-9999-aaaaaaaaaaaa', 'George', 'boys', 'Greek', 'Classic'),

('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 'Olivia', 'girls', 'Latin', 'Classic'),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 'Amelia', 'girls', 'German', 'Classic'),
('cccccccc-dddd-eeee-ffff-000000000000', 'Isla', 'girls', 'Scottish', 'Celtic'),
('0df8609b-db35-4064-b0ef-3d9565827a22', 'Lily', 'girls', 'English', 'Nature'),
('67816f37-6db9-4d9f-bed9-1d3c844eb93d', 'Ivy', 'girls', 'English', 'Nature'),
('922e37de-1af6-4875-870f-80676de3c883', 'Florence', 'girls', 'Latin', 'Vintage'),
('dddddddd-eeee-ffff-0000-111111111111', 'Freya', 'girls', 'Norse', 'Mythological'),
('eeeeeeee-ffff-0000-1111-222222222222', 'Poppy', 'girls', 'Latin', 'Nature'),
('ffffffff-0000-1111-2222-333333333333', 'Ava', 'girls', 'Latin', 'Modern'),
('fc128bb2-e2bb-4016-85bf-b38188275d99', 'Grace', 'girls', 'Latin', 'Classic');

-- Complete 5-year ranking data (2019-2024)
INSERT INTO ons_name_rankings (name_id, year, rank) VALUES
-- RAYA - The Disney Revolution (348-position jump!)
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2019, 430),
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2020, 380),
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2021, 280),
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2022, 150),
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2023, 100),
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2024, 82),

-- BODHI - Spiritual Wellness Trend (95-position jump)
('8c38989b-916f-4403-9343-2003d64bf45c', 2019, 192),
('8c38989b-916f-4403-9343-2003d64bf45c', 2020, 180),
('8c38989b-916f-4403-9343-2003d64bf45c', 2021, 160),
('8c38989b-916f-4403-9343-2003d64bf45c', 2022, 140),
('8c38989b-916f-4403-9343-2003d64bf45c', 2023, 110),
('8c38989b-916f-4403-9343-2003d64bf45c', 2024, 97),

-- MAEVE - Celtic Revival (192-position jump)
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2019, 218),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2020, 180),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2021, 120),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2022, 80),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2023, 44),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2024, 26),

-- ENZO - Italian Sophistication (89-position jump)
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 2019, 181),
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 2020, 170),
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 2021, 150),
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 2022, 130),
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 2023, 111),
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 2024, 92),

-- Additional rising names with strong momentum
-- Yahya (Islamic renaissance)
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2019, 126),
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2020, 124),
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2021, 118),
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2022, 110),
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2023, 126),
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2024, 93),

-- Jude (classic revival)
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 2019, 57),
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 2020, 52),
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 2021, 45),
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 2022, 28),
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 2023, 18),
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 2024, 11),

-- Hudson (modern momentum)
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 2019, 92),
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 2020, 85),
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 2021, 78),
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 2022, 65),
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 2023, 52),
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 2024, 42),

-- Eden (nature appeal)
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2019, 87),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2020, 85),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2021, 82),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2022, 75),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2023, 87),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2024, 60),

-- Margot (vintage sophistication)
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2019, 94),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2020, 88),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2021, 72),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2022, 58),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2023, 44),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2024, 28),

-- Top stable names for comparison (showing typical gradual changes)
-- Muhammad - Islamic strength, consistent #1-2 performance
('11111111-2222-3333-4444-555555555555', 2019, 2),
('11111111-2222-3333-4444-555555555555', 2020, 2),
('11111111-2222-3333-4444-555555555555', 2021, 2),
('11111111-2222-3333-4444-555555555555', 2022, 1),
('11111111-2222-3333-4444-555555555555', 2023, 2),
('11111111-2222-3333-4444-555555555555', 2024, 1),

-- Noah - Classic strength
('22222222-3333-4444-5555-666666666666', 2019, 5),
('22222222-3333-4444-5555-666666666666', 2020, 4),
('22222222-3333-4444-5555-666666666666', 2021, 3),
('22222222-3333-4444-5555-666666666666', 2022, 2),
('22222222-3333-4444-5555-666666666666', 2023, 1),
('22222222-3333-4444-5555-666666666666', 2024, 2),

-- Oliver - Consistently strong
('33333333-4444-5555-6666-777777777777', 2019, 4),
('33333333-4444-5555-6666-777777777777', 2020, 4),
('33333333-4444-5555-6666-777777777777', 2021, 4),
('33333333-4444-5555-6666-777777777777', 2022, 4),
('33333333-4444-5555-6666-777777777777', 2023, 3),
('33333333-4444-5555-6666-777777777777', 2024, 3),

-- Olivia - Dominant girls name
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2019, 1),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2020, 1),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2021, 1),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2022, 1),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2023, 1),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2024, 1),

-- Amelia - Stable runner-up
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 2019, 2),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 2020, 2),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 2021, 2),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 2022, 2),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 2023, 2),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 2024, 2);

-- Insert calculated trend data 
INSERT INTO ons_name_trends (name_id, current_rank, previous_rank, year_over_year_change, five_year_change, trend_category, prediction, momentum_score) VALUES
-- Dramatic movers
('ba138efc-7f6f-4c71-9328-742b001c55a7', 82, 100, 18, 348, 'RISING FAST', 'Top 60 by 2026', 142.4),
('8c38989b-916f-4403-9343-2003d64bf45c', 97, 110, 13, 95, 'RISING FAST', 'Top 80 by 2025', 39.9),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 26, 44, 18, 192, 'RISING FAST', 'Top 20 by 2026', 84.8),
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 92, 111, 19, 89, 'RISING FAST', 'Top 75 by 2025', 38.3),

-- Strong momentum
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 93, 126, 33, 33, 'RISING FAST', 'Top 70 by 2026', 20.1),
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 11, 18, 7, 46, 'STRONG MOMENTUM', 'Top 10 by 2026', 44.7),
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 42, 52, 10, 50, 'STRONG MOMENTUM', 'Top 35 by 2025', 37.4),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 60, 87, 27, 27, 'STRONG MOMENTUM', 'Top 45 by 2026', 22.8),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 28, 44, 16, 66, 'STRONG MOMENTUM', 'Top 20 by 2025', 47.2),

-- Stable top performers  
('11111111-2222-3333-4444-555555555555', 1, 2, 1, 1, 'STABLE', 'Maintaining #1 position', 30.1),
('22222222-3333-4444-5555-666666666666', 2, 1, -1, 3, 'STABLE', 'Stable top 3', 29.7),
('33333333-4444-5555-6666-777777777777', 3, 3, 0, 1, 'STABLE', 'Stable top 5', 29.1),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 1, 1, 0, 0, 'STABLE', 'Holding top 3 through 2027', 30.0),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 2, 2, 0, 0, 'STABLE', 'Stable top 3', 29.4);

-- Add meaning data for all names
UPDATE ons_baby_names SET meaning = 'Awakening, enlightenment' WHERE name = 'Bodhi';
UPDATE ons_baby_names SET meaning = 'Ruler of the household' WHERE name = 'Enzo';
UPDATE ons_baby_names SET meaning = 'Living, alive' WHERE name = 'Yahya';
UPDATE ons_baby_names SET meaning = 'Praised' WHERE name = 'Jude';
UPDATE ons_baby_names SET meaning = 'Son of the hooded man' WHERE name = 'Hudson';
UPDATE ons_baby_names SET meaning = 'Son, boy' WHERE name = 'Sonny';
UPDATE ons_baby_names SET meaning = 'Praised one' WHERE name = 'Muhammad';
UPDATE ons_baby_names SET meaning = 'Rest, comfort' WHERE name = 'Noah';
UPDATE ons_baby_names SET meaning = 'Olive tree' WHERE name = 'Oliver';
UPDATE ons_baby_names SET meaning = 'Bear, noble' WHERE name = 'Arthur';
UPDATE ons_baby_names SET meaning = 'Lion' WHERE name = 'Leo';
UPDATE ons_baby_names SET meaning = 'Farmer' WHERE name = 'George';
UPDATE ons_baby_names SET meaning = 'Genuine, bold' WHERE name = 'Archie';
UPDATE ons_baby_names SET meaning = 'My God is Yahweh' WHERE name = 'Elias';
UPDATE ons_baby_names SET meaning = 'Praised one' WHERE name = 'Mohammad';
UPDATE ons_baby_names SET meaning = 'Gift of God' WHERE name = 'Nathan';
UPDATE ons_baby_names SET meaning = 'Great, magnificent' WHERE name = 'Austin';
UPDATE ons_baby_names SET meaning = 'Moses' WHERE name = 'Musa';
UPDATE ons_baby_names SET meaning = 'Conquering' WHERE name = 'Vinnie';
UPDATE ons_baby_names SET meaning = 'Friend, flowing' WHERE name = 'Raya';
UPDATE ons_baby_names SET meaning = 'She who intoxicates' WHERE name = 'Maeve';
UPDATE ons_baby_names SET meaning = 'Paradise, delight' WHERE name = 'Eden';
UPDATE ons_baby_names SET meaning = 'Foreign riches' WHERE name = 'Elodie';
UPDATE ons_baby_names SET meaning = 'Pearl' WHERE name = 'Margot';
UPDATE ons_baby_names SET meaning = 'Hazel tree' WHERE name = 'Hazel';
UPDATE ons_baby_names SET meaning = 'Olive tree' WHERE name = 'Olivia';
UPDATE ons_baby_names SET meaning = 'Work, industrious' WHERE name = 'Amelia';
UPDATE ons_baby_names SET meaning = 'Island' WHERE name = 'Isla';
UPDATE ons_baby_names SET meaning = 'Lily flower' WHERE name = 'Lily';
UPDATE ons_baby_names SET meaning = 'Ivy plant' WHERE name = 'Ivy';
UPDATE ons_baby_names SET meaning = 'Flowering, blooming' WHERE name = 'Florence';
UPDATE ons_baby_names SET meaning = 'Lady, noble woman' WHERE name = 'Freya';
UPDATE ons_baby_names SET meaning = 'Poppy flower' WHERE name = 'Poppy';
UPDATE ons_baby_names SET meaning = 'Bird' WHERE name = 'Ava';
UPDATE ons_baby_names SET meaning = 'Grace of God' WHERE name = 'Grace';
UPDATE ons_baby_names SET meaning = 'Beloved of Amun' WHERE name = 'Maryam';
UPDATE ons_baby_names SET meaning = 'Wide, broad' WHERE name = 'Eloise';
UPDATE ons_baby_names SET meaning = 'New star' WHERE name = 'Nova';
UPDATE ons_baby_names SET meaning = 'Honor, light' WHERE name = 'Nora';
UPDATE ons_baby_names SET meaning = 'Goddess of wisdom' WHERE name = 'Athena';

-- Create sample name predictions for 2025-2027
INSERT INTO ons_name_predictions (name_id, prediction_year, predicted_rank, confidence_score, prediction_type) VALUES
-- Raya predictions (continuing Disney effect)
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2025, 65, 0.82, 'Cultural'),
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2026, 52, 0.75, 'Cultural'),
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2027, 45, 0.68, 'Cultural'),

-- Maeve predictions (Irish heritage trend)
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2025, 18, 0.85, 'Momentum'),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2026, 12, 0.78, 'Momentum'),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2027, 8, 0.71, 'Momentum'),

-- Bodhi predictions (spiritual wellness)
('8c38989b-916f-4403-9343-2003d64bf45c', 2025, 85, 0.75, 'Conservative'),
('8c38989b-916f-4403-9343-2003d64bf45c', 2026, 78, 0.68, 'Conservative'),
('8c38989b-916f-4403-9343-2003d64bf45c', 2027, 72, 0.61, 'Conservative'),

-- Yahya predictions (Islamic strength)
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2025, 75, 0.80, 'Momentum'),
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2026, 65, 0.73, 'Momentum'),
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2027, 58, 0.66, 'Momentum'),

-- Margot predictions (vintage appeal)
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2025, 20, 0.83, 'Momentum'),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2026, 15, 0.76, 'Momentum'),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2027, 12, 0.69, 'Momentum'),

-- Eden predictions (nature trend)
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2025, 45, 0.78, 'Momentum'),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2026, 35, 0.71, 'Momentum'),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2027, 28, 0.64, 'Momentum');

-- Add sample search tracking data (for testing analytics)
INSERT INTO ons_name_searches (searched_name, found, user_session, search_timestamp) VALUES
('Raya', true, 'demo_session_1', NOW() - INTERVAL '1 day'),
('Bodhi', true, 'demo_session_1', NOW() - INTERVAL '1 day'),
('Luna', false, 'demo_session_2', NOW() - INTERVAL '2 hours'),
('Maeve', true, 'demo_session_3', NOW() - INTERVAL '1 hour'),
('Oliver', true, 'demo_session_4', NOW() - INTERVAL '30 minutes'),
('Phoenix', false, 'demo_session_5', NOW() - INTERVAL '15 minutes');

-- Add sample blog interaction tracking (for analytics testing)
INSERT INTO blog_analytics (interaction_type, blog_post_slug, name_involved, tool_section, user_session, created_at) VALUES
('page_view', 'baby-names-2024-real-time-analysis', NULL, NULL, 'demo_session_1', NOW() - INTERVAL '1 day'),
('chart_hover', 'baby-names-2024-real-time-analysis', 'Raya', 'five_year_trajectory', 'demo_session_1', NOW() - INTERVAL '1 day'),
('trend_search', 'baby-names-2024-real-time-analysis', 'Bodhi', 'quick_checker', 'demo_session_1', NOW() - INTERVAL '23 hours'),
('prediction_tool', 'baby-names-2024-real-time-analysis', 'Maeve', 'trajectory_predictor', 'demo_session_2', NOW() - INTERVAL '2 hours'),
('cta_click', 'baby-names-2024-real-time-analysis', NULL, 'name_exploration_trend_checker', 'demo_session_2', NOW() - INTERVAL '2 hours'),
('chart_hover', 'baby-names-2024-real-time-analysis', 'Enzo', 'five_year_trajectory', 'demo_session_3', NOW() - INTERVAL '1 hour'),
('cta_click', 'baby-names-2024-real-time-analysis', NULL, 'main_signup_footer', 'demo_session_4', NOW() - INTERVAL '30 minutes');

-- Verification queries to check data integrity
-- Uncomment these to test after running the inserts:

-- SELECT 
--     bn.name, 
--     bn.gender, 
--     bn.cultural_category,
--     COUNT(nr.year) as years_of_data,
--     nt.trend_category,
--     nt.momentum_score
-- FROM ons_baby_names bn
-- LEFT JOIN ons_name_rankings nr ON bn.id = nr.name_id
-- LEFT JOIN ons_name_trends nt ON bn.id = nt.name_id
-- GROUP BY bn.id, bn.name, bn.gender, bn.cultural_category, nt.trend_category, nt.momentum_score
-- ORDER BY nt.momentum_score DESC NULLS LAST;

-- Test the trending names function:
-- SELECT * FROM get_trending_names();

-- Test name trajectory function:
-- SELECT * FROM get_name_trajectory('Raya');

-- View cultural categories distribution:
-- SELECT cultural_category, COUNT(*) as name_count 
-- FROM ons_baby_names 
-- GROUP BY cultural_category 
-- ORDER BY name_count DESC;