-- Fix RPC function and create proper boards
-- Run this in Supabase SQL Editor

-- Step 1: Check current state
SELECT 
  'Current state check:' as status,
  'boards count:' as type,
  COUNT(*) as count
FROM boards
UNION ALL
SELECT 
  'Current state check:' as status,
  'users count:' as type,
  COUNT(*) as count
FROM auth.users;

-- Step 2: Check if get_user_boards function exists and works
SELECT 
  'Function check:' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_boards';

-- Step 3: Test the function directly (replace with your email)
-- This will show us the exact error
SELECT 
  'Testing function:' as status,
  *
FROM get_user_boards('s.jiyoung.an@gmail.com');

-- Step 4: Check what boards exist for your user
SELECT 
  'Your boards:' as status,
  b.id,
  b.user_id,
  b.board_name,
  b.board_display_name,
  au.email as owner_email
FROM boards b
JOIN auth.users au ON b.user_id = au.id
WHERE au.email = 's.jiyoung.an@gmail.com';

-- Step 5: If no boards exist, create one
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

-- Step 6: Verify the board was created
SELECT 
  'Created board:' as status,
  b.id,
  b.user_id,
  b.board_name,
  b.board_display_name,
  au.email as owner_email
FROM boards b
JOIN auth.users au ON b.user_id = au.id
WHERE au.email = 's.jiyoung.an@gmail.com';

-- Step 7: Test the function again
SELECT 
  'Function test after fix:' as status,
  *
FROM get_user_boards('s.jiyoung.an@gmail.com');
