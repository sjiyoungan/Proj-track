-- Create new trackers table with JSONB columns for all tracker data
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

-- Enable Row Level Security
ALTER TABLE trackers ENABLE ROW LEVEL SECURITY;

-- Policies for trackers table
CREATE POLICY "Users can view their own tracker" ON trackers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tracker" ON trackers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tracker" ON trackers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tracker" ON trackers
  FOR DELETE USING (auth.uid() = user_id);

-- Index for performance
CREATE INDEX idx_trackers_user_id ON trackers (user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_trackers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER trackers_updated_at_trigger
  BEFORE UPDATE ON trackers
  FOR EACH ROW
  EXECUTE FUNCTION update_trackers_updated_at();

-- Migrate existing data to new structure (optional)
-- This will move data from old tables to new trackers table
INSERT INTO trackers (user_id, projects, global_krs, filter_state, header_title)
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
  COALESCE(
    jsonb_agg(
      jsonb_build_object(
        'id', k.id,
        'text', k.text,
        'fillColor', k.fill_color,
        'textColor', k.text_color,
        'orderIndex', k.order_index,
        'createdAt', k.created_at
      ) ORDER BY k.order_index
    ) FILTER (WHERE k.id IS NOT NULL),
    '[]'::jsonb
  ),
  COALESCE(
    jsonb_build_object(
      'showInitiative', fs.show_initiative,
      'showKR', fs.show_kr,
      'showPlan', fs.show_plan,
      'showDone', fs.show_done,
      'showFuture', fs.show_future,
      'sortBy', fs.sort_by
    ),
    '{"showInitiative": true, "showKR": true, "showPlan": true, "showDone": true, "showFuture": true, "sortBy": "priority"}'::jsonb
  ),
  COALESCE(ht.title, '')
FROM auth.users u
LEFT JOIN projects p ON u.id = p.user_id
LEFT JOIN global_krs k ON u.id = k.user_id
LEFT JOIN filter_state fs ON u.id = fs.user_id
LEFT JOIN header_title ht ON u.id = ht.user_id
GROUP BY u.id, fs.show_initiative, fs.show_kr, fs.show_plan, fs.show_done, fs.show_future, fs.sort_by, ht.title
ON CONFLICT (user_id) DO NOTHING;
