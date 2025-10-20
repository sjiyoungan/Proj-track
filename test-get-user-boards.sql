-- Test the get_user_boards function directly
-- Run this in Supabase SQL Editor

-- Step 1: Check if the function exists
SELECT 
  'Function exists check:' as status,
  routine_name,
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_boards';

-- Step 2: Check if there are any boards in the database
SELECT 
  'Boards count:' as status,
  COUNT(*) as total_boards
FROM boards;

-- Step 3: Show sample boards data
SELECT 
  'Sample boards:' as status,
  id,
  user_id,
  board_name,
  board_display_name,
  created_at
FROM boards
ORDER BY created_at DESC
LIMIT 5;

-- Step 4: Test the get_user_boards function with a real user email
-- Replace 'your-email@example.com' with your actual email
SELECT 
  'Testing get_user_boards function:' as status,
  *
FROM get_user_boards('your-email@example.com');

-- Step 5: Check current authenticated user
SELECT 
  'Current user check:' as status,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email;
