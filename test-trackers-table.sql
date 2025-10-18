-- Quick test to verify trackers table exists and works
-- Run this in Supabase SQL Editor

-- 1. Check if trackers table exists and show its structure
SELECT 
  'Table exists: ' || CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trackers') 
    THEN 'YES' 
    ELSE 'NO' 
  END as status;

-- 2. Show table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'trackers' 
ORDER BY ordinal_position;

-- 3. Check if there are any trackers
SELECT 
  COUNT(*) as total_trackers,
  COUNT(DISTINCT user_id) as unique_users
FROM trackers;

-- 4. Test inserting a tracker (replace with your actual user ID)
-- First, let's see what users exist
SELECT id, email FROM auth.users LIMIT 5;

-- 5. Test insert (replace 'your-user-id-here' with an actual user ID from step 4)
-- INSERT INTO trackers (user_id, projects, global_krs, filter_state, tracker_name)
-- VALUES (
--   'your-user-id-here'::uuid,
--   '[]'::jsonb,
--   '[]'::jsonb,
--   '{"showInitiative": true, "showKR": true, "showPlan": true, "showDone": true, "showFuture": true, "sortBy": "priority-asc"}'::jsonb,
--   'Test Tracker'
-- );
