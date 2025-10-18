-- Supabase Database Schema for Proj-track
-- Run these commands in your Supabase SQL Editor

-- 1. Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  priority INTEGER NOT NULL DEFAULT 1,
  name TEXT NOT NULL DEFAULT '',
  plan TEXT NOT NULL DEFAULT 'select',
  initiative TEXT NOT NULL DEFAULT '',
  selected_krs TEXT[] DEFAULT '{}',
  design_status TEXT NOT NULL DEFAULT 'select',
  build_status TEXT NOT NULL DEFAULT 'select',
  problem_statement TEXT NOT NULL DEFAULT '',
  solution TEXT NOT NULL DEFAULT '',
  success_metric TEXT NOT NULL DEFAULT '',
  figma_link TEXT NOT NULL DEFAULT '',
  prd_link TEXT NOT NULL DEFAULT '',
  custom_links JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Global KRs table
CREATE TABLE IF NOT EXISTS global_krs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  text TEXT NOT NULL DEFAULT '',
  fill_color TEXT NOT NULL DEFAULT '#3B82F6',
  text_color TEXT NOT NULL DEFAULT '#FFFFFF',
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Filter state table
CREATE TABLE IF NOT EXISTS filter_state (
  id TEXT NOT NULL DEFAULT 'default',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  show_initiative BOOLEAN NOT NULL DEFAULT true,
  show_kr BOOLEAN NOT NULL DEFAULT true,
  show_plan BOOLEAN NOT NULL DEFAULT true,
  show_done BOOLEAN NOT NULL DEFAULT true,
  show_future BOOLEAN NOT NULL DEFAULT true,
  sort_by TEXT NOT NULL DEFAULT 'priority-asc',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- 4. Header title table
CREATE TABLE IF NOT EXISTS header_title (
  id TEXT NOT NULL DEFAULT 'default',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (id, user_id)
);

-- 5. Shares table (for sharing functionality)
CREATE TABLE IF NOT EXISTS shares (
  id SERIAL PRIMARY KEY,
  share_id TEXT UNIQUE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects(user_id, priority);
CREATE INDEX IF NOT EXISTS idx_global_krs_user_id ON global_krs(user_id);
CREATE INDEX IF NOT EXISTS idx_global_krs_order ON global_krs(user_id, order_index);
CREATE INDEX IF NOT EXISTS idx_filter_state_user_id ON filter_state(user_id);
CREATE INDEX IF NOT EXISTS idx_header_title_user_id ON header_title(user_id);
CREATE INDEX IF NOT EXISTS idx_shares_share_id ON shares(share_id);
CREATE INDEX IF NOT EXISTS idx_shares_user_id ON shares(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE global_krs ENABLE ROW LEVEL SECURITY;
ALTER TABLE filter_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE header_title ENABLE ROW LEVEL SECURITY;
ALTER TABLE shares ENABLE ROW LEVEL SECURITY;

-- RLS Policies for projects table
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for global_krs table
CREATE POLICY "Users can view their own global KRs" ON global_krs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own global KRs" ON global_krs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own global KRs" ON global_krs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own global KRs" ON global_krs
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for filter_state table
CREATE POLICY "Users can view their own filter state" ON filter_state
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own filter state" ON filter_state
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own filter state" ON filter_state
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own filter state" ON filter_state
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for header_title table
CREATE POLICY "Users can view their own header title" ON header_title
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own header title" ON header_title
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own header title" ON header_title
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own header title" ON header_title
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for shares table
CREATE POLICY "Users can view their own shares" ON shares
  FOR SELECT USING (auth.uid() = user_id OR auth.uid() = owner_id);

CREATE POLICY "Users can insert their own shares" ON shares
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own shares" ON shares
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own shares" ON shares
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_global_krs_updated_at BEFORE UPDATE ON global_krs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_filter_state_updated_at BEFORE UPDATE ON filter_state
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_header_title_updated_at BEFORE UPDATE ON header_title
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shares_updated_at BEFORE UPDATE ON shares
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
