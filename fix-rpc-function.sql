-- Fix the get_user_boards RPC function
-- Run this in Supabase SQL Editor

-- 1. Drop the existing function if it exists
DROP FUNCTION IF EXISTS get_user_boards(text);

-- 2. Create the corrected function
CREATE OR REPLACE FUNCTION get_user_boards(user_email text)
RETURNS TABLE (
  board_id uuid,
  board_name text,
  board_display_name text,
  is_owner boolean,
  access_level text,
  owner_email text,
  owner_name text
) 
SECURITY DEFINER -- This ensures the function runs with the privileges of the function owner
AS $$
BEGIN
  -- Return boards owned by the user
  RETURN QUERY
  SELECT
    b.id as board_id,
    COALESCE(b.board_name, 'New Board') as board_name,
    COALESCE(b.board_display_name, 'New Board') as board_display_name,
    true as is_owner,
    'edit'::text as access_level,
    COALESCE(b.owner_email, au.email) as owner_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as owner_name
  FROM boards b
  JOIN auth.users au ON b.user_id = au.id
  WHERE COALESCE(b.owner_email, au.email) = user_email;
END;
$$ LANGUAGE plpgsql;

-- 3. Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO authenticated;

-- 4. Grant execute permission to anon users (if needed)
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO anon;

-- 5. Test the function
SELECT 
  'Function test' as test_type,
  COUNT(*) as boards_found
FROM get_user_boards(
  (SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1)
);

-- 6. Show all boards that should be returned for the most recent user
SELECT 
  'Expected results' as test_type,
  b.id as board_id,
  COALESCE(b.board_name, 'New Board') as board_name,
  COALESCE(b.board_display_name, 'New Board') as board_display_name,
  true as is_owner,
  'edit' as access_level,
  COALESCE(b.owner_email, au.email) as owner_email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.email) as owner_name
FROM boards b
JOIN auth.users au ON b.user_id = au.id
WHERE COALESCE(b.owner_email, au.email) = (
  SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1
);