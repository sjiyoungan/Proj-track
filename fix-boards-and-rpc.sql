-- Fix boards and RPC function for proper board management
-- This script addresses:
-- 1. Missing boards for users
-- 2. Null owner emails in boards
-- 3. Missing or broken get_user_boards RPC function

-- Step 1: Check current state
SELECT 
  'Current boards state' as step,
  COUNT(*) as total_boards,
  COUNT(DISTINCT user_id) as distinct_users,
  COUNT(*) FILTER (WHERE owner_email IS NULL) as null_owner_emails,
  COUNT(*) FILTER (WHERE board_display_name IS NULL) as null_display_names
FROM boards;

-- Step 2: Update null owner emails with user emails
UPDATE boards 
SET owner_email = au.email
FROM auth.users au
WHERE boards.user_id = au.id 
  AND boards.owner_email IS NULL;

-- Step 3: Update null display names to 'New Board'
UPDATE boards 
SET board_display_name = 'New Board'
WHERE board_display_name IS NULL;

-- Step 4: Update null board names to 'New Board'
UPDATE boards 
SET board_name = 'New Board'
WHERE board_name IS NULL OR board_name = '';

-- Step 5: Create boards for users who don't have any
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

-- Step 6: Create or replace the get_user_boards RPC function
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
  -- Get boards owned by the user
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
  WHERE b.owner_email = user_email

  UNION ALL

  -- Get boards shared with the user
  SELECT
    b.id as board_id,
    b.board_name,
    b.board_display_name,
    false as is_owner,
    sp.access_level::text,
    b.owner_email,
    COALESCE(au.raw_user_meta_data->>'full_name', au.email) as owner_name
  FROM sharing_permissions sp
  JOIN boards b ON sp.board_id = b.id
  JOIN auth.users au ON b.user_id = au.id
  WHERE sp.shared_with_email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Step 7: Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO authenticated;

-- Step 8: Verify the fixes
SELECT 
  'After fixes' as step,
  COUNT(*) as total_boards,
  COUNT(DISTINCT user_id) as distinct_users,
  COUNT(*) FILTER (WHERE owner_email IS NULL) as null_owner_emails,
  COUNT(*) FILTER (WHERE board_display_name IS NULL) as null_display_names
FROM boards;

-- Step 9: Test the RPC function with a sample user
-- (Replace 'your-email@example.com' with an actual user email from your auth.users table)
SELECT 
  'RPC function test' as step,
  COUNT(*) as boards_returned
FROM get_user_boards((SELECT email FROM auth.users LIMIT 1));

-- Step 10: Show all boards with their details
SELECT 
  b.id,
  b.user_id,
  b.owner_email,
  b.board_name,
  b.board_display_name,
  au.email as auth_user_email,
  CASE 
    WHEN b.owner_email = au.email THEN 'MATCH'
    ELSE 'MISMATCH'
  END as email_match_status
FROM boards b
JOIN auth.users au ON b.user_id = au.id
ORDER BY b.created_at;
