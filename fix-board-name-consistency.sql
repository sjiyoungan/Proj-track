-- Fix board name consistency issues
-- Run this in Supabase SQL Editor

-- 1. Update the RPC function to use board_name instead of board_display_name
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
    COALESCE(b.board_name, 'New Board') as board_display_name, -- Use board_name for both
    true as is_owner,
    'edit'::text as access_level,
    COALESCE(b.owner_email, au.email) as owner_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as owner_name
  FROM boards b
  JOIN auth.users au ON b.user_id = au.id
  WHERE COALESCE(b.owner_email, au.email) = user_email;
END;
$$ LANGUAGE plpgsql;

-- 2. Grant permissions
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO anon;

-- 3. Sync board_display_name with board_name for existing boards
UPDATE boards 
SET board_display_name = board_name
WHERE board_display_name IS NULL OR board_display_name != board_name;

-- 4. Test the function
SELECT 
  'Function test' as test_type,
  COUNT(*) as boards_found
FROM get_user_boards(
  (SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1)
);

-- 5. Show current board names
SELECT 
  id,
  board_name,
  board_display_name,
  CASE 
    WHEN board_name = board_display_name THEN 'SYNCED'
    ELSE 'MISMATCH'
  END as sync_status
FROM boards
ORDER BY created_at DESC;
