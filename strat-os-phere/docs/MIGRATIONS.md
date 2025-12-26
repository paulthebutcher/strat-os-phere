# Database Migrations

This document describes the database migration workflow and contains reference SQL migrations.

## Migration Workflow

**IMPORTANT**: All schema changes must go through the formal migration system.

### How to Change DB Schema

1. **Add migration file**: Create a new file in `supabase/migrations/` with timestamp prefix:
   ```
   supabase/migrations/YYYYMMDDHHMMSS_description.sql
   ```

2. **Apply migrations**: Run the migration against your database:
   - **Remote (production/staging)**: `supabase db push`
   - **Local/Dev**: `supabase db reset` (if using local Supabase)
   - Or manually via Supabase SQL editor

3. **Regenerate types**: Update TypeScript types to match the new schema:
   ```bash
   # For local Supabase:
   supabase gen types typescript --local > lib/supabase/database.types.ts
   
   # For remote Supabase (production/staging):
   supabase gen types typescript --project-id <your-project-id> > lib/supabase/database.types.ts
   ```
   
   **Output path**: `strat-os-phere/lib/supabase/database.types.ts`

4. **Commit everything**: Commit the migration file + regenerated types together

### Authoritative Workflow

The authoritative workflow for schema changes is:

1. **Create migration file** in `supabase/migrations/` with timestamp prefix
2. **Apply to database** using `supabase db push` (remote) or `supabase db reset` (local)
3. **Regenerate types** using `supabase gen types typescript` with appropriate flags
4. **Verify** by running `pnpm run build` to ensure types compile
5. **Commit** migration file + regenerated types together

### Rules

- ✅ **Always** put schema-changing SQL in `supabase/migrations/`
- ❌ **Never** put migrations only in `/docs/sql` (those are reference docs only and marked as such)
- ✅ **Always** regenerate types after applying migrations
- ✅ **Always** run `pnpm check:schema` before committing to catch drift

### Schema Drift Prevention

The `pnpm check:schema` script enforces that:
- Code doesn't reference columns that don't exist in production
- Types stay in sync with actual database schema

Run it as part of your pre-commit checks or CI pipeline.

### Quick Verification

To verify that core tables exist in your database, run this SQL:

```sql
SELECT
  to_regclass('public.projects') IS NOT NULL AS has_projects,
  to_regclass('public.project_runs') IS NOT NULL AS has_project_runs,
  to_regclass('public.competitors') IS NOT NULL AS has_competitors,
  to_regclass('public.evidence_sources') IS NOT NULL AS has_evidence_sources,
  to_regclass('public.artifacts') IS NOT NULL AS has_artifacts;
```

To verify that `project_runs` has the expected columns (including `committed_at`):

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'project_runs'
ORDER BY ordinal_position;
```

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

