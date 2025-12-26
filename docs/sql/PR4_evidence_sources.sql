-- REFERENCE ONLY - DO NOT RUN DIRECTLY
-- This SQL is for reference only. The actual migration is in:
-- strat-os-phere/supabase/migrations/20250117000002_create_evidence_sources.sql
--
-- Migration: PR4 - Evidence normalization + coverage gating
-- Ensures evidence_sources table has required columns, indexes, and constraints
-- Run this in your Supabase SQL editor or via migration tool

-- Ensure evidence_sources table exists (if not already created)
-- Note: This migration assumes the table may already exist, so we use ALTER TABLE IF EXISTS
-- If the table doesn't exist, create it first with a separate migration

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add project_id if missing (should already exist, but safe to check)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evidence_sources' AND column_name = 'project_id'
  ) THEN
    ALTER TABLE evidence_sources ADD COLUMN project_id UUID NOT NULL;
  END IF;

  -- Add competitor_id if missing (should already exist, but safe to check)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evidence_sources' AND column_name = 'competitor_id'
  ) THEN
    ALTER TABLE evidence_sources ADD COLUMN competitor_id UUID;
  END IF;

  -- Add url if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evidence_sources' AND column_name = 'url'
  ) THEN
    ALTER TABLE evidence_sources ADD COLUMN url TEXT NOT NULL;
  END IF;

  -- Add domain if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evidence_sources' AND column_name = 'domain'
  ) THEN
    ALTER TABLE evidence_sources ADD COLUMN domain TEXT NOT NULL;
  END IF;

  -- Add source_type if missing (use text for now if enum not stable)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evidence_sources' AND column_name = 'source_type'
  ) THEN
    ALTER TABLE evidence_sources ADD COLUMN source_type TEXT NOT NULL;
  END IF;

  -- Add page_title if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evidence_sources' AND column_name = 'page_title'
  ) THEN
    ALTER TABLE evidence_sources ADD COLUMN page_title TEXT;
  END IF;

  -- Add extracted_text if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evidence_sources' AND column_name = 'extracted_text'
  ) THEN
    ALTER TABLE evidence_sources ADD COLUMN extracted_text TEXT NOT NULL;
  END IF;

  -- Add extracted_at if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evidence_sources' AND column_name = 'extracted_at'
  ) THEN
    ALTER TABLE evidence_sources ADD COLUMN extracted_at TIMESTAMPTZ;
  END IF;

  -- Add source_confidence if missing
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'evidence_sources' AND column_name = 'source_confidence'
  ) THEN
    ALTER TABLE evidence_sources ADD COLUMN source_confidence TEXT;
  END IF;
END $$;

-- Create unique constraint for deduplication (project_id, url)
-- This ensures we don't insert duplicate evidence for the same project/URL
-- Using unique constraint instead of index for better upsert support
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'evidence_sources_project_url_unique'
  ) THEN
    ALTER TABLE evidence_sources 
    ADD CONSTRAINT evidence_sources_project_url_unique 
    UNIQUE (project_id, url);
  END IF;
END $$;

-- Create helpful indexes for coverage queries
CREATE INDEX IF NOT EXISTS idx_evidence_sources_project_id 
  ON evidence_sources(project_id);

CREATE INDEX IF NOT EXISTS idx_evidence_sources_project_competitor 
  ON evidence_sources(project_id, competitor_id) 
  WHERE competitor_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_evidence_sources_project_type 
  ON evidence_sources(project_id, source_type);

CREATE INDEX IF NOT EXISTS idx_evidence_sources_domain 
  ON evidence_sources(domain);

-- Index for extracted_at to support freshness queries
CREATE INDEX IF NOT EXISTS idx_evidence_sources_extracted_at 
  ON evidence_sources(extracted_at DESC);

-- Add constraint to ensure extracted_text is not empty (if not already present)
-- Note: PostgreSQL doesn't support CHECK constraints with length easily, 
-- so we rely on application-level validation

-- Add foreign key constraints if they don't exist (optional, for referential integrity)
-- Uncomment if you want to enforce referential integrity:
-- ALTER TABLE evidence_sources 
--   ADD CONSTRAINT fk_evidence_sources_project 
--   FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
--
-- ALTER TABLE evidence_sources 
--   ADD CONSTRAINT fk_evidence_sources_competitor 
--   FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE SET NULL;

-- RLS policies (if not already set up)
-- Ensure RLS is enabled
ALTER TABLE evidence_sources ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view evidence sources for their own projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'evidence_sources' AND policyname = 'Users can view evidence sources'
  ) THEN
    CREATE POLICY "Users can view evidence sources"
      ON evidence_sources FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM projects 
          WHERE projects.id = evidence_sources.project_id 
          AND projects.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Policy: Users can insert/update evidence sources for their own projects
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'evidence_sources' AND policyname = 'Users can manage evidence sources'
  ) THEN
    CREATE POLICY "Users can manage evidence sources"
      ON evidence_sources FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM projects 
          WHERE projects.id = evidence_sources.project_id 
          AND projects.user_id = auth.uid()
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM projects 
          WHERE projects.id = evidence_sources.project_id 
          AND projects.user_id = auth.uid()
        )
      );
  END IF;
END $$;

