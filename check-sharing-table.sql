-- Check if sharing_permissions table exists and has the right structure
-- Run this in Supabase SQL Editor

-- 1. Check if sharing_permissions table exists
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sharing_permissions'
ORDER BY ordinal_position;

-- 2. Check what data exists in sharing_permissions table
SELECT 
  id,
  owner_id,
  shared_with_email,
  shared_with_name,
  board_id,
  access_level,
  created_at
FROM sharing_permissions
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check if there are any constraints or indexes
SELECT 
  constraint_name,
  constraint_type
FROM information_schema.table_constraints 
WHERE table_name = 'sharing_permissions';
