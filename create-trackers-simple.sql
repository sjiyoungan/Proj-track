-- Step 1: Create the trackers table
CREATE TABLE trackers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  projects JSONB DEFAULT '[]'::jsonb,
  global_krs JSONB DEFAULT '[]'::jsonb,
  filter_state JSONB DEFAULT '{"showInitiative": true, "showKR": true, "showPlan": true, "showDone": true, "showFuture": true, "sortBy": "priority"}'::jsonb,
  header_title TEXT DEFAULT '',
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 2: Enable Row Level Security
ALTER TABLE trackers ENABLE ROW LEVEL SECURITY;

-- Step 3: Create RLS policies
CREATE POLICY "Users can view their own tracker" ON trackers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracker" ON trackers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracker" ON trackers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracker" ON trackers
  FOR DELETE USING (auth.uid() = user_id);

-- Step 4: Create index for performance
CREATE INDEX idx_trackers_user_id ON trackers (user_id);

-- Step 5: Create function to update timestamp
CREATE OR REPLACE FUNCTION update_trackers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Step 6: Create trigger for automatic timestamp updates
CREATE TRIGGER trackers_updated_at_trigger
  BEFORE UPDATE ON trackers
  FOR EACH ROW
  EXECUTE FUNCTION update_trackers_updated_at();
