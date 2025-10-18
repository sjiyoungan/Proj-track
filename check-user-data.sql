-- Check all tables and their data for your user
-- Replace 'YOUR_USER_ID' with your actual user ID from the console logs

-- 1. Check projects table
SELECT 
  id,
  user_id,
  name,
  plan,
  initiative,
  design_status,
  build_status,
  created_at,
  updated_at
FROM projects 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY priority;

-- 2. Check global KRs table
SELECT 
  id,
  user_id,
  text,
  fill_color,
  text_color,
  order_index,
  created_at
FROM global_krs 
WHERE user_id = 'YOUR_USER_ID'
ORDER BY order_index;

-- 3. Check filter state table
SELECT 
  id,
  user_id,
  show_initiative,
  show_kr,
  show_plan,
  show_done,
  show_future,
  sort_by,
  updated_at
FROM filter_state 
WHERE user_id = 'YOUR_USER_ID';

-- 4. Check header title table
SELECT 
  id,
  user_id,
  title,
  updated_at
FROM header_title 
WHERE user_id = 'YOUR_USER_ID';

-- 5. Check shares table
SELECT 
  share_id,
  user_id,
  owner_id,
  is_active,
  created_at
FROM shares 
WHERE user_id = 'YOUR_USER_ID' OR owner_id = 'YOUR_USER_ID';

-- 6. See all users and their data counts
SELECT 
  u.id as user_id,
  u.email,
  COUNT(DISTINCT p.id) as project_count,
  COUNT(DISTINCT k.id) as kr_count,
  COUNT(DISTINCT f.id) as filter_count,
  COUNT(DISTINCT h.id) as header_count
FROM auth.users u
LEFT JOIN projects p ON u.id = p.user_id
LEFT JOIN global_krs k ON u.id = k.user_id
LEFT JOIN filter_state f ON u.id = f.user_id
LEFT JOIN header_title h ON u.id = h.user_id
GROUP BY u.id, u.email
ORDER BY u.created_at DESC;
