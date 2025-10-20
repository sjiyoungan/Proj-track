-- Fix boards table structure by adding missing board_display_name column
-- Run this in Supabase SQL Editor

-- Step 1: Check current boards table structure
SELECT 
  'Current boards table structure:' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'boards'
ORDER BY ordinal_position;

-- Step 2: Add board_display_name column if it doesn't exist
ALTER TABLE boards 
ADD COLUMN IF NOT EXISTS board_display_name TEXT;

-- Step 3: Update existing records to set board_display_name
-- If board_name exists, use it as board_display_name
UPDATE boards 
SET board_display_name = COALESCE(board_name, 'New Board')
WHERE board_display_name IS NULL;

-- Step 4: Set default value for board_display_name
ALTER TABLE boards 
ALTER COLUMN board_display_name SET DEFAULT 'New Board';

-- Step 5: Make board_display_name NOT NULL
ALTER TABLE boards 
ALTER COLUMN board_display_name SET NOT NULL;

-- Step 6: Verify the fix
SELECT 
  'boards table structure after fix:' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'boards'
ORDER BY ordinal_position;

-- Step 7: Show sample data to verify
SELECT 
  'Sample data after fix:' as status,
  id,
  user_id,
  board_name,
  board_display_name,
  created_at
FROM boards
LIMIT 5;
