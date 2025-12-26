-- Migration: Create artifacts table
-- Purpose: Store analysis outputs (profiles, synthesis, opportunities, etc.) as JSON artifacts
-- This table references projects and must be created after projects table

CREATE TABLE IF NOT EXISTS public.artifacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  content_json JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for efficient queries by project
CREATE INDEX IF NOT EXISTS idx_artifacts_project_id 
  ON public.artifacts(project_id);

-- Index for efficient queries by project and type
CREATE INDEX IF NOT EXISTS idx_artifacts_project_type 
  ON public.artifacts(project_id, type);

-- Index for efficient queries by project and creation date (for latest artifact queries)
CREATE INDEX IF NOT EXISTS idx_artifacts_project_created 
  ON public.artifacts(project_id, created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.artifacts ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view artifacts for their own projects
CREATE POLICY "Users can view artifacts for their own projects"
  ON public.artifacts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.artifacts.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can insert artifacts for their own projects
CREATE POLICY "Users can insert artifacts for their own projects"
  ON public.artifacts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.artifacts.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can delete artifacts for their own projects
CREATE POLICY "Users can delete artifacts for their own projects"
  ON public.artifacts
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.artifacts.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

