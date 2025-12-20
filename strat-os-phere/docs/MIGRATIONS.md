# Database Migrations

This document contains SQL migrations for the database schema.

## Evidence Sources Table

Create the `evidence_sources` table to store scraped web content:

```sql
-- Create evidence_sources table
CREATE TABLE IF NOT EXISTS evidence_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  competitor_id UUID REFERENCES competitors(id) ON DELETE SET NULL,
  domain TEXT NOT NULL,
  url TEXT NOT NULL,
  extracted_text TEXT NOT NULL,
  page_title TEXT,
  extracted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Indexes for efficient queries
  CONSTRAINT evidence_sources_project_id_fkey FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
  CONSTRAINT evidence_sources_competitor_id_fkey FOREIGN KEY (competitor_id) REFERENCES competitors(id) ON DELETE SET NULL
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_evidence_sources_project_id ON evidence_sources(project_id);
CREATE INDEX IF NOT EXISTS idx_evidence_sources_domain ON evidence_sources(project_id, domain);
CREATE INDEX IF NOT EXISTS idx_evidence_sources_competitor_id ON evidence_sources(competitor_id);
CREATE INDEX IF NOT EXISTS idx_evidence_sources_extracted_at ON evidence_sources(extracted_at);

-- Add evidence_citations column to competitors table (optional JSONB field)
ALTER TABLE competitors ADD COLUMN IF NOT EXISTS evidence_citations JSONB;
```

## Row Level Security (RLS)

Add RLS policies for `evidence_sources`:

```sql
-- Enable RLS on evidence_sources
ALTER TABLE evidence_sources ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access evidence_sources for projects they own
CREATE POLICY "Users can view evidence_sources for their own projects"
  ON evidence_sources
  FOR SELECT
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can insert evidence_sources for their own projects
CREATE POLICY "Users can insert evidence_sources for their own projects"
  ON evidence_sources
  FOR INSERT
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can update evidence_sources for their own projects
CREATE POLICY "Users can update evidence_sources for their own projects"
  ON evidence_sources
  FOR UPDATE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- Policy: Users can delete evidence_sources for their own projects
CREATE POLICY "Users can delete evidence_sources for their own projects"
  ON evidence_sources
  FOR DELETE
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );
```

