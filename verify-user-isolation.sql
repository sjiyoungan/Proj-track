-- Verification Queries for Supabase
-- Run these in your Supabase SQL Editor to verify user isolation

-- 1. Check if RLS is enabled (should return 't' for true)
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('projects', 'global_krs', 'filter_state', 'header_title', 'shares');

-- 2. Check RLS policies (should show policies for each table)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('projects', 'global_krs', 'filter_state', 'header_title', 'shares');

-- 3. Test data isolation (run this as different users)
-- First, create a test user and add some data, then check if other users can see it

-- 4. Check current user's data (this will only show YOUR data)
SELECT * FROM projects WHERE user_id = auth.uid();

-- 5. Check all users' data (this will show ALL users' data - only run this as admin)
SELECT user_id, COUNT(*) as project_count FROM projects GROUP BY user_id;

-- 6. Verify foreign key constraints
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
AND tc.table_name IN ('projects', 'global_krs', 'filter_state', 'header_title', 'shares');
