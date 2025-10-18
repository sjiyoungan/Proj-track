-- Simple and robust migration script to create trackers table
-- Run this in your Supabase SQL Editor

-- Step 1: Create the trackers table
CREATE TABLE IF NOT EXISTS trackers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  projects JSONB DEFAULT '[]'::jsonb,
  global_krs JSONB DEFAULT '[]'::jsonb,
  filter_state JSONB DEFAULT '{"showInitiative": true, "showKR": true, "showPlan": true, "showDone": true, "showFuture": true, "sortBy": "priority-asc"}'::jsonb,
  tracker_name TEXT DEFAULT '',
  tracker_display_name TEXT DEFAULT 'My Tracker',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE trackers ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies
DROP POLICY IF EXISTS "Users can view their own tracker" ON trackers;
CREATE POLICY "Users can view their own tracker" ON trackers
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own tracker" ON trackers;
CREATE POLICY "Users can insert their own tracker" ON trackers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own tracker" ON trackers;
CREATE POLICY "Users can update their own tracker" ON trackers
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own tracker" ON trackers;
CREATE POLICY "Users can delete their own tracker" ON trackers
  FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Create index for performance
CREATE INDEX IF NOT EXISTS idx_trackers_user_id ON trackers (user_id);

-- Step 5: Create function to update timestamp
CREATE OR REPLACE FUNCTION update_trackers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trackers_updated_at_trigger ON trackers;
CREATE TRIGGER trackers_updated_at_trigger
  BEFORE UPDATE ON trackers
  FOR EACH ROW
  EXECUTE FUNCTION update_trackers_updated_at();

-- Step 7: Create a simple tracker entry for each user (no migration from old tables)
-- This ensures every user has a tracker record to work with
-- First, let's check if any users already have trackers
INSERT INTO trackers (user_id, projects, global_krs, filter_state, tracker_name)
SELECT 
  u.id,
  '[]'::jsonb,
  '[]'::jsonb,
  '{"showInitiative": true, "showKR": true, "showPlan": true, "showDone": true, "showFuture": true, "sortBy": "priority-asc"}'::jsonb,
  'My Tracker'
FROM auth.users u
WHERE NOT EXISTS (
  SELECT 1 FROM trackers t WHERE t.user_id = u.id
);

-- Step 8: Verify the migration worked
SELECT 
  'Migration completed successfully!' as status,
  COUNT(*) as total_trackers_created
FROM trackers;
