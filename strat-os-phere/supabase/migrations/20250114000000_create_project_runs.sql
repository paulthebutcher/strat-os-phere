-- Migration: Create project_runs table
-- PR: Fix Supabase drift - add project_runs create-table migration
--
-- This migration creates the project_runs table for run orchestration,
-- committed results, and dashboards. This table must exist before
-- 20250116000000_add_committed_at_to_project_runs.sql.

CREATE TABLE public.project_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  input_version INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'running', 'succeeded', 'failed')),
  started_at TIMESTAMPTZ NULL,
  finished_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  error_code TEXT NULL,
  error_message TEXT NULL,
  error_detail TEXT NULL,
  output JSONB NULL,
  metrics JSONB NOT NULL DEFAULT '{}'::jsonb,
  idempotency_key TEXT NOT NULL
);

-- Unique index on idempotency_key to ensure idempotent runs
CREATE UNIQUE INDEX idx_project_runs_idempotency_key 
  ON public.project_runs(idempotency_key);

-- Index for finding latest run by project
CREATE INDEX idx_project_runs_project_created 
  ON public.project_runs(project_id, created_at DESC);

-- Index for filtering runs by project and status
CREATE INDEX idx_project_runs_project_status 
  ON public.project_runs(project_id, status);

-- Enable Row Level Security
ALTER TABLE public.project_runs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view runs for their own projects
CREATE POLICY "Users can view runs for their own projects"
  ON public.project_runs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_runs.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can insert runs for their own projects
CREATE POLICY "Users can insert runs for their own projects"
  ON public.project_runs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_runs.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can update runs for their own projects
-- IMPORTANT: Includes both USING and WITH CHECK clauses
CREATE POLICY "Users can update runs for their own projects"
  ON public.project_runs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_runs.project_id
      AND public.projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_runs.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

