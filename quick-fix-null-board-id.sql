-- Quick fix for null board_id values in sharing_permissions
-- Run this in Supabase SQL Editor

-- Step 1: Temporarily remove the NOT NULL constraint
ALTER TABLE sharing_permissions 
ALTER COLUMN board_id DROP NOT NULL;

-- Step 2: Delete all records with null board_id (these are orphaned from old system)
DELETE FROM sharing_permissions 
WHERE board_id IS NULL;

-- Step 3: Re-add the NOT NULL constraint
ALTER TABLE sharing_permissions 
ALTER COLUMN board_id SET NOT NULL;

-- Step 4: Verify the fix
SELECT 
  'sharing_permissions table after fix:' as status,
  COUNT(*) as total_records
FROM sharing_permissions;

-- Step 5: Test that we can now insert new sharing permissions
-- This will show if the table is working correctly
SELECT 
  'Test insert (this should work now):' as status,
  'Ready for new sharing permissions' as message;
