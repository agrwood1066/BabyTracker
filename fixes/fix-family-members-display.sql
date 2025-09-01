-- Fix for Family Members Display in Profile.js
-- Run this in Supabase SQL Editor to diagnose and fix the family members issue

-- 1. First, let's check the actual family setup
SELECT 
    p.email,
    p.full_name,
    p.family_id,
    p.subscription_status,
    p.due_date,
    p.created_at
FROM profiles p
WHERE p.family_id = '13fdf0c0-e36a-42ae-b0a2-10c901894673'
ORDER BY p.created_at;

-- Expected Result: Should show both alexgrwood@me.com and ellenarrowsmith@hotmail.co.uk

-- 2. Check if there are any records in family_members table
SELECT 
    fm.*,
    p1.email as member_email,
    p2.email as invited_by_email
FROM family_members fm
LEFT JOIN profiles p1 ON fm.user_id = p1.id
LEFT JOIN profiles p2 ON fm.invited_by = p2.id
WHERE fm.family_id = '13fdf0c0-e36a-42ae-b0a2-10c901894673';

-- 3. If family_members table is empty, we need to populate it
-- This ensures proper family relationships are tracked
DO $$
DECLARE
    v_alex_id UUID;
    v_ellen_id UUID;
    v_family_id UUID := '13fdf0c0-e36a-42ae-b0a2-10c901894673';
BEGIN
    -- Get user IDs
    SELECT id INTO v_alex_id FROM profiles WHERE email = 'alexgrwood@me.com';
    SELECT id INTO v_ellen_id FROM profiles WHERE email = 'ellenarrowsmith@hotmail.co.uk';
    
    RAISE NOTICE 'Alex ID: %', v_alex_id;
    RAISE NOTICE 'Ellen ID: %', v_ellen_id;
    
    -- Add Alex to family_members if not exists
    IF NOT EXISTS (
        SELECT 1 FROM family_members 
        WHERE user_id = v_alex_id 
        AND family_id = v_family_id
    ) THEN
        INSERT INTO family_members (
            family_id,
            user_id,
            relationship,
            can_edit,
            invited_by,
            joined_at
        ) VALUES (
            v_family_id,
            v_alex_id,
            'parent',
            true,
            NULL, -- Alex is the primary account
            '2025-06-01 20:08:05.072661+00' -- Use original creation date
        );
        RAISE NOTICE 'Added Alex to family_members table';
    ELSE
        RAISE NOTICE 'Alex already in family_members table';
    END IF;
    
    -- Add Ellen to family_members if not exists
    IF NOT EXISTS (
        SELECT 1 FROM family_members 
        WHERE user_id = v_ellen_id 
        AND family_id = v_family_id
    ) THEN
        INSERT INTO family_members (
            family_id,
            user_id,
            relationship,
            can_edit,
            invited_by,
            joined_at
        ) VALUES (
            v_family_id,
            v_ellen_id,
            'partner',
            true,
            v_alex_id, -- Invited by Alex
            '2025-06-04 22:11:19.092592+00' -- Use Ellen's original creation date
        );
        RAISE NOTICE 'Added Ellen to family_members table';
    ELSE
        RAISE NOTICE 'Ellen already in family_members table';
    END IF;
END $$;

-- 4. Verify the fix worked
SELECT 
    'After Fix - Profiles in same family:' as status
FROM profiles
WHERE family_id = '13fdf0c0-e36a-42ae-b0a2-10c901894673';

SELECT 
    p.email,
    p.full_name,
    fm.relationship,
    fm.can_edit,
    'Member since: ' || TO_CHAR(fm.joined_at, 'DD Mon YYYY') as member_since
FROM family_members fm
JOIN profiles p ON fm.user_id = p.id
WHERE fm.family_id = '13fdf0c0-e36a-42ae-b0a2-10c901894673'
ORDER BY fm.joined_at;

-- 5. Test the exact query that Profile.js uses
-- This simulates what the component is doing
WITH current_user AS (
    SELECT id, family_id 
    FROM profiles 
    WHERE email = 'alexgrwood@me.com'
)
SELECT 
    p.id,
    p.email,
    p.full_name,
    p.role,
    p.created_at
FROM profiles p
JOIN current_user cu ON p.family_id = cu.family_id
WHERE p.id != cu.id;

-- This should show Ellen in the results