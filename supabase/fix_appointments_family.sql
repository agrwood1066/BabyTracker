-- Fix Appointments & Family Sharing
-- This script ensures all users have a family_id and fixes appointment creation

-- 1. First, ensure all existing profiles have a family_id
UPDATE profiles 
SET family_id = uuid_generate_v4() 
WHERE family_id IS NULL;

-- 2. Make family_id NOT NULL to prevent future issues
ALTER TABLE profiles 
ALTER COLUMN family_id SET NOT NULL;

-- 3. Create a function to ensure family_id is always set on profile creation
CREATE OR REPLACE FUNCTION ensure_family_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.family_id IS NULL THEN
        NEW.family_id := uuid_generate_v4();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to ensure family_id is always set
DROP TRIGGER IF EXISTS ensure_family_id_trigger ON profiles;
CREATE TRIGGER ensure_family_id_trigger
    BEFORE INSERT OR UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION ensure_family_id();

-- 5. Check if appointments table exists and has correct structure
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'appointments') THEN
        RAISE NOTICE 'Appointments table does not exist. Please run appointments_schema.sql first.';
    END IF;
END $$;

-- 6. Verify RLS policies are correct for family sharing
-- These policies allow all family members to manage shared appointments

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view family appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update family appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete family appointments" ON appointments;

-- Recreate with explicit family sharing support
CREATE POLICY "Family members can view shared appointments" 
ON appointments FOR SELECT 
USING (
    family_id IN (
        SELECT family_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Family members can create appointments" 
ON appointments FOR INSERT 
WITH CHECK (
    family_id IN (
        SELECT family_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Family members can update shared appointments" 
ON appointments FOR UPDATE 
USING (
    family_id IN (
        SELECT family_id FROM profiles WHERE id = auth.uid()
    )
);

CREATE POLICY "Family members can delete shared appointments" 
ON appointments FOR DELETE 
USING (
    family_id IN (
        SELECT family_id FROM profiles WHERE id = auth.uid()
    )
);

-- 7. Create a helper function to manually create preset appointments if needed
CREATE OR REPLACE FUNCTION create_preset_appointments_for_user(user_email TEXT, due_date DATE)
RETURNS JSONB AS $$
DECLARE
    v_user_id UUID;
    v_family_id UUID;
    v_result JSONB;
BEGIN
    -- Get user and family_id
    SELECT id, family_id INTO v_user_id, v_family_id
    FROM profiles
    WHERE email = user_email;
    
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('error', 'User not found');
    END IF;
    
    IF v_family_id IS NULL THEN
        -- Create family_id if missing
        UPDATE profiles 
        SET family_id = uuid_generate_v4()
        WHERE id = v_user_id
        RETURNING family_id INTO v_family_id;
    END IF;
    
    -- Delete any existing preset appointments to avoid duplicates
    DELETE FROM appointments 
    WHERE family_id = v_family_id 
    AND appointment_type = 'preset';
    
    -- Insert all preset appointments
    INSERT INTO appointments (family_id, created_by, title, description, appointment_type, preset_week, appointment_date, is_scheduled, status)
    VALUES 
        (v_family_id, v_user_id, 'Booking Appointment', 'Initial midwife appointment with blood tests and screening discussions', 'preset', 8, due_date - INTERVAL '32 weeks', false, 'upcoming'),
        (v_family_id, v_user_id, '12-Week Dating Scan', 'Dating scan and Down''s syndrome screening', 'preset', 12, due_date - INTERVAL '28 weeks', false, 'upcoming'),
        (v_family_id, v_user_id, 'Midwife Check-up', 'Antenatal check and blood tests', 'preset', 15, due_date - INTERVAL '25 weeks', false, 'upcoming'),
        (v_family_id, v_user_id, '20-Week Anomaly Scan', 'Detailed scan to check baby''s development', 'preset', 20, due_date - INTERVAL '20 weeks', false, 'upcoming'),
        (v_family_id, v_user_id, 'Midwife Appointment', 'Antenatal checks and breastfeeding information', 'preset', 24, due_date - INTERVAL '16 weeks', false, 'upcoming'),
        (v_family_id, v_user_id, '28-Week Appointment', 'Blood tests, Anti-D if needed, glucose test', 'preset', 28, due_date - INTERVAL '12 weeks', false, 'upcoming'),
        (v_family_id, v_user_id, 'Midwife Check-up', 'Growth and position check', 'preset', 31, due_date - INTERVAL '9 weeks', false, 'upcoming'),
        (v_family_id, v_user_id, '34-Week Check', 'Birth plan discussion', 'preset', 34, due_date - INTERVAL '6 weeks', false, 'upcoming'),
        (v_family_id, v_user_id, '36-Week Appointment', 'Position check and birth preparation', 'preset', 36, due_date - INTERVAL '4 weeks', false, 'upcoming'),
        (v_family_id, v_user_id, '38-Week Check', 'Final preparations', 'preset', 38, due_date - INTERVAL '2 weeks', false, 'upcoming'),
        (v_family_id, v_user_id, 'Due Date Check', 'Discussion about prolonged pregnancy', 'preset', 40, due_date, false, 'upcoming'),
        (v_family_id, v_user_id, '41-Week Appointment', 'Membrane sweep offer and induction discussion', 'preset', 41, due_date + INTERVAL '1 week', false, 'upcoming');
    
    RETURN jsonb_build_object(
        'success', true, 
        'message', '12 preset appointments created',
        'family_id', v_family_id,
        'user_id', v_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Test query to check current status
SELECT 
    p.email, 
    p.full_name, 
    p.family_id,
    p.due_date,
    COUNT(a.id) as appointment_count
FROM profiles p
LEFT JOIN appointments a ON p.family_id = a.family_id
WHERE p.email = 'test@example.com'
GROUP BY p.email, p.full_name, p.family_id, p.due_date;

-- 9. If you need to manually create preset appointments for your test user:
-- SELECT create_preset_appointments_for_user('test@example.com', '2026-04-22'::date);
