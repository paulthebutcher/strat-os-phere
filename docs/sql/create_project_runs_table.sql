-- Migration: Create project_runs table for append-only run records
-- Run this in your Supabase SQL editor or via migration tool
-- 
-- Purpose: Store analysis execution runs as append-only records.
-- This replaces storing derived run state on projects (no projects.latest_* fields).
-- Runs become the source of truth for execution status and artifacts.

CREATE TABLE IF NOT EXISTS project_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  input_version INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  error_code TEXT,
  error_message TEXT,
  error_detail TEXT,
  output JSONB,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT NOT NULL
);

-- Unique constraint on idempotency_key to ensure idempotent runs
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_runs_idempotency_key 
  ON project_runs(idempotency_key);

-- Index for finding latest run by project
CREATE INDEX IF NOT EXISTS idx_project_runs_project_created 
  ON project_runs(project_id, created_at DESC);

-- Index for filtering runs by project and status
CREATE INDEX IF NOT EXISTS idx_project_runs_project_status 
  ON project_runs(project_id, status);

-- RLS policies (if using Row Level Security)
ALTER TABLE project_runs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view runs for their own projects
CREATE POLICY "Users can view runs for their own projects"
  ON project_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_runs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policy: Users can create runs for their own projects
CREATE POLICY "Users can create runs for their own projects"
  ON project_runs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_runs.project_id
      AND projects.user_id = auth.uid()
    )
  );

-- Policy: Users can update runs for their own projects
CREATE POLICY "Users can update runs for their own projects"
  ON project_runs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM projects
      WHERE projects.id = project_runs.project_id
      AND projects.user_id = auth.uid()
    )
  );

