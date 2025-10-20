-- Check if the problematic board exists and who owns it
-- Run this in Supabase SQL Editor

-- Step 1: Check if the board exists
SELECT 
  'Board existence check:' as status,
  b.id as board_id,
  b.board_name,
  b.user_id,
  au.email as owner_email,
  b.created_at,
  b.updated_at
FROM boards b
LEFT JOIN auth.users au ON b.user_id = au.id
WHERE b.id = '3cf33f2d-ebfe-4400-a547-69069ae668b3';

-- Step 2: Check what boards exist for the user
SELECT 
  'User boards:' as status,
  b.id as board_id,
  b.board_name,
  b.user_id,
  au.email as owner_email,
  b.created_at,
  b.updated_at
FROM boards b
JOIN auth.users au ON b.user_id = au.id
WHERE au.id = 'b52f0e7e-55f3-43be-a686-a2d2a694db5c'
ORDER BY b.created_at ASC;

-- Step 3: Check if there are any sharing permissions for this board
SELECT 
  'Sharing permissions:' as status,
  sp.board_id,
  sp.shared_with_email,
  sp.access_level,
  sp.owner_id,
  au.email as owner_email
FROM sharing_permissions sp
LEFT JOIN auth.users au ON sp.owner_id = au.id
WHERE sp.board_id = '3cf33f2d-ebfe-4400-a547-69069ae668b3';
