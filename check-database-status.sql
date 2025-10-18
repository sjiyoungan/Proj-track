-- Quick check to see if the database is properly set up
-- Run this in Supabase SQL Editor first

-- 1. Check if boards table exists and has the right structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'boards'
ORDER BY ordinal_position;

-- 2. Check if get_user_boards function exists
SELECT 
  routine_name, 
  routine_type
FROM information_schema.routines 
WHERE routine_name = 'get_user_boards';

-- 3. Check what data exists in boards table
SELECT 
  id,
  user_id,
  owner_email,
  board_name,
  created_at
FROM boards
ORDER BY created_at DESC
LIMIT 5;

-- 4. Test the get_user_boards function
SELECT * FROM get_user_boards(
  (SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1)
);
