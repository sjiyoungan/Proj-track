-- Test and fix the get_user_trackers function
-- First, let's check if the tracker_id column exists and has data
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trackers' AND column_name = 'tracker_id';

-- Check if there are any trackers with tracker_id
SELECT tracker_id, user_id, tracker_name FROM trackers LIMIT 5;

-- Create a simpler version of the function for testing
CREATE OR REPLACE FUNCTION get_user_trackers(user_email TEXT)
RETURNS TABLE (
  tracker_id UUID,
  tracker_name TEXT,
  tracker_display_name TEXT,
  is_owner BOOLEAN,
  access_level TEXT,
  owner_email TEXT,
  owner_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  -- Get trackers owned by the user
  SELECT 
    COALESCE(t.tracker_id, gen_random_uuid()) as tracker_id,
    COALESCE(t.tracker_name, '') as tracker_name,
    COALESCE(t.tracker_display_name, t.tracker_name, 'My Tracker') as tracker_display_name,
    TRUE as is_owner,
    'edit'::TEXT as access_level,
    u.email as owner_email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as owner_name
  FROM trackers t
  JOIN auth.users u ON t.user_id = u.id
  WHERE u.email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
