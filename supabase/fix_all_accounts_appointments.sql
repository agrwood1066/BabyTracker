-- COMPLETE FIX: Appointments for Multiple Accounts
-- This handles all three email addresses and ensures appointments work

-- ========================================
-- STEP 1: Check ALL your profiles
-- ========================================
SELECT 
    id, 
    email, 
    full_name, 
    family_id, 
    due_date,
    subscription_status
FROM profiles 
WHERE email IN ('jut_60_macro@icloud.com', 'alexgrwood@me.com', 'test@example.com')
ORDER BY email;

-- ========================================
-- STEP 2: Check existing appointments across all accounts
-- ========================================
SELECT 
    p.email,
    COUNT(a.id) as appointment_count,
    p.family_id,
    p.due_date
FROM profiles p
LEFT JOIN appointments a ON p.family_id = a.family_id
WHERE p.email IN ('jut_60_macro@icloud.com', 'alexgrwood@me.com', 'test@example.com')
GROUP BY p.email, p.family_id, p.due_date
ORDER BY p.email;

-- ========================================
-- STEP 3: Clean up ALL duplicate appointments
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
-- STEP 4: Fix for jut_60_macro@icloud.com (currently logged in)
-- ========================================
DO $$
DECLARE
    v_user_id UUID;
    v_family_id UUID;
    v_due_date DATE;
    v_appointment_count INTEGER;
BEGIN
    -- Get user details for the logged-in account
    SELECT id, family_id, due_date 
    INTO v_user_id, v_family_id, v_due_date
    FROM profiles 
    WHERE email = 'jut_60_macro@icloud.com';
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User jut_60_macro@icloud.com not found';
        RETURN;
    END IF;
    
    -- Ensure family_id exists
    IF v_family_id IS NULL THEN
        UPDATE profiles 
        SET family_id = uuid_generate_v4()
        WHERE id = v_user_id
        RETURNING family_id INTO v_family_id;
        RAISE NOTICE 'Created new family_id for jut_60_macro@icloud.com: %', v_family_id;
    END IF;
    
    -- Set due date if missing (using April 22, 2026 as default)
    IF v_due_date IS NULL THEN
        UPDATE profiles 
        SET due_date = '2026-04-22'::date
        WHERE id = v_user_id;
        v_due_date := '2026-04-22'::date;
        RAISE NOTICE 'Set due date to: %', v_due_date;
    END IF;
    
    -- Delete any existing preset appointments for this family
    DELETE FROM appointments
    WHERE family_id = v_family_id
    AND appointment_type = 'preset';
    
    -- Create fresh appointments
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
    
    RAISE NOTICE 'Created 12 preset appointments for jut_60_macro@icloud.com';
END $$;

-- ========================================
-- STEP 5: Also fix for alexgrwood@me.com if it exists
-- ========================================
DO $$
DECLARE
    v_user_id UUID;
    v_family_id UUID;
    v_due_date DATE;
BEGIN
    -- Get user details
    SELECT id, family_id, due_date 
    INTO v_user_id, v_family_id, v_due_date
    FROM profiles 
    WHERE email = 'alexgrwood@me.com';
    
    IF v_user_id IS NULL THEN
        RAISE NOTICE 'User alexgrwood@me.com not found - skipping';
        RETURN;
    END IF;
    
    -- Ensure family_id exists
    IF v_family_id IS NULL THEN
        UPDATE profiles 
        SET family_id = uuid_generate_v4()
        WHERE id = v_user_id
        RETURNING family_id INTO v_family_id;
    END IF;
    
    -- Set due date if missing
    IF v_due_date IS NULL THEN
        UPDATE profiles 
        SET due_date = '2026-04-22'::date
        WHERE id = v_user_id;
        v_due_date := '2026-04-22'::date;
    END IF;
    
    -- Delete existing and recreate
    DELETE FROM appointments
    WHERE family_id = v_family_id
    AND appointment_type = 'preset';
    
    -- Create appointments (same as above)
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
    
    RAISE NOTICE 'Created 12 preset appointments for alexgrwood@me.com';
END $$;

-- ========================================
-- STEP 6: Final verification - check all accounts
-- ========================================
SELECT 
    p.email,
    p.family_id,
    p.due_date,
    COUNT(a.id) as total_appointments,
    COUNT(DISTINCT a.preset_week) as unique_preset_weeks,
    STRING_AGG(DISTINCT a.appointment_type, ', ') as appointment_types
FROM profiles p
LEFT JOIN appointments a ON p.family_id = a.family_id
WHERE p.email IN ('jut_60_macro@icloud.com', 'alexgrwood@me.com', 'test@example.com')
GROUP BY p.email, p.family_id, p.due_date
ORDER BY p.email;

-- ========================================
-- STEP 7: Show appointments for currently logged in user
-- ========================================
SELECT 
    title,
    preset_week as week,
    appointment_date,
    description
FROM appointments 
WHERE family_id = (SELECT family_id FROM profiles WHERE email = 'jut_60_macro@icloud.com')
AND appointment_type = 'preset'
ORDER BY preset_week;
