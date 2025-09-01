-- IMMEDIATE FIX: Run this to restore your preset appointments
-- This script will fix your current issue and create all 12 NHS appointments

-- Step 1: Check your current profile status
SELECT 
    id, 
    email, 
    full_name, 
    family_id, 
    due_date 
FROM profiles 
WHERE email = 'test@example.com';

-- Step 2: Ensure you have a family_id (if NULL, this will create one)
UPDATE profiles 
SET family_id = COALESCE(family_id, uuid_generate_v4())
WHERE email = 'test@example.com'
RETURNING id, email, family_id, due_date;

-- Step 3: Clean up any existing preset appointments to avoid duplicates
DELETE FROM appointments 
WHERE family_id = (SELECT family_id FROM profiles WHERE email = 'test@example.com')
AND appointment_type = 'preset';

-- Step 4: Create all 12 NHS preset appointments
WITH user_data AS (
    SELECT id, family_id, due_date 
    FROM profiles 
    WHERE email = 'test@example.com'
)
INSERT INTO appointments (
    family_id, 
    created_by, 
    title, 
    description, 
    appointment_type, 
    preset_week, 
    appointment_date, 
    is_scheduled, 
    status
)
SELECT 
    u.family_id,
    u.id,
    a.title,
    a.description,
    'preset',
    a.week,
    u.due_date - (INTERVAL '1 week' * (40 - a.week)),
    false,
    'upcoming'
FROM user_data u,
(VALUES 
    (8, 'Booking Appointment', 'Initial midwife appointment with blood tests and screening discussions'),
    (12, '12-Week Dating Scan', 'Dating scan and Down''s syndrome screening'),
    (15, 'Midwife Check-up', 'Antenatal check and blood tests'),
    (20, '20-Week Anomaly Scan', 'Detailed scan to check baby''s development'),
    (24, 'Midwife Appointment', 'Antenatal checks and breastfeeding information'),
    (28, '28-Week Appointment', 'Blood tests, Anti-D if needed, glucose test'),
    (31, 'Midwife Check-up', 'Growth and position check'),
    (34, '34-Week Check', 'Birth plan discussion'),
    (36, '36-Week Appointment', 'Position check and birth preparation'),
    (38, '38-Week Check', 'Final preparations'),
    (40, 'Due Date Check', 'Discussion about prolonged pregnancy'),
    (41, '41-Week Appointment', 'Membrane sweep offer and induction discussion')
) AS a(week, title, description);

-- Step 5: Verify the appointments were created
SELECT 
    title,
    preset_week as week,
    appointment_date,
    description
FROM appointments 
WHERE family_id = (SELECT family_id FROM profiles WHERE email = 'test@example.com')
AND appointment_type = 'preset'
ORDER BY preset_week;

-- Expected output: 12 appointments with dates calculated from your due date (22 April 2026)
