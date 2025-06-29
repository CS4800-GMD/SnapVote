-- SnapVote migration: enforce one vote per poll per session
-- Run this in your Supabase SQL editor

-- 1. Ensure votes table contains poll_id column that mirrors the option's poll_id
ALTER TABLE votes
ADD COLUMN IF NOT EXISTS poll_id UUID;

-- Populate poll_id for existing rows
UPDATE votes v
SET poll_id = o.poll_id
FROM options o
WHERE v.option_id = o.id
  AND v.poll_id IS NULL;

-- 2. Add foreign-key and unique constraints (safe-guarded by IF NOT EXISTS)
DO $$
BEGIN
  -- FK
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'votes_poll_id_fkey'
  ) THEN
    ALTER TABLE votes
      ADD CONSTRAINT votes_poll_id_fkey FOREIGN KEY (poll_id)
      REFERENCES polls(id) ON DELETE CASCADE;
  END IF;

  -- Uniqueness (one vote per session per poll)
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_vote_per_session_per_poll'
  ) THEN
    ALTER TABLE votes
      ADD CONSTRAINT unique_vote_per_session_per_poll UNIQUE (poll_id, session_id);
  END IF;
END $$; 