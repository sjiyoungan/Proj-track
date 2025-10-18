-- Quick fix for boards issues
-- Run this in Supabase SQL Editor

-- 1. Fix null owner emails
UPDATE boards 
SET owner_email = au.email
FROM auth.users au
WHERE boards.user_id = au.id 
  AND boards.owner_email IS NULL;

-- 2. Fix null display names
UPDATE boards 
SET board_display_name = 'New Board'
WHERE board_display_name IS NULL;

-- 3. Fix null board names  
UPDATE boards 
SET board_name = 'New Board'
WHERE board_name IS NULL OR board_name = '';

-- 4. Create boards for users who don't have any
INSERT INTO boards (user_id, owner_email, board_display_name, board_name, projects, global_krs, filter_state)
SELECT 
  u.id,
  u.email,
  'New Board',
  'New Board',
  '[]'::jsonb,
  '[]'::jsonb,
  '{"showInitiative": true, "showKR": true, "showPlan": true, "showDone": true, "showFuture": true, "sortBy": "priority-asc"}'::jsonb
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM boards b WHERE b.user_id = u.id
);

-- 5. Create the RPC function
CREATE OR REPLACE FUNCTION get_user_boards(user_email text)
RETURNS TABLE (
  board_id uuid,
  board_name text,
  board_display_name text,
  is_owner boolean,
  access_level text,
  owner_email text,
  owner_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as board_id,
    b.board_name,
    b.board_display_name,
    true as is_owner,
    'edit'::text as access_level,
    b.owner_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as owner_name
  FROM boards b
  JOIN auth.users au ON b.user_id = au.id
  WHERE b.owner_email = user_email;
END;
$$ LANGUAGE plpgsql;

-- 6. Grant permissions
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO authenticated;

-- 7. Check results
SELECT 
  COUNT(*) as total_boards,
  COUNT(DISTINCT user_id) as distinct_users,
  COUNT(*) FILTER (WHERE owner_email IS NULL) as null_owner_emails
FROM boards;
