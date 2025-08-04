-- ============================================
-- ADD PREDICTIONS FOR ALL REMAINING NAMES
-- Complete the ons_name_predictions for all names in ons_baby_names
-- ============================================

-- Add predictions for all the remaining names that don't have predictions yet
INSERT INTO ons_name_predictions (name_id, prediction_year, predicted_rank, confidence_score, prediction_type, created_at) VALUES

-- CLASSIC STABLE NAMES
-- Noah (22222222-3333-4444-5555-666666666666) - Stable top 3
('22222222-3333-4444-5555-666666666666', 2025, 2, 0.92, 'Conservative', NOW()),
('22222222-3333-4444-5555-666666666666', 2026, 3, 0.88, 'Conservative', NOW()),
('22222222-3333-4444-5555-666666666666', 2027, 3, 0.85, 'Conservative', NOW()),

-- Oliver (33333333-4444-5555-6666-777777777777) - Stable top 5
('33333333-4444-5555-6666-777777777777', 2025, 3, 0.90, 'Conservative', NOW()),
('33333333-4444-5555-6666-777777777777', 2026, 3, 0.87, 'Conservative', NOW()),
('33333333-4444-5555-6666-777777777777', 2027, 4, 0.83, 'Conservative', NOW()),

-- Arthur (44444444-5555-6666-7777-888888888888) - Stable top 5
('44444444-5555-6666-7777-888888888888', 2025, 4, 0.88, 'Conservative', NOW()),
('44444444-5555-6666-7777-888888888888', 2026, 5, 0.85, 'Conservative', NOW()),
('44444444-5555-6666-7777-888888888888', 2027, 5, 0.82, 'Conservative', NOW()),

-- Leo (55555555-6666-7777-8888-999999999999) - Stable top 10
('55555555-6666-7777-8888-999999999999', 2025, 5, 0.87, 'Conservative', NOW()),
('55555555-6666-7777-8888-999999999999', 2026, 6, 0.84, 'Conservative', NOW()),
('55555555-6666-7777-8888-999999999999', 2027, 6, 0.80, 'Conservative', NOW()),

-- George (66666666-7777-8888-9999-aaaaaaaaaaaa) - Stable top 10
('66666666-7777-8888-9999-aaaaaaaaaaaa', 2025, 6, 0.85, 'Conservative', NOW()),
('66666666-7777-8888-9999-aaaaaaaaaaaa', 2026, 7, 0.82, 'Conservative', NOW()),
('66666666-7777-8888-9999-aaaaaaaaaaaa', 2027, 8, 0.78, 'Conservative', NOW()),

-- Amelia (bbbbbbbb-cccc-dddd-eeee-ffffffffffff) - Stable top 3
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 2025, 2, 0.90, 'Conservative', NOW()),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 2026, 3, 0.87, 'Conservative', NOW()),
('bbbbbbbb-cccc-dddd-eeee-ffffffffffff', 2027, 3, 0.83, 'Conservative', NOW()),

-- Isla (cccccccc-dddd-eeee-ffff-000000000000) - Stable top 5
('cccccccc-dddd-eeee-ffff-000000000000', 2025, 4, 0.87, 'Conservative', NOW()),
('cccccccc-dddd-eeee-ffff-000000000000', 2026, 5, 0.84, 'Conservative', NOW()),
('cccccccc-dddd-eeee-ffff-000000000000', 2027, 5, 0.80, 'Conservative', NOW()),

-- Grace (fc128bb2-e2bb-4016-85bf-b38188275d99) - Classic stable
('fc128bb2-e2bb-4016-85bf-b38188275d99', 2025, 12, 0.82, 'Conservative', NOW()),
('fc128bb2-e2bb-4016-85bf-b38188275d99', 2026, 13, 0.78, 'Conservative', NOW()),
('fc128bb2-e2bb-4016-85bf-b38188275d99', 2027, 14, 0.75, 'Conservative', NOW()),

-- NATURE NAMES - RISING TREND
-- Ivy (67816f37-6db9-4d9f-bed9-1d3c844eb93d) - Nature trend
('67816f37-6db9-4d9f-bed9-1d3c844eb93d', 2025, 5, 0.85, 'Momentum', NOW()),
('67816f37-6db9-4d9f-bed9-1d3c844eb93d', 2026, 4, 0.82, 'Momentum', NOW()),
('67816f37-6db9-4d9f-bed9-1d3c844eb93d', 2027, 3, 0.78, 'Momentum', NOW()),

-- Lily (0df8609b-db35-4064-b0ef-3d9565827a22) - Nature stable
('0df8609b-db35-4064-b0ef-3d9565827a22', 2025, 3, 0.88, 'Conservative', NOW()),
('0df8609b-db35-4064-b0ef-3d9565827a22', 2026, 4, 0.85, 'Conservative', NOW()),
('0df8609b-db35-4064-b0ef-3d9565827a22', 2027, 4, 0.82, 'Conservative', NOW()),

-- Poppy (eeeeeeee-ffff-0000-1111-222222222222) - Nature rising
('eeeeeeee-ffff-0000-1111-222222222222', 2025, 8, 0.83, 'Momentum', NOW()),
('eeeeeeee-ffff-0000-1111-222222222222', 2026, 7, 0.80, 'Momentum', NOW()),
('eeeeeeee-ffff-0000-1111-222222222222', 2027, 6, 0.76, 'Momentum', NOW()),

-- Oakley (a1b2c3d4-5e6f-7890-ab12-cd3456789012) - Nature rising
('a1b2c3d4-5e6f-7890-ab12-cd3456789012', 2025, 32, 0.78, 'Momentum', NOW()),
('a1b2c3d4-5e6f-7890-ab12-cd3456789012', 2026, 28, 0.75, 'Momentum', NOW()),
('a1b2c3d4-5e6f-7890-ab12-cd3456789012', 2027, 25, 0.70, 'Momentum', NOW()),

-- VINTAGE REVIVAL NAMES
-- Florence (922e37de-1af6-4875-870f-80676de3c883) - Vintage revival
('922e37de-1af6-4875-870f-80676de3c883', 2025, 6, 0.85, 'Conservative', NOW()),
('922e37de-1af6-4875-870f-80676de3c883', 2026, 7, 0.82, 'Conservative', NOW()),
('922e37de-1af6-4875-870f-80676de3c883', 2027, 8, 0.78, 'Conservative', NOW()),

-- Elodie (3010abe2-f09e-4c53-aadc-2dac7b0a8000) - French vintage rising
('3010abe2-f09e-4c53-aadc-2dac7b0a8000', 2025, 52, 0.80, 'Momentum', NOW()),
('3010abe2-f09e-4c53-aadc-2dac7b0a8000', 2026, 45, 0.77, 'Momentum', NOW()),
('3010abe2-f09e-4c53-aadc-2dac7b0a8000', 2027, 38, 0.73, 'Momentum', NOW()),

-- Eloise (3e525024-dd34-4b3e-a2b3-1d40ed0fa484) - Vintage rising
('3e525024-dd34-4b3e-a2b3-1d40ed0fa484', 2025, 78, 0.78, 'Momentum', NOW()),
('3e525024-dd34-4b3e-a2b3-1d40ed0fa484', 2026, 68, 0.75, 'Momentum', NOW()),
('3e525024-dd34-4b3e-a2b3-1d40ed0fa484', 2027, 58, 0.70, 'Momentum', NOW()),

-- Otis (b2c3d4e5-6f78-9012-bc34-de5678901234) - Vintage rising
('b2c3d4e5-6f78-9012-bc34-de5678901234', 2025, 65, 0.75, 'Momentum', NOW()),
('b2c3d4e5-6f78-9012-bc34-de5678901234', 2026, 58, 0.72, 'Momentum', NOW()),
('b2c3d4e5-6f78-9012-bc34-de5678901234', 2027, 52, 0.68, 'Momentum', NOW()),

-- Vinnie (d3ddb89b-56f3-4e0b-b8c4-cb068b709992) - Vintage rising
('d3ddb89b-56f3-4e0b-b8c4-cb068b709992', 2025, 85, 0.72, 'Momentum', NOW()),
('d3ddb89b-56f3-4e0b-b8c4-cb068b709992', 2026, 78, 0.68, 'Momentum', NOW()),
('d3ddb89b-56f3-4e0b-b8c4-cb068b709992', 2027, 72, 0.63, 'Momentum', NOW()),

-- Sonny (f7d2c456-8b91-4e32-a789-5c1b6d3e7890) - Vintage rising
('f7d2c456-8b91-4e32-a789-5c1b6d3e7890', 2025, 48, 0.76, 'Momentum', NOW()),
('f7d2c456-8b91-4e32-a789-5c1b6d3e7890', 2026, 42, 0.73, 'Momentum', NOW()),
('f7d2c456-8b91-4e32-a789-5c1b6d3e7890', 2027, 38, 0.68, 'Momentum', NOW()),

-- ISLAMIC NAMES - STRONG AND RISING
-- Mohammad (81c0fd00-3c3c-4312-88fd-46bb1499c5c8) - Islamic strong
('81c0fd00-3c3c-4312-88fd-46bb1499c5c8', 2025, 52, 0.82, 'Momentum', NOW()),
('81c0fd00-3c3c-4312-88fd-46bb1499c5c8', 2026, 48, 0.78, 'Momentum', NOW()),
('81c0fd00-3c3c-4312-88fd-46bb1499c5c8', 2027, 45, 0.75, 'Momentum', NOW()),

-- Maryam (65218439-f7b5-4e3d-a829-8c7b2a1f4e6d) - Islamic rising
('65218439-f7b5-4e3d-a829-8c7b2a1f4e6d', 2025, 55, 0.78, 'Momentum', NOW()),
('65218439-f7b5-4e3d-a829-8c7b2a1f4e6d', 2026, 48, 0.75, 'Momentum', NOW()),
('65218439-f7b5-4e3d-a829-8c7b2a1f4e6d', 2027, 42, 0.70, 'Momentum', NOW()),

-- Musa (edcb9876-5432-1fed-cb98-76543210fedc) - Islamic rising
('edcb9876-5432-1fed-cb98-76543210fedc', 2025, 70, 0.75, 'Momentum', NOW()),
('edcb9876-5432-1fed-cb98-76543210fedc', 2026, 62, 0.72, 'Momentum', NOW()),
('edcb9876-5432-1fed-cb98-76543210fedc', 2027, 55, 0.68, 'Momentum', NOW()),

-- MODERN NAMES - VARIED TRENDS
-- Mia (004043a5-35cd-48a5-a96e-b5b35e689d8b) - Modern stable
('004043a5-35cd-48a5-a96e-b5b35e689d8b', 2025, 14, 0.82, 'Conservative', NOW()),
('004043a5-35cd-48a5-a96e-b5b35e689d8b', 2026, 15, 0.78, 'Conservative', NOW()),
('004043a5-35cd-48a5-a96e-b5b35e689d8b', 2027, 16, 0.75, 'Conservative', NOW()),

-- Ava (ffffffff-0000-1111-2222-333333333333) - Modern stable
('ffffffff-0000-1111-2222-333333333333', 2025, 9, 0.83, 'Conservative', NOW()),
('ffffffff-0000-1111-2222-333333333333', 2026, 10, 0.80, 'Conservative', NOW()),
('ffffffff-0000-1111-2222-333333333333', 2027, 11, 0.76, 'Conservative', NOW()),

-- Austin (dcba9876-5432-1fed-cba9-876543210fed) - Modern rising
('dcba9876-5432-1fed-cba9-876543210fed', 2025, 85, 0.74, 'Momentum', NOW()),
('dcba9876-5432-1fed-cba9-876543210fed', 2026, 78, 0.71, 'Momentum', NOW()),
('dcba9876-5432-1fed-cba9-876543210fed', 2027, 72, 0.67, 'Momentum', NOW()),

-- Myles (fedc9876-5432-1fed-c987-6543210fedcb) - Modern rising
('fedc9876-5432-1fed-c987-6543210fedcb', 2025, 82, 0.73, 'Momentum', NOW()),
('fedc9876-5432-1fed-c987-6543210fedcb', 2026, 75, 0.70, 'Momentum', NOW()),
('fedc9876-5432-1fed-c987-6543210fedcb', 2027, 68, 0.66, 'Momentum', NOW()),

-- DECLINING NAMES
-- Hunter (936ae33c-57f6-40d4-aeaa-83610f2480c9) - Falling
('936ae33c-57f6-40d4-aeaa-83610f2480c9', 2025, 85, 0.65, 'Declining', NOW()),
('936ae33c-57f6-40d4-aeaa-83610f2480c9', 2026, 92, 0.60, 'Declining', NOW()),
('936ae33c-57f6-40d4-aeaa-83610f2480c9', 2027, 98, 0.55, 'Declining', NOW()),

-- Brody (34df74c0-28d6-4132-8e72-e38bafd0765c) - Falling
('34df74c0-28d6-4132-8e72-e38bafd0765c', 2025, 105, 0.62, 'Declining', NOW()),
('34df74c0-28d6-4132-8e72-e38bafd0765c', 2026, 112, 0.58, 'Declining', NOW()),
('34df74c0-28d6-4132-8e72-e38bafd0765c', 2027, 118, 0.53, 'Declining', NOW()),

-- Mason (594f1bb1-a225-4349-a9ee-ce4e2583508e) - Stabilising after decline
('594f1bb1-a225-4349-a9ee-ce4e2583508e', 2025, 68, 0.70, 'Stabilising', NOW()),
('594f1bb1-a225-4349-a9ee-ce4e2583508e', 2026, 70, 0.68, 'Stabilising', NOW()),
('594f1bb1-a225-4349-a9ee-ce4e2583508e', 2027, 72, 0.65, 'Stabilising', NOW()),

-- CLASSIC REVIVAL & STRONG MOMENTUM
-- Nathan (cdef9876-5432-1098-cdef-987654321098) - Classic steady
('cdef9876-5432-1098-cdef-987654321098', 2025, 85, 0.73, 'Momentum', NOW()),
('cdef9876-5432-1098-cdef-987654321098', 2026, 78, 0.70, 'Momentum', NOW()),
('cdef9876-5432-1098-cdef-987654321098', 2027, 72, 0.66, 'Momentum', NOW()),

-- Elias (f990d54d-9db9-4fc6-b68e-8c456e70aa7f) - Classic rising
('f990d54d-9db9-4fc6-b68e-8c456e70aa7f', 2025, 75, 0.76, 'Momentum', NOW()),
('f990d54d-9db9-4fc6-b68e-8c456e70aa7f', 2026, 68, 0.73, 'Momentum', NOW()),
('f990d54d-9db9-4fc6-b68e-8c456e70aa7f', 2027, 62, 0.68, 'Momentum', NOW()),

-- Nora (ab123456-78cd-4ef9-ab12-3456789abcde) - Classic rising
('ab123456-78cd-4ef9-ab12-3456789abcde', 2025, 82, 0.74, 'Momentum', NOW()),
('ab123456-78cd-4ef9-ab12-3456789abcde', 2026, 75, 0.71, 'Momentum', NOW()),
('ab123456-78cd-4ef9-ab12-3456789abcde', 2027, 68, 0.67, 'Momentum', NOW()),

-- MYTHOLOGICAL NAMES - RISING TREND
-- Freya (dddddddd-eeee-ffff-0000-111111111111) - Mythological stable
('dddddddd-eeee-ffff-0000-111111111111', 2025, 7, 0.84, 'Conservative', NOW()),
('dddddddd-eeee-ffff-0000-111111111111', 2026, 8, 0.81, 'Conservative', NOW()),
('dddddddd-eeee-ffff-0000-111111111111', 2027, 9, 0.77, 'Conservative', NOW())

ON CONFLICT (name_id, prediction_year) DO UPDATE SET
    predicted_rank = EXCLUDED.predicted_rank,
    confidence_score = EXCLUDED.confidence_score,
    prediction_type = EXCLUDED.prediction_type,
    created_at = EXCLUDED.created_at;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Count predictions per name (should be 3 for each)
-- SELECT n.name, COUNT(p.id) as prediction_count
-- FROM ons_baby_names n
-- LEFT JOIN ons_name_predictions p ON n.id = p.name_id
-- GROUP BY n.name, n.id
-- ORDER BY prediction_count DESC, n.name;

-- View all predictions by trend type
-- SELECT p.prediction_type, COUNT(*) as count
-- FROM ons_name_predictions p
-- GROUP BY p.prediction_type
-- ORDER BY count DESC;

-- View sample predictions
-- SELECT n.name, n.cultural_category, p.prediction_year, p.predicted_rank, p.confidence_score, p.prediction_type
-- FROM ons_baby_names n
-- JOIN ons_name_predictions p ON n.id = p.name_id
-- WHERE p.prediction_year = 2025
-- ORDER BY p.predicted_rank;
