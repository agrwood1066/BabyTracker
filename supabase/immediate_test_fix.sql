-- IMMEDIATE TEST & FIX
-- Run these queries one by one to diagnose and fix the issue

-- ========================================
-- QUERY 1: Check if jut_60_macro@icloud.com exists
-- ========================================
SELECT 
    id,
    email,
    family_id,
    due_date,
    subscription_status
FROM profiles 
WHERE email = 'jut_60_macro@icloud.com';

-- If no results, the user doesn't exist in profiles table
-- If family_id is NULL, that's the problem

-- ========================================
-- QUERY 2: If user exists but family_id is NULL, fix it
-- ========================================
UPDATE profiles 
SET 
    family_id = COALESCE(family_id, uuid_generate_v4()),
    due_date = COALESCE(due_date, '2026-04-22'::date)
WHERE email = 'jut_60_macro@icloud.com'
RETURNING id, email, family_id, due_date;

-- ========================================
-- QUERY 3: Check for any appointments
-- ========================================
SELECT COUNT(*) as total_appointments
FROM appointments;

-- ========================================
-- QUERY 4: Create appointments for jut_60_macro@icloud.com
-- ========================================
WITH user_info AS (
    SELECT id, family_id, COALESCE(due_date, '2026-04-22'::date) as due_date
    FROM profiles 
    WHERE email = 'jut_60_macro@icloud.com'
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
    v.title,
    v.description,
    'preset',
    v.week,
    u.due_date - (INTERVAL '1 week' * (40 - v.week)),
    false,
    'upcoming'
FROM user_info u,
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
) AS v(week, title, description)
ON CONFLICT DO NOTHING;  -- Prevents duplicates

-- ========================================
-- QUERY 5: Verify appointments were created
-- ========================================
SELECT 
    a.title,
    a.preset_week,
    a.appointment_date,
    p.email as created_by_email
FROM appointments a
JOIN profiles p ON a.created_by = p.id
WHERE p.email = 'jut_60_macro@icloud.com'
ORDER BY a.preset_week;

-- ========================================
-- QUERY 6: If still having RLS issues, temporarily disable RLS (for testing only)
-- ========================================
-- WARNING: Only use this for testing, re-enable after fixing
-- ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;

-- To re-enable:
-- ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
