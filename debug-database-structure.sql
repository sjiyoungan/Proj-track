-- Check if trackers table exists and its structure
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'trackers'
ORDER BY ordinal_position;

-- If no results, check what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%tracker%' OR table_name LIKE '%project%' OR table_name LIKE '%header%';
