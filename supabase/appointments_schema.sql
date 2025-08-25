-- Appointments Feature Schema
-- Run this after the main schema.sql

-- Add timezone to profiles if not exists
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/London';

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    created_by UUID NOT NULL REFERENCES profiles(id),
    
    -- Appointment details
    title TEXT NOT NULL,
    description TEXT,
    appointment_type TEXT CHECK (appointment_type IN ('preset', 'custom')) DEFAULT 'custom',
    preset_week INTEGER, -- For preset appointments (e.g., 12 for 12-week scan)
    
    -- Date and time
    appointment_date DATE,
    appointment_time TIME,
    is_scheduled BOOLEAN DEFAULT false, -- Distinguishes between preset templates and user-scheduled
    
    -- Location and contact
    location TEXT,
    healthcare_provider TEXT,
    notes TEXT,
    
    -- Reminder settings
    reminder_enabled BOOLEAN DEFAULT true,
    reminder_days_before INTEGER DEFAULT 1,
    
    -- Recurrence
    recurrence_pattern JSONB,
    recurrence_parent_id UUID REFERENCES appointments(id),
    
    -- Status
    status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'completed', 'cancelled', 'rescheduled')),
    
    -- Metadata
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create flexible health metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    family_id UUID NOT NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    recorded_by UUID NOT NULL REFERENCES profiles(id),
    
    -- Flexible metric storage
    metric_type TEXT NOT NULL, -- 'weight', 'blood_pressure', 'fundal_height', etc.
    reading TEXT NOT NULL, -- The actual value as text
    unit TEXT, -- kg, mmHg, cm, etc. (user-entered)
    
    -- General notes
    notes TEXT,
    
    -- Metadata
    recorded_date DATE NOT NULL,
    recorded_time TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- User metric preferences (which metrics to show/track)
CREATE TABLE IF NOT EXISTS user_metric_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id),
    metric_type TEXT NOT NULL,
    display_name TEXT NOT NULL,
    default_unit TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, metric_type)
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_metric_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for appointments
CREATE POLICY "Users can view family appointments" ON appointments 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = appointments.family_id)
    );

CREATE POLICY "Users can create appointments" ON appointments 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = appointments.family_id)
    );

CREATE POLICY "Users can update family appointments" ON appointments 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = appointments.family_id)
    );

CREATE POLICY "Users can delete family appointments" ON appointments 
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = appointments.family_id)
    );

-- RLS Policies for health_metrics
CREATE POLICY "Users can view family health metrics" ON health_metrics 
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = health_metrics.family_id)
    );

CREATE POLICY "Users can create health metrics" ON health_metrics 
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = health_metrics.family_id)
    );

CREATE POLICY "Users can update family health metrics" ON health_metrics 
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.family_id = health_metrics.family_id)
    );

-- RLS Policies for user_metric_preferences
CREATE POLICY "Users can view own preferences" ON user_metric_preferences 
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own preferences" ON user_metric_preferences 
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_metric_preferences 
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_metric_preferences 
    FOR DELETE USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_appointments_updated_at 
    BEFORE UPDATE ON appointments 
    FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert default metric preferences for new users
CREATE OR REPLACE FUNCTION create_default_metric_preferences()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_metric_preferences (user_id, metric_type, display_name, default_unit, display_order)
    VALUES 
        (NEW.id, 'weight', 'Weight', 'kg', 1),
        (NEW.id, 'blood_pressure', 'Blood Pressure', 'mmHg', 2),
        (NEW.id, 'fundal_height', 'Fundal Height', 'cm', 3),
        (NEW.id, 'baby_heartrate', 'Baby''s Heartrate', 'bpm', 4),
        (NEW.id, 'glucose_level', 'Glucose Level', 'mmol/L', 5)
    ON CONFLICT (user_id, metric_type) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_profile_created_metrics
    AFTER INSERT ON profiles
    FOR EACH ROW EXECUTE PROCEDURE create_default_metric_preferences();
