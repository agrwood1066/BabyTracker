-- ============================================
-- FIX: Clean up ons_name_predictions duplicates and assign correctly
-- ============================================

-- First, remove all the duplicate/incorrect predictions
DELETE FROM ons_name_predictions;

-- Now insert correct predictions for each trending name
INSERT INTO ons_name_predictions (name_id, prediction_year, predicted_rank, confidence_score, prediction_type, created_at) VALUES

-- Raya predictions (ba138efc-7f6f-4c71-9328-742b001c55a7)
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2025, 75, 0.85, 'Momentum', NOW()),
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2026, 65, 0.80, 'Momentum', NOW()),
('ba138efc-7f6f-4c71-9328-742b001c55a7', 2027, 55, 0.75, 'Cultural', NOW()),

-- Bodhi predictions (8c38989b-916f-4403-9343-2003d64bf45c)
('8c38989b-916f-4403-9343-2003d64bf45c', 2025, 85, 0.82, 'Momentum', NOW()),
('8c38989b-916f-4403-9343-2003d64bf45c', 2026, 75, 0.78, 'Momentum', NOW()),
('8c38989b-916f-4403-9343-2003d64bf45c', 2027, 68, 0.72, 'Momentum', NOW()),

-- Maeve predictions (04b15bb6-da82-4f7e-8784-b0a6aae7b213)
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2025, 22, 0.88, 'Momentum', NOW()),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2026, 18, 0.85, 'Momentum', NOW()),
('04b15bb6-da82-4f7e-8784-b0a6aae7b213', 2027, 15, 0.80, 'Momentum', NOW()),

-- Enzo predictions (c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456)
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 2025, 80, 0.83, 'Momentum', NOW()),
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 2026, 70, 0.80, 'Momentum', NOW()),
('c9fe13bb-4ba6-4c86-8c4a-2cd0e2f3a456', 2027, 62, 0.75, 'Momentum', NOW()),

-- Eden predictions (bab9fdd4-4bda-4db8-a786-94b18539ebe9)
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2025, 45, 0.78, 'Momentum', NOW()),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2026, 35, 0.75, 'Momentum', NOW()),
('bab9fdd4-4bda-4db8-a786-94b18539ebe9', 2027, 28, 0.70, 'Momentum', NOW()),

-- Yahya predictions (44c677f7-f9a3-46e3-bc13-5eac83689d4c)
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2025, 75, 0.80, 'Momentum', NOW()),
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2026, 65, 0.75, 'Momentum', NOW()),
('44c677f7-f9a3-46e3-bc13-5eac83689d4c', 2027, 58, 0.70, 'Momentum', NOW()),

-- Athena predictions (bc234567-89de-5f01-bc23-4567890bcdef)
('bc234567-89de-5f01-bc23-4567890bcdef', 2025, 85, 0.80, 'Momentum', NOW()),
('bc234567-89de-5f01-bc23-4567890bcdef', 2026, 75, 0.75, 'Momentum', NOW()),
('bc234567-89de-5f01-bc23-4567890bcdef', 2027, 65, 0.70, 'Momentum', NOW()),

-- Margot predictions (cd840f2b-50c0-4174-a7aa-a0f6928995eb)
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2025, 22, 0.85, 'Momentum', NOW()),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2026, 18, 0.82, 'Momentum', NOW()),
('cd840f2b-50c0-4174-a7aa-a0f6928995eb', 2027, 15, 0.78, 'Momentum', NOW()),

-- Ophelia predictions (780d03fe-81e0-4fea-bf96-ff6c2c9ee850)
('780d03fe-81e0-4fea-bf96-ff6c2c9ee850', 2025, 65, 0.78, 'Momentum', NOW()),
('780d03fe-81e0-4fea-bf96-ff6c2c9ee850', 2026, 55, 0.75, 'Momentum', NOW()),
('780d03fe-81e0-4fea-bf96-ff6c2c9ee850', 2027, 45, 0.70, 'Momentum', NOW()),

-- Hazel predictions (9876543a-bcde-4321-9876-543210fedcba)
('9876543a-bcde-4321-9876-543210fedcba', 2025, 65, 0.80, 'Momentum', NOW()),
('9876543a-bcde-4321-9876-543210fedcba', 2026, 55, 0.77, 'Momentum', NOW()),
('9876543a-bcde-4321-9876-543210fedcba', 2027, 48, 0.72, 'Momentum', NOW()),

-- Nova predictions (f5b97b6f-eadf-42ac-bb3e-e047aa8e0d05)
('f5b97b6f-eadf-42ac-bb3e-e047aa8e0d05', 2025, 70, 0.78, 'Momentum', NOW()),
('f5b97b6f-eadf-42ac-bb3e-e047aa8e0d05', 2026, 60, 0.75, 'Momentum', NOW()),
('f5b97b6f-eadf-42ac-bb3e-e047aa8e0d05', 2027, 52, 0.70, 'Momentum', NOW()),

-- Ottilie predictions (143a08e5-5c46-4679-b54c-5a06042ff0ec)
('143a08e5-5c46-4679-b54c-5a06042ff0ec', 2025, 62, 0.76, 'Momentum', NOW()),
('143a08e5-5c46-4679-b54c-5a06042ff0ec', 2026, 52, 0.73, 'Momentum', NOW()),
('143a08e5-5c46-4679-b54c-5a06042ff0ec', 2027, 45, 0.68, 'Momentum', NOW()),

-- Stable names - Muhammad (11111111-2222-3333-4444-555555555555)
('11111111-2222-3333-4444-555555555555', 2025, 1, 0.95, 'Conservative', NOW()),
('11111111-2222-3333-4444-555555555555', 2026, 1, 0.92, 'Conservative', NOW()),
('11111111-2222-3333-4444-555555555555', 2027, 1, 0.88, 'Conservative', NOW()),

-- Stable names - Olivia (aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee)
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2025, 1, 0.95, 'Conservative', NOW()),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2026, 1, 0.92, 'Conservative', NOW()),
('aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee', 2027, 2, 0.85, 'Conservative', NOW()),

-- Additional trending names
-- Hudson predictions (e8b4c123-9a87-4d56-b234-1f8c9e7a4567)
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 2025, 35, 0.82, 'Momentum', NOW()),
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 2026, 28, 0.78, 'Momentum', NOW()),
('e8b4c123-9a87-4d56-b234-1f8c9e7a4567', 2027, 22, 0.73, 'Momentum', NOW()),

-- Jude predictions (7b4ca89e-1a23-4c58-b845-8f2a1e4d8901)
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 2025, 8, 0.88, 'Momentum', NOW()),
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 2026, 6, 0.85, 'Momentum', NOW()),
('7b4ca89e-1a23-4c58-b845-8f2a1e4d8901', 2027, 5, 0.80, 'Momentum', NOW())

ON CONFLICT (name_id, prediction_year) DO UPDATE SET
    predicted_rank = EXCLUDED.predicted_rank,
    confidence_score = EXCLUDED.confidence_score,
    prediction_type = EXCLUDED.prediction_type,
    created_at = EXCLUDED.created_at;

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify the fix worked:
-- SELECT n.name, n.gender, p.prediction_year, p.predicted_rank, p.confidence_score 
-- FROM ons_baby_names n 
-- JOIN ons_name_predictions p ON n.id = p.name_id 
-- ORDER BY n.name, p.prediction_year;
