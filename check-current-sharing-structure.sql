-- Check the current structure of sharing_permissions table
-- Run this in Supabase SQL Editor

-- 1. Check if sharing_permissions table exists and its current structure
SELECT 
  'sharing_permissions table structure:' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sharing_permissions'
ORDER BY ordinal_position;

-- 2. Check if the table exists at all
SELECT 
  'Table exists check:' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sharing_permissions')
    THEN 'sharing_permissions table EXISTS'
    ELSE 'sharing_permissions table DOES NOT EXIST'
  END as table_status;

-- 3. If table exists, show sample data
SELECT 
  'Sample data from sharing_permissions:' as check_type,
  *
FROM sharing_permissions
LIMIT 3;

-- 4. Check what columns exist in the table
SELECT 
  'Columns in sharing_permissions:' as check_type,
  string_agg(column_name, ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'sharing_permissions';
