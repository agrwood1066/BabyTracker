-- CRITICAL FIX: Restore access when auth.uid() returns no rows

-- Step 1: First, check what policies currently exist
SELECT policyname, qual 
FROM pg_policies 
WHERE tablename = 'profiles';

-- Step 2: Drop ALL policies to start fresh
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view family member profiles" ON profiles;
DROP POLICY IF EXISTS "View family members simple" ON profiles;
DROP POLICY IF EXISTS "Users can view profiles in same family" ON profiles;

-- Step 3: Check if you can see your profile without any policies (RLS still enabled)
-- This will likely return 0 rows, but let's confirm
SELECT * FROM profiles WHERE email = 'alexgrwood@me.com';

-- Step 4: TEMPORARILY disable RLS to restore access
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Step 5: Verify you can now see your profile
SELECT * FROM profiles WHERE email = 'alexgrwood@me.com';

-- Step 6: Re-enable RLS with a VERY simple policy
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Create the most basic policy possible
CREATE POLICY "Public profiles read" ON profiles
FOR SELECT
USING (true);  -- This allows ALL users to read ALL profiles temporarily

-- Step 8: Test access
SELECT * FROM profiles WHERE email = 'alexgrwood@me.com';

-- Step 9: If step 8 works, replace with proper policy
DROP POLICY IF EXISTS "Public profiles read" ON profiles;

-- Create proper policies
CREATE POLICY "Users can view own profile" ON profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can view family profiles" ON profiles
FOR SELECT  
USING (
    family_id IS NOT NULL 
    AND family_id IN (
        SELECT family_id FROM profiles WHERE id = auth.uid()
    )
);