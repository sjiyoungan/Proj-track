-- Test database connection and run cleanup
-- This script will help verify the database is working and clean up duplicates

-- Test 1: Check if trackers table exists and has data
SELECT 
  'Table exists check' as test_name,
  COUNT(*) as total_trackers,
  COUNT(DISTINCT user_id) as unique_users
FROM trackers;

-- Test 2: Check for duplicate trackers
SELECT 
  'Duplicate check' as test_name,
  user_id, 
  COUNT(*) as tracker_count,
  STRING_AGG(id::text, ', ') as tracker_ids
FROM trackers 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Test 3: Show sample data structure
SELECT 
  'Sample data' as test_name,
  id,
  user_id,
  tracker_name,
  created_at,
  updated_at
FROM trackers 
LIMIT 3;
