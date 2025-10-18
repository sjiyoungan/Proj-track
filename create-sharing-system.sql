-- Create sharing system tables for multi-tracker support and permissions

-- 1. Update trackers table to support multiple trackers per user
-- Add a name field for each tracker (optional, defaults to "Tracker 1", "Tracker 2", etc.)
ALTER TABLE trackers ADD COLUMN IF NOT EXISTS tracker_display_name TEXT DEFAULT 'My Tracker';

-- 2. Create sharing permissions table
CREATE TABLE IF NOT EXISTS sharing_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_with_name TEXT,
  tracker_id UUID NOT NULL REFERENCES trackers(id) ON DELETE CASCADE,
  access_level TEXT NOT NULL DEFAULT 'edit' CHECK (access_level IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(owner_id, shared_with_email, tracker_id)
);

-- 3. Create index for efficient lookups
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_shared_with_email ON sharing_permissions(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_owner_id ON sharing_permissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_tracker_id ON sharing_permissions(tracker_id);

-- 4. Enable RLS on sharing_permissions table
ALTER TABLE sharing_permissions ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies for sharing_permissions
-- Users can view permissions where they are the owner or the shared user
CREATE POLICY "Users can view their sharing permissions" ON sharing_permissions
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    auth.jwt() ->> 'email' = shared_with_email
  );

-- Users can insert permissions where they are the owner
CREATE POLICY "Users can create sharing permissions" ON sharing_permissions
  FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Users can update permissions where they are the owner
CREATE POLICY "Users can update their sharing permissions" ON sharing_permissions
  FOR UPDATE USING (auth.uid() = owner_id);

-- Users can delete permissions where they are the owner
CREATE POLICY "Users can delete their sharing permissions" ON sharing_permissions
  FOR DELETE USING (auth.uid() = owner_id);

-- 6. Update trackers table RLS to allow shared users to read
-- First, drop existing policies
DROP POLICY IF EXISTS "Users can view their own trackers" ON trackers;
DROP POLICY IF EXISTS "Users can insert their own trackers" ON trackers;
DROP POLICY IF EXISTS "Users can update their own trackers" ON trackers;
DROP POLICY IF EXISTS "Users can delete their own trackers" ON trackers;

-- Create new policies that include sharing
CREATE POLICY "Users can view their own and shared trackers" ON trackers
  FOR SELECT USING (
    auth.uid() = user_id OR 
    EXISTS (
      SELECT 1 FROM sharing_permissions 
      WHERE sharing_permissions.tracker_id = trackers.id 
      AND sharing_permissions.shared_with_email = auth.jwt() ->> 'email'
    )
  );

CREATE POLICY "Users can insert their own trackers" ON trackers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trackers" ON trackers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trackers" ON trackers
  FOR DELETE USING (auth.uid() = user_id);

-- 7. Create function to get user's accessible trackers
CREATE OR REPLACE FUNCTION get_user_trackers(user_email TEXT)
RETURNS TABLE (
  tracker_id UUID,
  tracker_name TEXT,
  tracker_display_name TEXT,
  is_owner BOOLEAN,
  access_level TEXT,
  owner_email TEXT,
  owner_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id as tracker_id,
    t.tracker_name,
    t.tracker_display_name,
    (t.user_id = auth.uid()) as is_owner,
    COALESCE(sp.access_level, 'edit') as access_level,
    au.email as owner_email,
    COALESCE(au.raw_user_meta_data ->> 'full_name', au.email) as owner_name
  FROM trackers t
  LEFT JOIN auth.users au ON t.user_id = au.id
  LEFT JOIN sharing_permissions sp ON sp.tracker_id = t.id AND sp.shared_with_email = user_email
  WHERE 
    t.user_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM sharing_permissions 
      WHERE sharing_permissions.tracker_id = t.id 
      AND sharing_permissions.shared_with_email = user_email
    )
  ORDER BY is_owner DESC, t.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 8. Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON sharing_permissions TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_trackers(TEXT) TO authenticated;
