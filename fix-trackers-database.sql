-- Fix trackers database issues
-- This script addresses duplicate trackers, null emails, and null display names

-- Step 1: Check current state
SELECT 
  'Current state check' as step,
  COUNT(*) as total_trackers,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN tracker_display_name IS NULL THEN 1 END) as null_display_names,
  COUNT(CASE WHEN owner_email IS NULL THEN 1 END) as null_emails
FROM trackers;

-- Step 2: Show duplicate trackers
SELECT 
  'Duplicate trackers' as step,
  user_id, 
  COUNT(*) as tracker_count,
  STRING_AGG(id::text, ', ') as tracker_ids
FROM trackers 
GROUP BY user_id 
HAVING COUNT(*) > 1;

-- Step 3: Delete duplicate trackers, keeping only the most recent one
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

-- Step 4: Update null display names to 'New Board'
UPDATE trackers 
SET tracker_display_name = 'New Board'
WHERE tracker_display_name IS NULL;

-- Step 5: Update null tracker names to 'New Board'
UPDATE trackers 
SET tracker_name = 'New Board'
WHERE tracker_name IS NULL OR tracker_name = '';

-- Step 6: Verify the fixes
SELECT 
  'After fixes' as step,
  COUNT(*) as total_trackers,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(CASE WHEN tracker_display_name IS NULL THEN 1 END) as null_display_names,
  COUNT(CASE WHEN tracker_name IS NULL OR tracker_name = '' THEN 1 END) as null_tracker_names
FROM trackers;

-- Step 7: Show final state
SELECT 
  id,
  user_id,
  tracker_display_name,
  tracker_name,
  created_at,
  updated_at
FROM trackers 
ORDER BY user_id, created_at;
