-- ============================================
-- UPDATE PREDICTION_TYPE CHECK CONSTRAINT
-- Add missing values: Declining, Stabilising
-- ============================================

-- First, let's see what the current constraint allows
-- SELECT conname, consrc FROM pg_constraint WHERE conname LIKE '%prediction_type%';

-- Drop the existing check constraint
ALTER TABLE ons_name_predictions 
DROP CONSTRAINT IF EXISTS ons_name_predictions_prediction_type_check;

-- Add the updated constraint with all prediction types
ALTER TABLE ons_name_predictions 
ADD CONSTRAINT ons_name_predictions_prediction_type_check 
CHECK (prediction_type IN (
    'Momentum', 
    'Conservative', 
    'Cultural',
    'Declining',
    'Stabilising'
));

-- Verify the constraint was added
-- SELECT conname, pg_get_constraintdef(oid) as constraint_definition 
-- FROM pg_constraint 
-- WHERE conname = 'ons_name_predictions_prediction_type_check';

-- ============================================
-- NOW THE FULL PREDICTIONS SCRIPT WILL WORK
-- ============================================
