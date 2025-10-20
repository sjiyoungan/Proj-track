-- Create missing board for user
-- Run this in Supabase SQL Editor

-- Step 1: Check if user has any boards
SELECT 
  'Checking existing boards:' as status,
  COUNT(*) as board_count
FROM boards b
JOIN auth.users au ON b.user_id = au.id
WHERE au.email = 's.jiyoung.an@gmail.com';

-- Step 2: Create a board for the user if none exists
INSERT INTO boards (user_id, board_name, board_display_name)
SELECT 
  au.id,
  'My Board',
  'My Board'
FROM auth.users au
WHERE au.email = 's.jiyoung.an@gmail.com'
AND NOT EXISTS (
  SELECT 1 FROM boards b WHERE b.user_id = au.id
);

-- Step 3: Verify the board was created
SELECT 
  'Board created successfully:' as status,
  b.id as board_id,
  b.user_id,
  b.board_name,
  b.board_display_name,
  au.email as owner_email
FROM boards b
JOIN auth.users au ON b.user_id = au.id
WHERE au.email = 's.jiyoung.an@gmail.com';

-- Step 4: Test the get_user_boards function
SELECT 
  'Testing get_user_boards function:' as status,
  *
FROM get_user_boards('s.jiyoung.an@gmail.com');
