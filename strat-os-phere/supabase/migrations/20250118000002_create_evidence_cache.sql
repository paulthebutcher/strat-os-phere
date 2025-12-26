-- Migration: Create evidence_cache table
-- Purpose: Cache fetched and extracted web content to optimize evidence fetching
-- This table stores normalized URL content with caching metadata

CREATE TABLE IF NOT EXISTS public.evidence_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_url TEXT NOT NULL UNIQUE,
  content_hash TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  http_status INTEGER,
  final_url TEXT,
  title TEXT,
  raw_text TEXT,
  extract_json JSONB,
  summary_json JSONB,
  summary_prompt_version TEXT,
  stale_after_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for normalized_url (already has unique constraint, but explicit index helps)
CREATE INDEX IF NOT EXISTS idx_evidence_cache_normalized_url 
  ON public.evidence_cache(normalized_url);

-- Index for content_hash (for deduplication checks)
CREATE INDEX IF NOT EXISTS idx_evidence_cache_content_hash 
  ON public.evidence_cache(content_hash);

-- Index for fetched_at (for freshness queries)
CREATE INDEX IF NOT EXISTS idx_evidence_cache_fetched_at 
  ON public.evidence_cache(fetched_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_evidence_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_evidence_cache_updated_at ON public.evidence_cache;
CREATE TRIGGER update_evidence_cache_updated_at
  BEFORE UPDATE ON public.evidence_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_evidence_cache_updated_at();

-- RLS policies
-- Note: Evidence cache is intended to be shared across users to optimize fetching.
-- For now, we use authenticated user policies. If cache should be global/service-role only,
-- update policies to use service role or remove RLS.
ALTER TABLE public.evidence_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read cached evidence
CREATE POLICY "Users can view evidence cache"
  ON public.evidence_cache
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Allow all authenticated users to insert/update cache
CREATE POLICY "Users can manage evidence cache"
  ON public.evidence_cache
  FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

