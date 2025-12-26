# Database Migrations

This document describes the database migration workflow and contains reference SQL migrations.

## Migration Workflow

**IMPORTANT**: All schema changes must go through the formal migration system.

### How to Change DB Schema

1. **Add migration file**: Create a new file in `supabase/migrations/` with timestamp prefix:
   ```
   supabase/migrations/YYYYMMDDHHMMSS_description.sql
   ```

2. **Apply locally**: Run the migration against your local/dev database:
   - Via Supabase CLI: `supabase db reset` (if using local Supabase)
   - Or manually via Supabase SQL editor

3. **Regenerate types**: Update TypeScript types to match the new schema:
   ```bash
   # If using Supabase CLI:
   supabase gen types typescript --local > lib/supabase/database.types.ts
   
   # Or manually update lib/supabase/database.types.ts to match the new schema
   ```

4. **Commit everything**: Commit the migration file + regenerated types together

### Rules

- ✅ **Always** put schema-changing SQL in `supabase/migrations/`
- ❌ **Never** put migrations only in `/docs/sql` (those are reference docs only)
- ✅ **Always** regenerate types after applying migrations
- ✅ **Always** run `pnpm check:schema` before committing to catch drift

### Schema Drift Prevention

The `pnpm check:schema` script enforces that:
- Code doesn't reference columns that don't exist in production
- Types stay in sync with actual database schema

Run it as part of your pre-commit checks or CI pipeline.

---

## Reference Migrations

The following are historical migrations kept for reference:

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

## Hypothesis-First Inputs (Starting Point & Hypothesis Fields)

Add nullable fields to support pre-product users and hypothesis-driven analysis:

```sql
-- Add new nullable fields to projects table
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS starting_point TEXT CHECK (starting_point IN ('product', 'problem', 'customer', 'market')),
  ADD COLUMN IF NOT EXISTS hypothesis TEXT,
  ADD COLUMN IF NOT EXISTS problem_statement TEXT,
  ADD COLUMN IF NOT EXISTS customer_profile TEXT,
  ADD COLUMN IF NOT EXISTS market_context TEXT,
  ADD COLUMN IF NOT EXISTS solution_idea TEXT;

-- Note: input_confidence already exists, but if it doesn't match the new enum values, update it:
-- The existing enum values ('very_confident', 'some_assumptions', 'exploratory') should work,
-- but if you need to align with the new naming, you can update:
-- UPDATE projects SET input_confidence = 'exploring' WHERE input_confidence = 'exploratory';
-- Then alter the constraint if needed.
```

These fields are all nullable to maintain backward compatibility with existing projects.

