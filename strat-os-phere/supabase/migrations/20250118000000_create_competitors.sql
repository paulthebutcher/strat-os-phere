-- Migration: Create competitors table
-- Purpose: Store competitor companies with their primary websites for each project
-- This migration ensures the competitors table exists with proper schema, indexes, and RLS policies

CREATE TABLE IF NOT EXISTS public.competitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT,
  evidence_text TEXT,
  evidence_citations JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint: prevent duplicate URLs per project
CREATE UNIQUE INDEX IF NOT EXISTS idx_competitors_project_url 
  ON public.competitors(project_id, url)
  WHERE url IS NOT NULL;

-- Index for efficient queries by project
CREATE INDEX IF NOT EXISTS idx_competitors_project_created 
  ON public.competitors(project_id, created_at DESC);

-- Index for project_id (for joins)
CREATE INDEX IF NOT EXISTS idx_competitors_project_id 
  ON public.competitors(project_id);

-- RLS policies
ALTER TABLE public.competitors ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view competitors for their own projects
CREATE POLICY "Users can view their own project competitors"
  ON public.competitors
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.competitors.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can insert competitors for their own projects
CREATE POLICY "Users can insert competitors for their own projects"
  ON public.competitors
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.competitors.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can update competitors for their own projects
CREATE POLICY "Users can update competitors for their own projects"
  ON public.competitors
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.competitors.project_id
      AND public.projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.competitors.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can delete competitors for their own projects
CREATE POLICY "Users can delete competitors for their own projects"
  ON public.competitors
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE public.projects.id = public.competitors.project_id
      AND public.projects.user_id = auth.uid()
    )
  );

