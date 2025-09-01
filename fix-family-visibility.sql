-- Fix for family member visibility issue
-- Problem: Users cannot see other family members due to restrictive RLS policy

-- Step 1: Check current profiles and their family connections
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.family_id,
    p.role
FROM profiles p
WHERE p.email IN ('alexgrwood@me.com', 'ellenarrowsmith@hotmail.co.uk')
ORDER BY p.email;

-- Step 2: Check if there are entries in family_members table
SELECT 
    fm.*,
    p.email as user_email
FROM family_members fm
LEFT JOIN profiles p ON p.id = fm.user_id
WHERE fm.family_id = '13fdf0c0-e36a-42ae-b0a2-10c901894673';

-- Step 3: Fix the RLS policy for profiles table
-- Drop the existing restrictive policy
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create a new policy that allows viewing profiles in the same family
CREATE POLICY "Users can view profiles in same family" ON profiles 
FOR SELECT 
USING (
    auth.uid() = id 
    OR 
    family_id IN (
        SELECT family_id 
        FROM profiles 
        WHERE id = auth.uid()
    )
);

-- Step 4: Ensure both users have entries in family_members table (if needed)
-- Only run if the family_members table is empty for this family
INSERT INTO family_members (family_id, user_id, relationship, can_edit, invited_by, joined_at)
VALUES 
    ('13fdf0c0-e36a-42ae-b0a2-10c901894673', '064c7668-34eb-43b9-bc42-c644f81d33d9', 'parent', true, null, NOW()),
    ('13fdf0c0-e36a-42ae-b0a2-10c901894673', '0331082d-f929-4de0-bb79-57e4f9750298', 'partner', true, '064c7668-34eb-43b9-bc42-c644f81d33d9', NOW())
ON CONFLICT (family_id, user_id) DO NOTHING;

-- Step 5: Verify the fix
-- This should now show both family members
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.family_id,
    p.role,
    fm.relationship
FROM profiles p
LEFT JOIN family_members fm ON fm.user_id = p.id
WHERE p.family_id = '13fdf0c0-e36a-42ae-b0a2-10c901894673'
ORDER BY p.email;

-- Step 6: Additional policy fixes for better family sharing
-- Ensure family_members table policies allow viewing within same family
DROP POLICY IF EXISTS "Users can view family members" ON family_members;

CREATE POLICY "Users can view family members" ON family_members 
FOR SELECT 
USING (
    family_id IN (
        SELECT family_id 
        FROM profiles 
        WHERE id = auth.uid()
    )
);

-- Note: After running this script, the family members should be visible to each other in the app