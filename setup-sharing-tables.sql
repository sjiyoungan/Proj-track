-- Update trackers table to support multiple trackers per user
ALTER TABLE trackers DROP CONSTRAINT IF EXISTS trackers_user_id_key;
ALTER TABLE trackers ADD COLUMN IF NOT EXISTS tracker_id UUID DEFAULT gen_random_uuid();
ALTER TABLE trackers ADD COLUMN IF NOT EXISTS tracker_display_name TEXT;
ALTER TABLE trackers ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT TRUE;
ALTER TABLE trackers ADD COLUMN IF NOT EXISTS access_level TEXT DEFAULT 'edit';

-- Add unique constraint on tracker_id instead of primary key
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'trackers_tracker_id_unique'
    ) THEN
        ALTER TABLE trackers ADD CONSTRAINT trackers_tracker_id_unique UNIQUE (tracker_id);
    END IF;
END $$;

-- Create sharing_permissions table
CREATE TABLE IF NOT EXISTS sharing_permissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  shared_with_email TEXT NOT NULL,
  shared_with_name TEXT NOT NULL,
  tracker_id UUID NOT NULL,
  access_level TEXT NOT NULL CHECK (access_level IN ('view', 'edit')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shares table
CREATE TABLE IF NOT EXISTS shares (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  share_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sharing_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for sharing_permissions
DROP POLICY IF EXISTS "Users can view permissions for their owned trackers" ON sharing_permissions;
CREATE POLICY "Users can view permissions for their owned trackers" ON sharing_permissions
  FOR SELECT USING (
    owner_id = auth.uid() OR 
    shared_with_email = (SELECT email FROM auth.users WHERE id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert permissions for their owned trackers" ON sharing_permissions;
CREATE POLICY "Users can insert permissions for their owned trackers" ON sharing_permissions
  FOR INSERT WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update permissions for their owned trackers" ON sharing_permissions;
CREATE POLICY "Users can update permissions for their owned trackers" ON sharing_permissions
  FOR UPDATE USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete permissions for their owned trackers" ON sharing_permissions;
CREATE POLICY "Users can delete permissions for their owned trackers" ON sharing_permissions
  FOR DELETE USING (owner_id = auth.uid());

-- Create RLS policies for shares
DROP POLICY IF EXISTS "Users can view their own shares" ON shares;
CREATE POLICY "Users can view their own shares" ON shares
  FOR SELECT USING (user_id = auth.uid() OR owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create shares" ON shares;
CREATE POLICY "Users can create shares" ON shares
  FOR INSERT WITH CHECK (user_id = auth.uid() AND owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own shares" ON shares;
CREATE POLICY "Users can update their own shares" ON shares
  FOR UPDATE USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own shares" ON shares;
CREATE POLICY "Users can delete their own shares" ON shares
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_owner_id ON sharing_permissions(owner_id);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_tracker_id ON sharing_permissions(tracker_id);
CREATE INDEX IF NOT EXISTS idx_sharing_permissions_shared_with_email ON sharing_permissions(shared_with_email);
CREATE INDEX IF NOT EXISTS idx_shares_share_id ON shares(share_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_owner_id ON shares(owner_id);

-- Create RPC function to get user trackers
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
  -- Get trackers owned by the user
  SELECT 
    t.tracker_id,
    t.tracker_name,
    COALESCE(t.tracker_display_name, t.tracker_name) as tracker_display_name,
    TRUE as is_owner,
    'edit'::TEXT as access_level,
    u.email as owner_email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as owner_name
  FROM trackers t
  JOIN auth.users u ON t.user_id = u.id
  WHERE u.email = user_email
  
  UNION ALL
  
  -- Get trackers shared with the user
  SELECT 
    t.tracker_id,
    t.tracker_name,
    COALESCE(t.tracker_display_name, t.tracker_name) as tracker_display_name,
    FALSE as is_owner,
    sp.access_level,
    u.email as owner_email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as owner_name
  FROM sharing_permissions sp
  JOIN trackers t ON sp.tracker_id = t.tracker_id
  JOIN auth.users u ON t.user_id = u.id
  WHERE sp.shared_with_email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
