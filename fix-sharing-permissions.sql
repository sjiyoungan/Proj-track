-- Fix sharing_permissions table to work with boards instead of trackers
-- Run this in Supabase SQL Editor

-- Step 1: Check current sharing_permissions table structure
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sharing_permissions'
ORDER BY ordinal_position;

-- Step 2: Update sharing_permissions table to use board_id instead of tracker_id
-- First, add the new board_id column
ALTER TABLE sharing_permissions 
ADD COLUMN IF NOT EXISTS board_id UUID;

-- Step 3: Update existing records to use board_id from boards table
UPDATE sharing_permissions 
SET board_id = (
  SELECT b.id 
  FROM boards b 
  WHERE b.id = sharing_permissions.tracker_id
);

-- Step 4: Make board_id NOT NULL and add foreign key constraint
ALTER TABLE sharing_permissions 
ALTER COLUMN board_id SET NOT NULL;

-- Add foreign key constraint to boards table
ALTER TABLE sharing_permissions 
ADD CONSTRAINT fk_sharing_permissions_board_id 
FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE;

-- Step 5: Drop the old tracker_id column
ALTER TABLE sharing_permissions 
DROP COLUMN IF EXISTS tracker_id;

-- Step 6: Update the get_user_boards RPC function to use board_id
CREATE OR REPLACE FUNCTION get_user_boards(user_email text)
RETURNS TABLE (
  board_id uuid,
  board_name text,
  board_display_name text,
  is_owner boolean,
  access_level text,
  owner_email text,
  owner_name text,
  created_at timestamp with time zone
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    b.id as board_id,
    b.board_name,
    b.board_display_name,
    true as is_owner,
    'edit'::text as access_level,
    au.email as owner_email,
    au.raw_user_meta_data->>'full_name' as owner_name,
    b.created_at
  FROM boards b
  JOIN auth.users au ON b.user_id = au.id
  WHERE b.user_id = auth.uid()
  
  UNION ALL
  
  SELECT
    b.id as board_id,
    b.board_name,
    b.board_display_name,
    false as is_owner,
    sp.access_level::text,
    au.email as owner_email,
    au.raw_user_meta_data->>'full_name' as owner_name,
    b.created_at
  FROM sharing_permissions sp
  JOIN boards b ON sp.board_id = b.id
  JOIN auth.users au ON b.user_id = au.id
  WHERE sp.shared_with_email = user_email
  ORDER BY created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Grant permissions
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_boards(text) TO anon;

-- Step 8: Verify the fix
SELECT 
  'Sharing permissions table updated!' as status,
  COUNT(*) as total_permissions,
  COUNT(DISTINCT board_id) as unique_boards,
  COUNT(DISTINCT shared_with_email) as unique_shared_users
FROM sharing_permissions;
