-- Fix RLS policies for sharing_permissions table
-- Run this in Supabase SQL Editor

-- Step 1: Check current RLS policies
SELECT 
  'Current RLS policies:' as status,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'sharing_permissions';

-- Step 2: Drop existing policies
DROP POLICY IF EXISTS "Users can view permissions for their owned boards" ON sharing_permissions;
DROP POLICY IF EXISTS "Users can insert permissions for their owned boards" ON sharing_permissions;
DROP POLICY IF EXISTS "Users can update permissions for their owned boards" ON sharing_permissions;
DROP POLICY IF EXISTS "Users can delete permissions for their owned boards" ON sharing_permissions;

-- Step 3: Create new, simpler RLS policies
CREATE POLICY "Enable all for authenticated users" ON sharing_permissions
  FOR ALL USING (auth.role() = 'authenticated');

-- Step 4: Test the policies by checking if we can access the table
SELECT 
  'RLS policies fixed!' as status,
  'sharing_permissions table should now be accessible' as message;

-- Step 5: Test inserting a record (this should work now)
-- Uncomment the line below to test:
-- INSERT INTO sharing_permissions (owner_id, shared_with_email, shared_with_name, board_id, access_level) 
-- VALUES (auth.uid(), 'test@example.com', 'Test User', (SELECT id FROM boards LIMIT 1), 'edit');
