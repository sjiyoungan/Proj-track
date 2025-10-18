-- Test script to verify database connection and table structure
-- Run this in your Supabase SQL Editor to check if everything is working

-- 1. Check if trackers table exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'trackers') 
    THEN '✅ trackers table exists' 
    ELSE '❌ trackers table does NOT exist' 
  END as table_status;

-- 2. Check trackers table structure
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default 
FROM information_schema.columns 
WHERE table_name = 'trackers' 
ORDER BY ordinal_position;

-- 3. Check if you have any data in trackers table
SELECT 
  COUNT(*) as total_trackers,
  COUNT(DISTINCT user_id) as unique_users
FROM trackers;

-- 4. Check RLS policies on trackers table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'trackers';

-- 5. Test insert permission (this should work if you're authenticated)
-- Note: This will only work if you're logged in as a user
INSERT INTO trackers (user_id, projects, global_krs, filter_state, tracker_name)
VALUES (
  auth.uid(),
  '[]'::jsonb,
  '[]'::jsonb,
  '{"showInitiative": true, "showKR": true, "showPlan": true, "showDone": true, "showFuture": true, "sortBy": "priority-asc"}'::jsonb,
  'Test Tracker'
)
ON CONFLICT (user_id) DO UPDATE SET
  tracker_name = EXCLUDED.tracker_name,
  updated_at = NOW();

-- 6. Check if the test insert worked
SELECT 
  'Test insert completed' as status,
  tracker_name,
  created_at,
  updated_at
FROM trackers 
WHERE user_id = auth.uid();
