-- Migration script to create trackers table and migrate existing data
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

-- Step 7: Migrate existing data (if old tables exist)
-- This will move data from old tables to new trackers table
-- Note: Only migrate from tables that actually exist

-- First, check which tables exist and migrate accordingly
DO $$
BEGIN
  -- Check if we have any existing tables to migrate from
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'projects') THEN
    -- Migrate from projects table (and other tables if they exist)
    INSERT INTO trackers (user_id, projects, global_krs, filter_state, tracker_name)
    SELECT 
      p.user_id,
      COALESCE(
        jsonb_agg(
          jsonb_build_object(
            'id', p.id,
            'priority', p.priority,
            'name', p.name,
            'plan', p.plan,
            'initiative', p.initiative,
            'selectedKRs', p.selected_krs,
            'designStatus', p.design_status,
            'buildStatus', p.build_status,
            'problemStatement', p.problem_statement,
            'solution', p.solution,
            'successMetric', p.success_metric,
            'figmaLink', p.figma_link,
            'prdLink', p.prd_link,
            'customLinks', p.custom_links,
            'createdAt', p.created_at,
            'updatedAt', p.updated_at
          ) ORDER BY p.priority
        ) FILTER (WHERE p.id IS NOT NULL),
        '[]'::jsonb
      ),
      -- Try to get global_krs if table exists
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'global_krs') THEN
          COALESCE(
            (SELECT jsonb_agg(
              jsonb_build_object(
                'id', k.id,
                'text', k.text,
                'fillColor', k.fill_color,
                'textColor', k.text_color,
                'order', k.order_index,
                'createdAt', k.created_at
              ) ORDER BY k.order_index
            ) FROM global_krs k WHERE k.user_id = p.user_id),
            '[]'::jsonb
          )
        ELSE '[]'::jsonb
      END,
      -- Try to get filter_state if table exists
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'filter_state') THEN
          COALESCE(
            (SELECT jsonb_build_object(
              'showInitiative', fs.show_initiative,
              'showKR', fs.show_kr,
              'showPlan', fs.show_plan,
              'showDone', fs.show_done,
              'showFuture', fs.show_future,
              'sortBy', fs.sort_by
            ) FROM filter_state fs WHERE fs.user_id = p.user_id),
            '{"showInitiative": true, "showKR": true, "showPlan": true, "showDone": true, "showFuture": true, "sortBy": "priority-asc"}'::jsonb
          )
        ELSE '{"showInitiative": true, "showKR": true, "showPlan": true, "showDone": true, "showFuture": true, "sortBy": "priority-asc"}'::jsonb
      END,
      -- Try to get header_title if table exists
      CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'header_title') THEN
          COALESCE((SELECT ht.title FROM header_title ht WHERE ht.user_id = p.user_id), '')
        ELSE ''
      END
    FROM projects p
    GROUP BY p.user_id
    ON CONFLICT (user_id) DO NOTHING;
    
    RAISE NOTICE 'Migrated data from existing tables';
  ELSE
    RAISE NOTICE 'No existing tables found to migrate from';
  END IF;
END $$;

-- Step 8: Verify the migration worked
SELECT 
  'Migration completed successfully!' as status,
  COUNT(*) as total_trackers_created
FROM trackers;
