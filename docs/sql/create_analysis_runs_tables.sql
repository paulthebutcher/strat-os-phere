-- REFERENCE ONLY - DO NOT RUN DIRECTLY
-- This table has been replaced by project_runs. See:
-- strat-os-phere/supabase/migrations/20250114000000_create_project_runs.sql
--
-- Migration: Create analysis_runs and analysis_run_events tables
-- Run this in your Supabase SQL editor or via migration tool

-- Table to track analysis runs
CREATE TABLE IF NOT EXISTS analysis_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'running', 'completed', 'failed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  last_heartbeat_at TIMESTAMPTZ,
  current_phase TEXT,
  percent INTEGER CHECK (percent >= 0 AND percent <= 100),
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table to store progress events for each run
CREATE TABLE IF NOT EXISTS analysis_run_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES analysis_runs(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  level TEXT NOT NULL CHECK (level IN ('info', 'warn', 'error')),
  phase TEXT,
  message TEXT NOT NULL,
  meta JSONB
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analysis_runs_project_id ON analysis_runs(project_id);
CREATE INDEX IF NOT EXISTS idx_analysis_runs_status ON analysis_runs(status) WHERE status IN ('running', 'queued');
CREATE INDEX IF NOT EXISTS idx_analysis_runs_project_status ON analysis_runs(project_id, status) WHERE status IN ('running', 'queued');
CREATE INDEX IF NOT EXISTS idx_analysis_run_events_run_id ON analysis_run_events(run_id);
CREATE INDEX IF NOT EXISTS idx_analysis_run_events_created_at ON analysis_run_events(created_at DESC);

-- RLS policies (adjust based on your auth setup)
ALTER TABLE analysis_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_run_events ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see runs for their own projects
CREATE POLICY "Users can view their own analysis runs"
  ON analysis_runs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = analysis_runs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policy: Users can insert runs for their own projects
CREATE POLICY "Users can create runs for their own projects"
  ON analysis_runs FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = analysis_runs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policy: Users can update runs for their own projects
CREATE POLICY "Users can update their own analysis runs"
  ON analysis_runs FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = analysis_runs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policy: Users can view events for their own runs
CREATE POLICY "Users can view events for their own runs"
  ON analysis_run_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM analysis_runs
      JOIN projects ON projects.id = analysis_runs.project_id
      WHERE analysis_runs.id = analysis_run_events.run_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policy: Users can insert events for their own runs
CREATE POLICY "Users can create events for their own runs"
  ON analysis_run_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM analysis_runs
      JOIN projects ON projects.id = analysis_runs.project_id
      WHERE analysis_runs.id = analysis_run_events.run_id
      AND projects.user_id = auth.uid()
    )
  );

