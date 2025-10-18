-- Migrate from trackers table to boards table
-- This script renames the table and updates column names to use "board" terminology

-- Step 1: Check current state
SELECT 
  'Current state check' as step,
  COUNT(*) as total_trackers,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN tracker_display_name IS NULL THEN 1 END) as null_display_names,
  COUNT(CASE WHEN tracker_name IS NULL OR tracker_name = '' THEN 1 END) as null_tracker_names
FROM trackers;

-- Step 2: Clean up duplicate trackers first
WITH ranked_trackers AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rn
  FROM trackers
)
DELETE FROM trackers 
WHERE id IN (
  SELECT id 
  FROM ranked_trackers 
  WHERE rn > 1
);

-- Step 3: Update null values
UPDATE trackers 
SET tracker_display_name = 'New Board'
WHERE tracker_display_name IS NULL;

UPDATE trackers 
SET tracker_name = 'New Board'
WHERE tracker_name IS NULL OR tracker_name = '';

-- Step 4: Rename table from trackers to boards
ALTER TABLE trackers RENAME TO boards;

-- Step 5: Rename columns to use board terminology
ALTER TABLE boards RENAME COLUMN tracker_name TO board_name;
ALTER TABLE boards RENAME COLUMN tracker_display_name TO board_display_name;

-- Step 6: Update RLS policies
DROP POLICY IF EXISTS "Users can view their own tracker" ON boards;
DROP POLICY IF EXISTS "Users can insert their own tracker" ON boards;
DROP POLICY IF EXISTS "Users can update their own tracker" ON boards;
DROP POLICY IF EXISTS "Users can delete their own tracker" ON boards;

CREATE POLICY "Users can view their own board" ON boards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own board" ON boards
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own board" ON boards
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own board" ON boards
  FOR DELETE USING (auth.uid() = user_id);

-- Step 7: Update trigger function name
DROP TRIGGER IF EXISTS trackers_updated_at_trigger ON boards;
DROP FUNCTION IF EXISTS update_trackers_updated_at();

CREATE OR REPLACE FUNCTION update_boards_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER boards_updated_at_trigger
  BEFORE UPDATE ON boards
  FOR EACH ROW
  EXECUTE FUNCTION update_boards_updated_at();

-- Step 8: Update RPC function if it exists
DROP FUNCTION IF EXISTS get_user_trackers(text);

CREATE OR REPLACE FUNCTION get_user_boards(user_email text)
RETURNS TABLE (
  board_id uuid,
  board_name text,
  board_display_name text,
  is_owner boolean,
  access_level text,
  owner_email text,
  owner_name text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    b.id as board_id,
    b.board_name,
    b.board_display_name,
    true as is_owner,
    'edit'::text as access_level,
    u.email as owner_email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as owner_name
  FROM boards b
  JOIN auth.users u ON b.user_id = u.id
  WHERE u.email = user_email
  
  UNION ALL
  
  SELECT 
    b.id as board_id,
    b.board_name,
    b.board_display_name,
    false as is_owner,
    sp.access_level,
    u.email as owner_email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as owner_name
  FROM boards b
  JOIN sharing_permissions sp ON b.id = sp.tracker_id
  JOIN auth.users u ON b.user_id = u.id
  WHERE sp.shared_with_email = user_email;
END;
$$ LANGUAGE plpgsql;

-- Step 9: Verify the migration
SELECT 
  'Migration completed!' as status,
  COUNT(*) as total_boards,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN board_display_name IS NULL THEN 1 END) as null_display_names,
  COUNT(CASE WHEN board_name IS NULL OR board_name = '' THEN 1 END) as null_board_names
FROM boards;

-- Step 10: Show sample data
SELECT 
  id,
  user_id,
  board_display_name,
  board_name,
  created_at,
  updated_at
FROM boards 
ORDER BY user_id, created_at
LIMIT 5;
