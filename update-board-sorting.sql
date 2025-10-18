-- Update get_user_boards function to include created_at and sort by creation order
DROP FUNCTION IF EXISTS get_user_boards(text);

CREATE OR REPLACE FUNCTION get_user_boards(user_email text)
RETURNS TABLE (
  board_id uuid,
  board_name text,
  board_display_name text,
  is_owner boolean,
  access_level text,
  owner_email text,
  owner_name text,
  created_at timestamp with time zone
) 
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as board_id,
    b.board_name,
    b.board_name as board_display_name, -- Use board_name as display name
    true as is_owner,
    'edit'::text as access_level,
    au.email as owner_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as owner_name,
    b.created_at
  FROM boards b
  JOIN auth.users au ON b.user_id = au.id
  WHERE COALESCE(b.owner_email, au.email) = user_email
  
  UNION ALL
  
  SELECT
    b.id as board_id,
    b.board_name,
    b.board_name as board_display_name, -- Use board_name as display name
    false as is_owner,
    sp.access_level::text,
    au.email as owner_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as owner_name,
    b.created_at
  FROM sharing_permissions sp
  JOIN boards b ON sp.board_id = b.id
  JOIN auth.users au ON b.user_id = au.id
  WHERE sp.shared_with_email = user_email
  
  ORDER BY created_at ASC; -- Sort by creation order (oldest first)
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO anon;

-- Test the function
SELECT 
  'Function test' as test_type,
  COUNT(*) as boards_found,
  MIN(created_at) as oldest_board,
  MAX(created_at) as newest_board
FROM get_user_boards(
  (SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1)
);
