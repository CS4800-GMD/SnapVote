-- Fix votes table schema to handle session_id column
-- Run this in your Supabase SQL Editor

-- Option 1: Make session_id nullable (if you want to keep it but not require it)
ALTER TABLE votes ALTER COLUMN session_id DROP NOT NULL;

-- Option 2: If you want to remove the session_id column entirely (uncomment if needed)
-- ALTER TABLE votes DROP COLUMN IF EXISTS session_id;

-- Option 3: If you want to add a default value for session_id (uncomment if needed)
-- ALTER TABLE votes ALTER COLUMN session_id SET DEFAULT gen_random_uuid();

-- Verify the table structure
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'votes' 
ORDER BY ordinal_position; 