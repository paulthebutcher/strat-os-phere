-- Migration: Add run_id column to evidence_sources table
-- Purpose: Link evidence sources to specific project runs for better traceability
-- This migration is idempotent and safe to run multiple times

-- Add run_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public'
    AND table_name = 'evidence_sources' 
    AND column_name = 'run_id'
  ) THEN
    ALTER TABLE public.evidence_sources 
    ADD COLUMN run_id UUID REFERENCES public.project_runs(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add index for efficient queries by run_id
CREATE INDEX IF NOT EXISTS idx_evidence_sources_run_id 
  ON public.evidence_sources(run_id)
  WHERE run_id IS NOT NULL;

-- Add composite index for project and run queries
CREATE INDEX IF NOT EXISTS idx_evidence_sources_project_run 
  ON public.evidence_sources(project_id, run_id)
  WHERE run_id IS NOT NULL;

