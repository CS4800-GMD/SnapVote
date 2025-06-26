-- SnapVote Complete Database Setup (Safe for existing databases)
-- Run this in your Supabase SQL Editor

-- Create polls table if it doesn't exist
CREATE TABLE IF NOT EXISTS polls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add expiration column if it doesn't exist
ALTER TABLE polls ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE;

-- Create options table if it doesn't exist
CREATE TABLE IF NOT EXISTS options (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  poll_id UUID REFERENCES polls(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table if it doesn't exist
CREATE TABLE IF NOT EXISTS votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  option_id UUID REFERENCES options(id) ON DELETE CASCADE,
  session_id UUID DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add session_id column if it doesn't exist (for existing tables)
ALTER TABLE votes ADD COLUMN IF NOT EXISTS session_id UUID DEFAULT gen_random_uuid();

-- Enable Row Level Security (RLS) - safe to run multiple times
ALTER TABLE polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE options ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Create policies for public read/write access (only if they don't exist)
DO $$
BEGIN
    -- Polls policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'polls' AND policyname = 'Allow public read access to polls') THEN
        CREATE POLICY "Allow public read access to polls" ON polls FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'polls' AND policyname = 'Allow public insert access to polls') THEN
        CREATE POLICY "Allow public insert access to polls" ON polls FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Options policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'options' AND policyname = 'Allow public read access to options') THEN
        CREATE POLICY "Allow public read access to options" ON options FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'options' AND policyname = 'Allow public insert access to options') THEN
        CREATE POLICY "Allow public insert access to options" ON options FOR INSERT WITH CHECK (true);
    END IF;
    
    -- Votes policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'votes' AND policyname = 'Allow public read access to votes') THEN
        CREATE POLICY "Allow public read access to votes" ON votes FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'votes' AND policyname = 'Allow public insert access to votes') THEN
        CREATE POLICY "Allow public insert access to votes" ON votes FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- Enable real-time for votes table (safe to run multiple times)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'votes'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE votes;
    END IF;
END $$; 