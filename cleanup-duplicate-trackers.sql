-- Clean up duplicate tracker entries
-- This script removes duplicate trackers for the same user, keeping only the most recent one

-- Step 1: Check for duplicate trackers
SELECT 
  user_id, 
  COUNT(*) as tracker_count,
  STRING_AGG(id::text, ', ') as tracker_ids
FROM trackers 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Step 2: Delete duplicate trackers, keeping only the most recent one
WITH ranked_trackers AS (
  SELECT 
    id,
    user_id,
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY updated_at DESC, created_at DESC) as rn
  FROM trackers
)
DELETE FROM trackers 
WHERE id IN (
  SELECT id 
  FROM ranked_trackers 
  WHERE rn > 1
);

-- Step 3: Verify cleanup
SELECT 
  user_id, 
  COUNT(*) as tracker_count
FROM trackers 
GROUP BY user_id 
ORDER BY tracker_count DESC;

-- Step 4: Show final state
SELECT 
  'Cleanup completed!' as status,
  COUNT(*) as total_trackers_remaining,
  COUNT(DISTINCT user_id) as unique_users
FROM trackers;
