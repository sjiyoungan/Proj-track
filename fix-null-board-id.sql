-- Fix null board_id values in sharing_permissions table
-- Run this in Supabase SQL Editor

-- Step 1: Check current state of sharing_permissions table
SELECT 
  'Current sharing_permissions state:' as status,
  COUNT(*) as total_records,
  COUNT(board_id) as records_with_board_id,
  COUNT(*) - COUNT(board_id) as records_with_null_board_id
FROM sharing_permissions;

-- Step 2: Show records with null board_id
SELECT 
  'Records with null board_id:' as status,
  id,
  owner_id,
  shared_with_email,
  shared_with_name,
  tracker_id,
  board_id,
  access_level,
  created_at
FROM sharing_permissions 
WHERE board_id IS NULL;

-- Step 3: Check if there are any records with tracker_id that could be mapped
SELECT 
  'Records with tracker_id:' as status,
  COUNT(*) as records_with_tracker_id
FROM sharing_permissions 
WHERE tracker_id IS NOT NULL;

-- Step 4: Update null board_id values by matching with boards table
-- First, let's see what boards exist
SELECT 
  'Available boards:' as status,
  id as board_id,
  user_id,
  board_name,
  created_at
FROM boards
ORDER BY created_at DESC;

-- Step 5: Update sharing_permissions to use the correct board_id
-- If there are records with tracker_id, try to match them
UPDATE sharing_permissions 
SET board_id = (
  SELECT b.id 
  FROM boards b 
  WHERE b.id::text = sharing_permissions.tracker_id::text
)
WHERE board_id IS NULL 
  AND tracker_id IS NOT NULL;

-- Step 6: For any remaining null board_id records, delete them if they can't be matched
-- (These are likely orphaned records from the old system)
DELETE FROM sharing_permissions 
WHERE board_id IS NULL;

-- Step 7: Verify the fix
SELECT 
  'After fix - sharing_permissions state:' as status,
  COUNT(*) as total_records,
  COUNT(board_id) as records_with_board_id,
  COUNT(*) - COUNT(board_id) as records_with_null_board_id
FROM sharing_permissions;

-- Step 8: Show remaining records
SELECT 
  'Remaining sharing permissions:' as status,
  id,
  owner_id,
  shared_with_email,
  shared_with_name,
  board_id,
  access_level,
  created_at
FROM sharing_permissions
ORDER BY created_at DESC;
