-- Comprehensive test for get_user_boards RPC function
-- Run this in Supabase SQL Editor

-- 1. Check if function exists and its definition
SELECT 
  routine_name, 
  routine_type, 
  data_type,
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'get_user_boards';

-- 2. Check what users exist
SELECT 
  id, 
  email,
  created_at
FROM auth.users 
ORDER BY created_at DESC;

-- 3. Check what boards exist
SELECT 
  id,
  user_id,
  owner_email,
  board_name,
  board_display_name,
  created_at
FROM boards 
ORDER BY created_at DESC;

-- 4. Test the function with each user's email
-- Replace 'your-actual-email@example.com' with your real email
SELECT 
  'Testing with your email' as test_type,
  * 
FROM get_user_boards('your-actual-email@example.com');

-- 5. Test with the most recent user's email
SELECT 
  'Testing with most recent user' as test_type,
  * 
FROM get_user_boards(
  (SELECT email FROM auth.users ORDER BY created_at DESC LIMIT 1)
);

-- 6. Check if there are any permission issues
SELECT 
  grantee,
  privilege_type,
  is_grantable
FROM information_schema.role_table_grants 
WHERE table_name = 'boards';

-- 7. Check RLS policies on boards table
SELECT 
  polname,
  permissive,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'boards';
