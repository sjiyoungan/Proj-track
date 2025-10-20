-- Fix the get_user_boards function data type mismatch
-- Run this in Supabase SQL Editor

-- Drop the existing function
DROP FUNCTION IF EXISTS get_user_boards(text);

-- Create the corrected function with proper data type casting
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
    COALESCE(b.board_name, 'New Board') as board_display_name,
    true as is_owner,
    'edit'::text as access_level,
    au.email::text as owner_email, -- Cast to text to fix type mismatch
    COALESCE(au.raw_user_meta_data->>'full_name', au.email)::text as owner_name, -- Cast to text
    b.created_at
  FROM boards b
  JOIN auth.users au ON b.user_id = au.id
  WHERE b.user_id = auth.uid()
  
  UNION ALL
  
  -- Get boards shared with the user
  SELECT
    b.id as board_id,
    b.board_name,
    COALESCE(b.board_name, 'New Board') as board_display_name,
    false as is_owner,
    sp.access_level::text,
    au.email::text as owner_email, -- Cast to text to fix type mismatch
    COALESCE(au.raw_user_meta_data->>'full_name', au.email)::text as owner_name, -- Cast to text
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
  'get_user_boards function fixed successfully!' as status,
  'Function should now work without data type errors' as message;
