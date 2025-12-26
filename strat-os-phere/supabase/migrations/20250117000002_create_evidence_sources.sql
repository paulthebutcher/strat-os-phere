-- Migration: Create evidence_sources table
-- Purpose: Store scraped web content as evidence for competitive analysis
-- Based on PR4 evidence normalization + coverage gating

CREATE TABLE IF NOT EXISTS public.evidence_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES public.competitors(id) ON DELETE SET NULL,
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  extracted_text TEXT NOT NULL,
  page_title TEXT,
  source_type TEXT NOT NULL DEFAULT 'marketing_site',
  source_date_range TEXT, -- e.g., "last 90 days"
  source_confidence TEXT CHECK (source_confidence IN ('low', 'medium', 'high')),
  extracted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraint for deduplication (project_id, url)
-- This ensures we don't insert duplicate evidence for the same project/URL
CREATE UNIQUE INDEX IF NOT EXISTS evidence_sources_project_url_unique 
  ON public.evidence_sources(project_id, url);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_evidence_sources_project_id 
  ON public.evidence_sources(project_id);

CREATE INDEX IF NOT EXISTS idx_evidence_sources_project_competitor 
  ON public.evidence_sources(project_id, competitor_id) 
  WHERE competitor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_evidence_sources_project_type 
  ON public.evidence_sources(project_id, source_type);

CREATE INDEX IF NOT EXISTS idx_evidence_sources_domain 
  ON public.evidence_sources(domain);

-- Index for extracted_at to support freshness queries
CREATE INDEX IF NOT EXISTS idx_evidence_sources_extracted_at 
  ON public.evidence_sources(extracted_at DESC);

-- RLS policies
ALTER TABLE public.evidence_sources ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view evidence sources for their own projects
CREATE POLICY "Users can view evidence sources"
  ON public.evidence_sources
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE public.projects.id = public.evidence_sources.project_id 
      AND public.projects.user_id = auth.uid()
    )
  );

-- Policy: Users can manage evidence sources for their own projects
CREATE POLICY "Users can manage evidence sources"
  ON public.evidence_sources
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE public.projects.id = public.evidence_sources.project_id 
      AND public.projects.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.projects 
      WHERE public.projects.id = public.evidence_sources.project_id 
      AND public.projects.user_id = auth.uid()
    )
  );

