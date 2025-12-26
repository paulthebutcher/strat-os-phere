-- Migration: Add run_id column to evidence_sources table
-- Purpose: Link evidence sources to specific project runs for better traceability
-- This is an idempotent migration that adds the column if it doesn't exist

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
    ADD COLUMN run_id UUID;
  END IF;
END $$;

-- Add index on run_id for efficient queries
CREATE INDEX IF NOT EXISTS idx_evidence_sources_run_id 
  ON public.evidence_sources(run_id)
  WHERE run_id IS NOT NULL;

-- Add composite index on (project_id, run_id) for efficient filtering
CREATE INDEX IF NOT EXISTS idx_evidence_sources_project_run 
  ON public.evidence_sources(project_id, run_id)
  WHERE run_id IS NOT NULL;

-- Optional: Add foreign key constraint to project_runs (only if safe)
-- Note: Using ON DELETE SET NULL because evidence sources should persist even if run is deleted
-- Uncomment if you want referential integrity:
-- DO $$
-- BEGIN
--   IF NOT EXISTS (
--     SELECT 1 FROM information_schema.table_constraints 
--     WHERE constraint_schema = 'public'
--     AND table_name = 'evidence_sources'
--     AND constraint_name = 'fk_evidence_sources_run_id'
--   ) THEN
--     ALTER TABLE public.evidence_sources
--     ADD CONSTRAINT fk_evidence_sources_run_id
--     FOREIGN KEY (run_id) REFERENCES public.project_runs(id) ON DELETE SET NULL;
--   END IF;
-- END $$;

