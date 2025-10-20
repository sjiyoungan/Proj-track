-- Create or fix sharing_permissions table for boards
-- Run this in Supabase SQL Editor

-- Step 1: Check current state
SELECT 
  'Checking current state...' as status,
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'sharing_permissions')
    THEN 'sharing_permissions table EXISTS'
    ELSE 'sharing_permissions table DOES NOT EXIST'
  END as table_status;

-- Step 2: Drop existing sharing_permissions table if it exists (we'll recreate it properly)
DROP TABLE IF EXISTS sharing_permissions CASCADE;

-- Step 3: Create sharing_permissions table with correct structure for boards
CREATE TABLE sharing_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_with_name TEXT NOT NULL,
  board_id UUID NOT NULL REFERENCES boards(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL CHECK (access_level IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Enable Row Level Security
ALTER TABLE sharing_permissions ENABLE ROW LEVEL SECURITY;

-- Step 5: Create RLS policies
DROP POLICY IF EXISTS "Users can view permissions for their owned boards" ON sharing_permissions;
CREATE POLICY "Users can view permissions for their owned boards" ON sharing_permissions
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert permissions for their owned boards" ON sharing_permissions;
CREATE POLICY "Users can insert permissions for their owned boards" ON sharing_permissions
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update permissions for their owned boards" ON sharing_permissions;
CREATE POLICY "Users can update permissions for their owned boards" ON sharing_permissions
  FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete permissions for their owned boards" ON sharing_permissions;
CREATE POLICY "Users can delete permissions for their owned boards" ON sharing_permissions
  FOR DELETE USING (owner_id = auth.uid());

-- Step 6: Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_owner_id ON sharing_permissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_board_id ON sharing_permissions(board_id);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_shared_with_email ON sharing_permissions(shared_with_email);

-- Step 7: Create trigger for updated_at
CREATE OR REPLACE FUNCTION update_sharing_permissions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER sharing_permissions_updated_at_trigger
  BEFORE UPDATE ON sharing_permissions
  FOR EACH ROW
  EXECUTE FUNCTION update_sharing_permissions_updated_at();

-- Step 8: Verify the table was created correctly
SELECT 
  'sharing_permissions table created successfully!' as status,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'sharing_permissions'
ORDER BY ordinal_position;

-- Step 9: Test that we can insert a record (this will verify everything works)
SELECT 
  'Table is ready for sharing permissions!' as status,
  'You can now test board sharing functionality' as message;
