-- Migration: Create project_inputs table for versioned JSON inputs
-- Purpose: Store evolving onboarding fields (hypothesis, decision framing, market context, etc.)
-- in versioned JSON records instead of adding columns to projects table.
-- This prevents schema drift when onboarding fields evolve.

CREATE TABLE IF NOT EXISTS public.project_inputs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  version INT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'final')),
  input_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Unique constraint: one version per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_project_inputs_project_version 
  ON public.project_inputs(project_id, version);

-- Index for finding latest input by project and status
CREATE INDEX IF NOT EXISTS idx_project_inputs_project_status 
  ON public.project_inputs(project_id, status);

-- Index for version ordering (descending for latest first)
CREATE INDEX IF NOT EXISTS idx_project_inputs_project_version_desc 
  ON public.project_inputs(project_id, version DESC);

-- RLS policies
ALTER TABLE public.project_inputs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view inputs for their own projects
CREATE POLICY "Users can view inputs for their own projects"
  ON public.project_inputs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_inputs.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can create inputs for their own projects
CREATE POLICY "Users can create inputs for their own projects"
  ON public.project_inputs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_inputs.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can update inputs for their own projects
CREATE POLICY "Users can update inputs for their own projects"
  ON public.project_inputs
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.project_inputs.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

