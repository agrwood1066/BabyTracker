-- ALTERNATIVE FIX: Simple and safe approach
-- Run this if the emergency fix doesn't work

-- Option 1: Simplest fix - just restore original policy
DROP POLICY IF EXISTS "Users can view profiles in same family" ON profiles;
DROP POLICY IF EXISTS "Users can view family member profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;

-- Create a single, simple policy that definitely works
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Then add family viewing as a separate, simple policy
CREATE POLICY "Users can view same family profiles" ON profiles 
FOR SELECT 
USING (
    family_id = (SELECT family_id FROM profiles WHERE id = auth.uid() LIMIT 1)
    AND family_id IS NOT NULL
);

-- Test query - this should return your profile
SELECT * FROM profiles WHERE email = 'alexgrwood@me.com';

-- If still broken, check what policies exist:
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'profiles';