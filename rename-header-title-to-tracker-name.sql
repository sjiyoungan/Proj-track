-- Rename header_title column to tracker_name in the trackers table
-- This script will rename the column while preserving all existing data

-- Step 1: Add the new column
ALTER TABLE trackers ADD COLUMN tracker_name TEXT DEFAULT '';

-- Step 2: Copy data from old column to new column
UPDATE trackers SET tracker_name = header_title WHERE header_title IS NOT NULL;

-- Step 3: Drop the old column
ALTER TABLE trackers DROP COLUMN header_title;

-- Step 4: Update the default value for the new column
ALTER TABLE trackers ALTER COLUMN tracker_name SET DEFAULT '';

-- Verify the change
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'trackers' AND column_name IN ('tracker_name', 'header_title');
