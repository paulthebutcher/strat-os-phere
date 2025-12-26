-- Migration: Create artifacts table
-- Purpose: Store analysis outputs (profiles, synthesis, opportunities, etc.) as versioned JSON artifacts
-- Artifacts are append-only and associated with projects via project_id

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

-- Index for efficient queries by project and created_at (for latest artifact queries)
CREATE INDEX IF NOT EXISTS idx_artifacts_project_created 
  ON public.artifacts(project_id, created_at DESC);

-- Index on type alone (for cross-project artifact type queries if needed)
CREATE INDEX IF NOT EXISTS idx_artifacts_type 
  ON public.artifacts(type);

-- RLS policies
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

-- Note: Artifacts are append-only, so no UPDATE or DELETE policies

