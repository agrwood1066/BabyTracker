-- CREATE SAFE USER DELETION FUNCTION
-- Run this in Supabase SQL Editor to create a reusable deletion function
-- This makes user deletion safer and easier for customer support

CREATE OR REPLACE FUNCTION safely_delete_user(user_uuid UUID)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deletion_summary jsonb := '{}';
    votes_deleted integer := 0;
    names_deleted integer := 0;
    hospital_items_deleted integer := 0;
    wishlist_items_deleted integer := 0;
    baby_items_deleted integer := 0;
    shares_deleted integer := 0;
    family_memberships_deleted integer := 0;
    profile_deleted integer := 0;
    user_exists boolean := false;
BEGIN
    -- Check if user exists
    SELECT EXISTS(SELECT 1 FROM profiles WHERE id = user_uuid) INTO user_exists;
    
    IF NOT user_exists THEN
        RETURN jsonb_build_object(
            'success', false,
            'error', 'User not found',
            'user_id', user_uuid
        );
    END IF;

    -- Log the deletion attempt
    RAISE NOTICE 'Starting safe deletion for user: %', user_uuid;

    -- Delete in correct order to respect foreign key constraints
    
    -- 1. Delete baby name votes
    DELETE FROM baby_name_votes WHERE user_id = user_uuid;
    GET DIAGNOSTICS votes_deleted = ROW_COUNT;
    
    -- 2. Delete baby names suggested by this user
    DELETE FROM baby_names WHERE suggested_by = user_uuid;
    GET DIAGNOSTICS names_deleted = ROW_COUNT;
    
    -- 3. Delete hospital bag items added by this user
    DELETE FROM hospital_bag_items WHERE added_by = user_uuid;
    GET DIAGNOSTICS hospital_items_deleted = ROW_COUNT;
    
    -- 4. Delete wishlist items added by this user
    DELETE FROM wishlist_items WHERE added_by = user_uuid;
    GET DIAGNOSTICS wishlist_items_deleted = ROW_COUNT;
    
    -- 5. Delete baby items (shopping list) added by this user
    DELETE FROM baby_items WHERE added_by = user_uuid;
    GET DIAGNOSTICS baby_items_deleted = ROW_COUNT;
    
    -- 6. Delete wishlist shares created by this user
    DELETE FROM wishlist_shares WHERE created_by = user_uuid;
    GET DIAGNOSTICS shares_deleted = ROW_COUNT;
    
    -- 7. Delete family member relationships
    DELETE FROM family_members WHERE user_id = user_uuid;
    GET DIAGNOSTICS family_memberships_deleted = ROW_COUNT;
    
    -- 8. Finally, delete the profile (this should cascade to auth.users)
    DELETE FROM profiles WHERE id = user_uuid;
    GET DIAGNOSTICS profile_deleted = ROW_COUNT;

    -- Build summary
    deletion_summary := jsonb_build_object(
        'success', true,
        'user_id', user_uuid,
        'deleted_at', now(),
        'items_deleted', jsonb_build_object(
            'baby_name_votes', votes_deleted,
            'baby_names', names_deleted,
            'hospital_bag_items', hospital_items_deleted,
            'wishlist_items', wishlist_items_deleted,
            'baby_items', baby_items_deleted,
            'wishlist_shares', shares_deleted,
            'family_memberships', family_memberships_deleted,
            'profile', profile_deleted
        ),
        'total_records_deleted', votes_deleted + names_deleted + hospital_items_deleted + 
                                wishlist_items_deleted + baby_items_deleted + shares_deleted + 
                                family_memberships_deleted + profile_deleted
    );

    -- Log successful deletion
    RAISE NOTICE 'User deletion completed successfully: %', deletion_summary;
    
    RETURN deletion_summary;

EXCEPTION WHEN OTHERS THEN
    -- Log error and return failure status
    RAISE NOTICE 'Error during user deletion: %', SQLERRM;
    
    RETURN jsonb_build_object(
        'success', false,
        'error', SQLERRM,
        'user_id', user_uuid,
        'attempted_at', now()
    );
END;
$$;

-- Create a function to find users by email (for customer support)
CREATE OR REPLACE FUNCTION find_user_by_email(user_email TEXT)
RETURNS TABLE(
    user_id UUID,
    full_name TEXT,
    email TEXT,
    due_date DATE,
    family_id UUID,
    created_at TIMESTAMP WITH TIME ZONE,
    family_member_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.full_name,
        p.email,
        p.due_date,
        p.family_id,
        p.created_at,
        (SELECT count(*) FROM profiles p2 WHERE p2.family_id = p.family_id) as family_member_count
    FROM profiles p
    WHERE p.email = user_email;
END;
$$;

-- Grant execute permissions to authenticated users (for customer support use)
GRANT EXECUTE ON FUNCTION safely_delete_user(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION find_user_by_email(TEXT) TO authenticated;

-- Example usage:
-- 
-- To find a user by email:
-- SELECT * FROM find_user_by_email('user@example.com');
--
-- To safely delete a user:
-- SELECT safely_delete_user('12345678-1234-1234-1234-123456789012');
--
-- The function returns a JSON summary of what was deleted:
-- {
--   "success": true,
--   "user_id": "12345678-1234-1234-1234-123456789012",
--   "deleted_at": "2025-01-15T10:30:00Z",
--   "total_records_deleted": 15,
--   "items_deleted": {
--     "baby_name_votes": 3,
--     "baby_names": 2,
--     "hospital_bag_items": 5,
--     "wishlist_items": 2,
--     "baby_items": 3,
--     "wishlist_shares": 0,
--     "family_memberships": 0,
--     "profile": 1
--   }
-- }
