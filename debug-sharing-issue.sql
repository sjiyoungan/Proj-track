-- Debug sharing issue - check current state of sharing_permissions table
-- Run this in Supabase SQL Editor

-- 1. Check if sharing_permissions table exists and its structure
SELECT 
  'sharing_permissions table structure:' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sharing_permissions'
ORDER BY ordinal_position;

-- 2. Check if there are any existing records
SELECT 
  'existing records count:' as check_type,
  COUNT(*) as record_count
FROM sharing_permissions;

-- 3. Check if boards table exists and has data
SELECT 
  'boards table count:' as check_type,
  COUNT(*) as board_count
FROM boards;

-- 4. Check current user authentication
SELECT 
  'current user:' as check_type,
  auth.uid() as user_id,
  (SELECT email FROM auth.users WHERE id = auth.uid()) as user_email;

-- 5. Test inserting a sample sharing permission (this will show the exact error)
-- Uncomment the line below to test the insert:
-- INSERT INTO sharing_permissions (owner_id, shared_with_email, shared_with_name, board_id, access_level) 
-- VALUES (auth.uid(), 'test@example.com', 'Test User', (SELECT id FROM boards LIMIT 1), 'edit');

-- 6. Check if there are any constraints or foreign key issues
SELECT 
  'constraints:' as check_type,
  constraint_name,
  constraint_type,
  table_name
FROM information_schema.table_constraints 
WHERE table_name = 'sharing_permissions';
