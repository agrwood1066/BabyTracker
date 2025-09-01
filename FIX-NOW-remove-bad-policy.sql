-- FIX: Remove the problematic policy and keep it simple

-- Step 1: Drop the problematic policy that broke access
DROP POLICY IF EXISTS "Users can view family member profiles" ON profiles;

-- Step 2: Your access should now be restored (since step 1's policy is still there)
-- Test that you can access your profile again:
SELECT * FROM profiles WHERE id = auth.uid();

-- Step 3: Add a SIMPLER family viewing policy that won't break access
-- This one directly checks family_id without complex subqueries
CREATE POLICY "View family members simple" ON profiles 
FOR SELECT 
USING (
    family_id IN (
        SELECT family_id 
        FROM profiles 
        WHERE id = auth.uid()
    )
);

-- Step 4: Test that everything works
-- This should show your profile:
SELECT * FROM profiles WHERE id = auth.uid();

-- This should show both you and Ellen:
SELECT email, full_name, family_id 
FROM profiles 
WHERE family_id = '13fdf0c0-e36a-42ae-b0a2-10c901894673';

-- Step 5: Verify all policies on profiles table
SELECT policyname, qual 
FROM pg_policies 
WHERE tablename = 'profiles';