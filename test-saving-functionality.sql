-- Test if saving is working properly
-- Run this in Supabase SQL Editor

-- Step 1: Check if boards exist for your user
SELECT 
  'Your boards:' as status,
  b.id as board_id,
  b.user_id,
  b.board_name,
  b.board_display_name,
  b.updated_at,
  au.email as owner_email
FROM boards b
JOIN auth.users au ON b.user_id = au.id
WHERE au.email = 's.jiyoung.an@gmail.com'
ORDER BY b.updated_at DESC;

-- Step 2: Check recent updates (last 10 minutes)
SELECT 
  'Recent updates:' as status,
  b.id as board_id,
  b.board_name,
  b.updated_at,
  au.email as owner_email
FROM boards b
JOIN auth.users au ON b.user_id = au.id
WHERE au.email = 's.jiyoung.an@gmail.com'
  AND b.updated_at > NOW() - INTERVAL '10 minutes'
ORDER BY b.updated_at DESC;

-- Step 3: Check if there are any errors in the logs
-- (This won't show much in SQL, but helps verify the table structure)
SELECT 
  'Table structure check:' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'boards'
ORDER BY ordinal_position;
