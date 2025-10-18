-- Fix existing trackers that don't have tracker_id
UPDATE trackers 
SET tracker_id = gen_random_uuid() 
WHERE tracker_id IS NULL;

-- Update the RPC function to handle the sharing part
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
    t.tracker_id,
    COALESCE(t.tracker_name, '') as tracker_name,
    COALESCE(t.tracker_display_name, t.tracker_name, 'My Tracker') as tracker_display_name,
    TRUE as is_owner,
    'edit'::TEXT as access_level,
    u.email as owner_email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as owner_name
  FROM trackers t
  JOIN auth.users u ON t.user_id = u.id
  WHERE u.email = user_email
  
  UNION ALL
  
  -- Get trackers shared with the user
  SELECT 
    t.tracker_id,
    COALESCE(t.tracker_name, '') as tracker_name,
    COALESCE(t.tracker_display_name, t.tracker_name, 'Shared Tracker') as tracker_display_name,
    FALSE as is_owner,
    sp.access_level,
    u.email as owner_email,
    COALESCE(u.raw_user_meta_data->>'name', u.email) as owner_name
  FROM sharing_permissions sp
  JOIN trackers t ON sp.tracker_id = t.tracker_id
  JOIN auth.users u ON t.user_id = u.id
  WHERE sp.shared_with_email = user_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
