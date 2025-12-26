-- Migration: Add updated_at and error columns to analysis_runs table
-- PR 1.5: Formalize DB migrations, regenerate Supabase types, remove DB field shims
--
-- This migration adds:
-- 1. updated_at column with auto-update trigger
-- 2. error jsonb column for structured error storage (replaces/extends error_message)

-- Add updated_at column with default
ALTER TABLE analysis_runs 
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Add error jsonb column for structured errors
ALTER TABLE analysis_runs 
  ADD COLUMN IF NOT EXISTS error JSONB;

-- Create function to update updated_at timestamp on row update
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-update updated_at on row updates
DROP TRIGGER IF EXISTS update_analysis_runs_updated_at ON analysis_runs;
CREATE TRIGGER update_analysis_runs_updated_at
  BEFORE UPDATE ON analysis_runs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Backfill: Copy error_message text into error jsonb for existing records
-- This preserves existing error data while migrating to structured format
UPDATE analysis_runs
SET error = jsonb_build_object('message', error_message, 'code', 'INTERNAL_ERROR')
WHERE error_message IS NOT NULL 
  AND error IS NULL;

-- Backfill: Set updated_at to created_at for existing records where it's not set
UPDATE analysis_runs
SET updated_at = created_at
WHERE updated_at IS NULL;

