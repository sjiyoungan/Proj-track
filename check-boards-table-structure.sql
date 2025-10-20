-- Check the current structure of the boards table
-- Run this in Supabase SQL Editor

-- 1. Check if boards table exists and its structure
SELECT 
  'boards table structure:' as check_type,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'boards'
ORDER BY ordinal_position;

-- 2. Check if the table exists at all
SELECT 
  'Table exists check:' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'boards')
    THEN 'boards table EXISTS'
    ELSE 'boards table DOES NOT EXIST'
  END as table_status;

-- 3. If table exists, show sample data
SELECT 
  'Sample data from boards:' as check_type,
  *
FROM boards
LIMIT 3;

-- 4. Check what columns exist in the table
SELECT 
  'Columns in boards:' as check_type,
  string_agg(column_name, ', ') as columns
FROM information_schema.columns 
WHERE table_name = 'boards';

-- 5. Check if there's a trackers table that might need migration
SELECT 
  'trackers table check:' as check_type,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trackers')
    THEN 'trackers table EXISTS - may need migration'
    ELSE 'trackers table DOES NOT EXIST'
  END as trackers_status;
