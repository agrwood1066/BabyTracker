-- DIAGNOSTIC & FIX for alexgrwood@me.com
-- This script will diagnose and fix the appointment visibility issue

-- ========================================
-- STEP 1: Check your actual profile details
-- ========================================
SELECT 
    id, 
    email, 
    full_name, 
    family_id, 
    due_date,
    subscription_status
FROM profiles 
WHERE email = 'alexgrwood@me.com';

-- ========================================
-- STEP 2: Check if appointments exist for your family_id
-- ========================================
SELECT 
    a.title,
    a.preset_week,
    a.appointment_date,
    a.family_id,
    a.created_by,
    p.email as created_by_email
FROM appointments a
LEFT JOIN profiles p ON a.created_by = p.id
WHERE a.family_id IN (
    SELECT family_id FROM profiles WHERE email = 'alexgrwood@me.com'
)
ORDER BY a.preset_week;

-- ========================================
-- STEP 3: Check for orphaned appointments (wrong family_id)
-- ========================================
SELECT 
    COUNT(*) as orphaned_appointments,
    family_id
FROM appointments 
WHERE appointment_type = 'preset'
AND family_id NOT IN (
    SELECT DISTINCT family_id FROM profiles WHERE family_id IS NOT NULL
)
GROUP BY family_id;

-- ========================================
-- STEP 4: Clean up duplicates (keep only one of each preset week)
-- ========================================
WITH duplicates AS (
    SELECT 
        id,
        preset_week,
        family_id,
        ROW_NUMBER() OVER (PARTITION BY family_id, preset_week ORDER BY created_at ASC) as rn
    FROM appointments
    WHERE appointment_type = 'preset'
)
DELETE FROM appointments
WHERE id IN (
    SELECT id FROM duplicates WHERE rn > 1
);

-- ========================================
-- STEP 5: Fix missing appointments for alexgrwood@me.com
-- ========================================
DO $$
DECLARE
    v_user_id UUID;
    v_family_id UUID;
    v_due_date DATE;
    v_appointment_count INTEGER;
BEGIN
    -- Get user details
    SELECT id, family_id, due_date 
    INTO v_user_id, v_family_id, v_due_date
    FROM profiles 
    WHERE email = 'alexgrwood@me.com';
    
    -- Check if user exists
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User alexgrwood@me.com not found';
        RETURN;
    END IF;
    
    -- Ensure family_id exists
    IF v_family_id IS NULL THEN
        UPDATE profiles 
        SET family_id = uuid_generate_v4()
        WHERE id = v_user_id
        RETURNING family_id INTO v_family_id;
        RAISE NOTICE 'Created new family_id: %', v_family_id;
    END IF;
    
    -- Set due date if missing (using the date from your profile: April 22, 2026)
    IF v_due_date IS NULL THEN
        UPDATE profiles 
        SET due_date = '2026-04-22'::date
        WHERE id = v_user_id;
        v_due_date := '2026-04-22'::date;
        RAISE NOTICE 'Set due date to: %', v_due_date;
    END IF;
    
    -- Count existing appointments
    SELECT COUNT(*) INTO v_appointment_count
    FROM appointments
    WHERE family_id = v_family_id
    AND appointment_type = 'preset';
    
    RAISE NOTICE 'Found % existing preset appointments', v_appointment_count;
    
    -- If no appointments exist, create them
    IF v_appointment_count = 0 THEN
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
        VALUES 
            (v_family_id, v_user_id, 'Booking Appointment', 'Initial midwife appointment with blood tests and screening discussions', 'preset', 8, v_due_date - INTERVAL '32 weeks', false, 'upcoming'),
            (v_family_id, v_user_id, '12-Week Dating Scan', 'Dating scan and Down''s syndrome screening', 'preset', 12, v_due_date - INTERVAL '28 weeks', false, 'upcoming'),
            (v_family_id, v_user_id, 'Midwife Check-up', 'Antenatal check and blood tests', 'preset', 15, v_due_date - INTERVAL '25 weeks', false, 'upcoming'),
            (v_family_id, v_user_id, '20-Week Anomaly Scan', 'Detailed scan to check baby''s development', 'preset', 20, v_due_date - INTERVAL '20 weeks', false, 'upcoming'),
            (v_family_id, v_user_id, 'Midwife Appointment', 'Antenatal checks and breastfeeding information', 'preset', 24, v_due_date - INTERVAL '16 weeks', false, 'upcoming'),
            (v_family_id, v_user_id, '28-Week Appointment', 'Blood tests, Anti-D if needed, glucose test', 'preset', 28, v_due_date - INTERVAL '12 weeks', false, 'upcoming'),
            (v_family_id, v_user_id, 'Midwife Check-up', 'Growth and position check', 'preset', 31, v_due_date - INTERVAL '9 weeks', false, 'upcoming'),
            (v_family_id, v_user_id, '34-Week Check', 'Birth plan discussion', 'preset', 34, v_due_date - INTERVAL '6 weeks', false, 'upcoming'),
            (v_family_id, v_user_id, '36-Week Appointment', 'Position check and birth preparation', 'preset', 36, v_due_date - INTERVAL '4 weeks', false, 'upcoming'),
            (v_family_id, v_user_id, '38-Week Check', 'Final preparations', 'preset', 38, v_due_date - INTERVAL '2 weeks', false, 'upcoming'),
            (v_family_id, v_user_id, 'Due Date Check', 'Discussion about prolonged pregnancy', 'preset', 40, v_due_date, false, 'upcoming'),
            (v_family_id, v_user_id, '41-Week Appointment', 'Membrane sweep offer and induction discussion', 'preset', 41, v_due_date + INTERVAL '1 week', false, 'upcoming');
        
        RAISE NOTICE 'Created 12 preset appointments';
    END IF;
END $$;

-- ========================================
-- STEP 6: Final verification
-- ========================================
SELECT 
    'Profile Info' as check_type,
    p.email,
    p.family_id::text as value,
    p.due_date::text as extra_info
FROM profiles p
WHERE p.email = 'alexgrwood@me.com'

UNION ALL

SELECT 
    'Appointment Count' as check_type,
    'alexgrwood@me.com' as email,
    COUNT(*)::text as value,
    STRING_AGG(DISTINCT appointment_type, ', ') as extra_info
FROM appointments a
WHERE a.family_id = (SELECT family_id FROM profiles WHERE email = 'alexgrwood@me.com')

UNION ALL

SELECT 
    'Preset Weeks' as check_type,
    'alexgrwood@me.com' as email,
    COUNT(DISTINCT preset_week)::text as value,
    STRING_AGG(DISTINCT preset_week::text, ', ' ORDER BY preset_week::text) as extra_info
FROM appointments a
WHERE a.family_id = (SELECT family_id FROM profiles WHERE email = 'alexgrwood@me.com')
AND a.appointment_type = 'preset';
