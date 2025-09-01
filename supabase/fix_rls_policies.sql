-- CHECK AND FIX RLS POLICIES
-- This ensures the Row Level Security policies are correctly set up

-- ========================================
-- STEP 1: Check current RLS policies on appointments table
-- ========================================
SELECT 
    schemaname, 
    tablename, 
    policyname, 
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'appointments'
ORDER BY policyname;

-- ========================================
-- STEP 2: Drop all existing policies (if any issues)
-- ========================================
DROP POLICY IF EXISTS "Users can view family appointments" ON appointments;
DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
DROP POLICY IF EXISTS "Users can update family appointments" ON appointments;
DROP POLICY IF EXISTS "Users can delete family appointments" ON appointments;
DROP POLICY IF EXISTS "Family members can view shared appointments" ON appointments;
DROP POLICY IF EXISTS "Family members can create appointments" ON appointments;
DROP POLICY IF EXISTS "Family members can update shared appointments" ON appointments;
DROP POLICY IF EXISTS "Family members can delete shared appointments" ON appointments;

-- ========================================
-- STEP 3: Create correct RLS policies
-- ========================================

-- Policy for SELECT (viewing appointments)
CREATE POLICY "Users can view their family appointments" 
ON appointments FOR SELECT 
USING (
    family_id IN (
        SELECT family_id 
        FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.family_id IS NOT NULL
    )
);

-- Policy for INSERT (creating appointments)
CREATE POLICY "Users can create appointments for their family" 
ON appointments FOR INSERT 
WITH CHECK (
    family_id IN (
        SELECT family_id 
        FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.family_id IS NOT NULL
    )
    AND created_by = auth.uid()
);

-- Policy for UPDATE (modifying appointments)
CREATE POLICY "Users can update their family appointments" 
ON appointments FOR UPDATE 
USING (
    family_id IN (
        SELECT family_id 
        FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.family_id IS NOT NULL
    )
)
WITH CHECK (
    family_id IN (
        SELECT family_id 
        FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.family_id IS NOT NULL
    )
);

-- Policy for DELETE (removing appointments)
CREATE POLICY "Users can delete their family appointments" 
ON appointments FOR DELETE 
USING (
    family_id IN (
        SELECT family_id 
        FROM profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.family_id IS NOT NULL
    )
);

-- ========================================
-- STEP 4: Verify RLS is enabled
-- ========================================
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'appointments';

-- If RLS is not enabled, enable it:
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- ========================================
-- STEP 5: Test the policies with current user
-- ========================================
-- This simulates what the app is trying to do
-- Replace the UUID with the actual user ID from the profiles query

-- First, get the user details
SELECT 
    id as user_id,
    email,
    family_id
FROM profiles 
WHERE email = 'jut_60_macro@icloud.com';

-- Note the user_id and family_id from above, then test:
-- (You'll need to manually replace the UUIDs in the test below)

/*
-- Test SELECT policy (uncomment and run with actual IDs)
SET LOCAL ROLE authenticated;
SET LOCAL request.jwt.claim.sub = 'USER_ID_HERE';

SELECT COUNT(*) 
FROM appointments 
WHERE family_id = 'FAMILY_ID_HERE';

RESET ROLE;
*/

-- ========================================
-- STEP 6: Ensure all users have family_id
-- ========================================
UPDATE profiles 
SET family_id = COALESCE(family_id, uuid_generate_v4())
WHERE family_id IS NULL;

-- Make family_id required
ALTER TABLE profiles 
ALTER COLUMN family_id SET NOT NULL;
