-- Clean up duplicate appointments in the database
-- This query removes duplicate preset appointments, keeping only one of each type per family

-- First, identify and delete duplicates
WITH duplicates AS (
  SELECT 
    id,
    ROW_NUMBER() OVER (
      PARTITION BY family_id, title, preset_week, appointment_type 
      ORDER BY created_at ASC
    ) as rn
  FROM appointments
  WHERE appointment_type = 'preset'
)
DELETE FROM appointments
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Verify the cleanup
SELECT 
  family_id,
  title,
  preset_week,
  COUNT(*) as count
FROM appointments
WHERE appointment_type = 'preset'
GROUP BY family_id, title, preset_week
HAVING COUNT(*) > 1;
-- This should return no rows if cleanup was successful
