-- Simplify board naming by removing board_display_name field
-- Run this in Supabase SQL Editor

-- 1. Drop the board_display_name column since we only need board_name
ALTER TABLE boards DROP COLUMN IF EXISTS board_display_name;

-- 2. Update the RPC function to only use board_name
DROP FUNCTION IF EXISTS get_user_boards(text);

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
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as board_id,
    COALESCE(b.board_name, 'New Board') as board_name,
    COALESCE(b.board_name, 'New Board') as board_display_name, -- Same as board_name
    true as is_owner,
    'edit'::text as access_level,
    COALESCE(b.owner_email, au.email) as owner_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as owner_name
  FROM boards b
  JOIN auth.users au ON b.user_id = au.id
  WHERE COALESCE(b.owner_email, au.email) = user_email;
END;
$$ LANGUAGE plpgsql;

-- 3. Grant permissions
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO anon;

-- 4. Update createBoard function to only use board_name
-- (This will be handled in the application code)

-- 5. Test the function
SELECT 
  'Function test' as test_type,
  COUNT(*) as boards_found
FROM get_user_boards(
  (SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1)
);

-- 6. Show current board structure
SELECT 
  id,
  board_name,
  owner_email,
  created_at
FROM boards
ORDER BY created_at DESC;
