-- Add expiration column to existing polls table
-- Run this in your Supabase SQL Editor

ALTER TABLE polls ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE; 