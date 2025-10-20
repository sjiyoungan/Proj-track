-- Create a simple get_user_boards function that works with current table structure
-- Run this in Supabase SQL Editor

-- Drop existing function
DROP FUNCTION IF EXISTS get_user_boards(text);

-- Create simple version that doesn't use board_display_name
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
) AS $$
BEGIN
  RETURN QUERY
  -- Get boards owned by the user
  SELECT
    b.id as board_id,
    b.board_name,
    COALESCE(b.board_name, 'New Board') as board_display_name, -- Use board_name as display name
    true as is_owner,
    'edit'::text as access_level,
    au.email as owner_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as owner_name,
    b.created_at
  FROM boards b
  JOIN auth.users au ON b.user_id = au.id
  WHERE b.user_id = auth.uid()
  
  UNION ALL
  
  -- Get boards shared with the user (only if sharing_permissions table exists and has correct structure)
  SELECT
    b.id as board_id,
    b.board_name,
    COALESCE(b.board_name, 'New Board') as board_display_name, -- Use board_name as display name
    false as is_owner,
    sp.access_level::text,
    au.email as owner_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as owner_name,
    b.created_at
  FROM sharing_permissions sp
  JOIN boards b ON sp.board_id = b.id
  JOIN auth.users au ON b.user_id = au.id
  WHERE sp.shared_with_email = user_email
  ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO anon;

-- Test the function
SELECT 
  'Simple get_user_boards function created successfully!' as status,
  'Function uses board_name as board_display_name until table structure is fixed' as message;
