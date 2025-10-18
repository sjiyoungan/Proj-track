-- Test the get_user_boards RPC function
-- Run this in Supabase SQL Editor to debug

-- 1. Check if the function exists
SELECT 
  routine_name, 
  routine_type, 
  data_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_boards';

-- 2. Test the function with a real user email
-- Replace 'your-email@example.com' with an actual email from your auth.users table
SELECT * FROM get_user_boards('your-email@example.com');

-- 3. Check what users exist
SELECT id, email FROM auth.users;

-- 4. Check what boards exist
SELECT 
  id,
  user_id,
  owner_email,
  board_name,
  board_display_name
FROM boards;

-- 5. Test the function with the first user's email
SELECT * FROM get_user_boards(
  (SELECT email FROM auth.users LIMIT 1)
);
