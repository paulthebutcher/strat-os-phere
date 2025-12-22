-- Migration: Create evidence_cache table for optimized evidence fetching
-- Run this in your Supabase SQL editor or via migration tool

-- Table to cache fetched and extracted web content
CREATE TABLE IF NOT EXISTS evidence_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_url TEXT NOT NULL UNIQUE,
  content_hash TEXT NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  http_status INTEGER,
  final_url TEXT,
  title TEXT,
  raw_text TEXT,
  extract_json JSONB,
  summary_json JSONB,
  summary_prompt_version TEXT,
  stale_after_days INTEGER NOT NULL DEFAULT 7,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_evidence_cache_normalized_url ON evidence_cache(normalized_url);
CREATE INDEX IF NOT EXISTS idx_evidence_cache_content_hash ON evidence_cache(content_hash);
CREATE INDEX IF NOT EXISTS idx_evidence_cache_fetched_at ON evidence_cache(fetched_at DESC);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_evidence_cache_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER update_evidence_cache_updated_at
  BEFORE UPDATE ON evidence_cache
  FOR EACH ROW
  EXECUTE FUNCTION update_evidence_cache_updated_at();

-- RLS policies (adjust based on your auth setup)
ALTER TABLE evidence_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all authenticated users to read cached evidence
CREATE POLICY "Users can view evidence cache"
  ON evidence_cache FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- Policy: Allow all authenticated users to insert/update cache
CREATE POLICY "Users can manage evidence cache"
  ON evidence_cache FOR ALL
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

