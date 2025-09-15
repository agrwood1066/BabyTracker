-- CHECK EXISTING DATA FOR TEST USER
-- Run this to see what data exists for test@example.com

-- Find the test user
SELECT 
  'USER LOOKUP' as type,
  id as user_id,
  email,
  created_at
FROM auth.users 
WHERE email = 'test@example.com';

-- Check if profile exists
SELECT 
  'PROFILE CHECK' as type,
  id,
  email,
  family_id,
  subscription_status,
  created_at
FROM profiles 
WHERE email = 'test@example.com';

-- Check for any existing data (disable RLS temporarily)
ALTER TABLE baby_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE baby_names DISABLE ROW LEVEL SECURITY;

-- Get the family_id for test user
DO $$
DECLARE
  test_family_id UUID;
BEGIN
  SELECT family_id INTO test_family_id 
  FROM profiles 
  WHERE email = 'test@example.com' 
  LIMIT 1;
  
  IF test_family_id IS NOT NULL THEN
    RAISE NOTICE 'Test user family_id: %', test_family_id;
    
    -- Check for existing data
    RAISE NOTICE 'Baby items: %', (
      SELECT COUNT(*) FROM baby_items WHERE family_id = test_family_id
    );
    
    RAISE NOTICE 'Budget categories: %', (
      SELECT COUNT(*) FROM budget_categories WHERE family_id = test_family_id
    );
    
    RAISE NOTICE 'Baby names: %', (
      SELECT COUNT(*) FROM baby_names WHERE family_id = test_family_id
    );
  ELSE
    RAISE NOTICE 'No profile found for test user';
  END IF;
END $$;

-- Re-enable RLS
ALTER TABLE baby_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE baby_names ENABLE ROW LEVEL SECURITY;

-- Show any existing data for test user
SELECT 
  'DATA SUMMARY' as type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM profiles WHERE email = 'test@example.com')
    THEN 'Profile exists'
    ELSE 'No profile found'
  END as profile_status;
