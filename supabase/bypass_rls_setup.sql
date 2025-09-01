-- BYPASS RLS TO CREATE APPOINTMENTS
-- This creates a secure function that bypasses RLS to set up appointments

-- ========================================
-- Create a function that runs with elevated privileges
-- ========================================
CREATE OR REPLACE FUNCTION setup_user_appointments(user_email TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- This bypasses RLS
AS $$
DECLARE
    v_user_id UUID;
    v_family_id UUID;
    v_due_date DATE;
    v_count INTEGER;
BEGIN
    -- Get or create user profile data
    SELECT id, family_id, due_date 
    INTO v_user_id, v_family_id, v_due_date
    FROM profiles 
    WHERE email = user_email;
    
    -- User doesn't exist
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object(
            'success', false,
            'message', 'User not found: ' || user_email
        );
    END IF;
    
    -- Ensure family_id exists
    IF v_family_id IS NULL THEN
        v_family_id := uuid_generate_v4();
        UPDATE profiles 
        SET family_id = v_family_id
        WHERE id = v_user_id;
    END IF;
    
    -- Ensure due date exists
    IF v_due_date IS NULL THEN
        v_due_date := '2026-04-22'::date;
        UPDATE profiles 
        SET due_date = v_due_date
        WHERE id = v_user_id;
    END IF;
    
    -- Delete existing preset appointments to avoid duplicates
    DELETE FROM appointments
    WHERE family_id = v_family_id
    AND appointment_type = 'preset';
    
    -- Create all 12 NHS preset appointments
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
    
    -- Count created appointments
    SELECT COUNT(*) INTO v_count
    FROM appointments
    WHERE family_id = v_family_id
    AND appointment_type = 'preset';
    
    RETURN jsonb_build_object(
        'success', true,
        'message', 'Created ' || v_count || ' appointments',
        'user_id', v_user_id,
        'family_id', v_family_id,
        'due_date', v_due_date,
        'appointment_count', v_count
    );
END;
$$;

-- ========================================
-- Run the function for your logged-in user
-- ========================================
SELECT setup_user_appointments('jut_60_macro@icloud.com');

-- ========================================
-- Also run for your other email if needed
-- ========================================
-- SELECT setup_user_appointments('alexgrwood@me.com');

-- ========================================
-- Verify the appointments exist
-- ========================================
SELECT 
    p.email,
    COUNT(a.id) as appointment_count,
    STRING_AGG(a.title, ', ' ORDER BY a.preset_week) as appointments
FROM profiles p
LEFT JOIN appointments a ON p.family_id = a.family_id
WHERE p.email IN ('jut_60_macro@icloud.com', 'alexgrwood@me.com')
GROUP BY p.email;
