-- Migration: Add committed_at column to project_runs table
-- PR: Make "Committed Results" Explicit + Success-Dependent
--
-- This migration adds:
-- 1. committed_at TIMESTAMPTZ NULL column to project_runs
--    - NULL means the run is not committed
--    - Non-NULL means the run results are committed and ready for use
--    - Only runs with required artifacts can be committed

-- Add committed_at column
ALTER TABLE project_runs 
  ADD COLUMN IF NOT EXISTS committed_at TIMESTAMPTZ NULL;

-- Add index for efficient queries of committed runs
CREATE INDEX IF NOT EXISTS idx_project_runs_committed_at 
  ON project_runs(project_id, committed_at DESC) 
  WHERE committed_at IS NOT NULL;

