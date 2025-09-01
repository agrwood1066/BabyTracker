-- EMERGENCY FIX: Restore access to profiles table
-- This will fix the broken RLS policy that's preventing data access

-- Step 1: Drop the problematic policy that's causing issues
DROP POLICY IF EXISTS "Users can view profiles in same family" ON profiles;

-- Step 2: Restore the original working policy first to regain access
CREATE POLICY "Users can view own profile" ON profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Step 3: Add an additional policy for family members (keeping both separate)
CREATE POLICY "Users can view family member profiles" ON profiles 
FOR SELECT 
USING (
    EXISTS (
        SELECT 1 
        FROM profiles p 
        WHERE p.id = auth.uid() 
        AND p.family_id = profiles.family_id
        AND profiles.family_id IS NOT NULL
    )
);

-- Step 4: Verify you can access your own profile
SELECT * FROM profiles WHERE id = auth.uid();

-- Step 5: Test that you can see family members
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.family_id
FROM profiles p
WHERE p.family_id = (
    SELECT family_id 
    FROM profiles 
    WHERE id = auth.uid()
);

-- If the above doesn't work, use this nuclear option to temporarily disable RLS
-- ONLY use this if absolutely necessary, then re-enable with proper policies
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- To re-enable after fixing:
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;