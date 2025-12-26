# PR 1.5 — Formalize DB migrations, regenerate Supabase types, remove DB field shims

## Goal

Now that PR1 builds, PR1.5 makes the database + generated types authoritative so we can remove the "optional DB field" shims and stop drift from reappearing. This is a "truth alignment" PR: schema + types + shims removal + guardrails. No run behavior changes yet (that's PR2).

## Changes

### Step 0: Inventory shims removed

**Shims found and removed:**
1. **`getRunUpdatedAt()`** - `lib/contracts/dbGate.ts:26-33`
   - Compensated for missing `updated_at` column
   - Replaced with direct `runRecord.updated_at` access

2. **`getRunError()`** - `lib/contracts/dbGate.ts:52-67`
   - Compensated for missing structured `error` column
   - Checked multiple fallback fields (`error`, `last_error`, `error_message`, `failure_reason`)
   - Replaced with `normalizeRunError()` that prioritizes structured `error` jsonb over `error_message` text

3. **Type assertions** - `lib/contracts/dbGate.ts:27-30, 53-58`
   - Removed `as AnalysisRunRow & { updated_at?: ... }` patterns
   - Removed `as AnalysisRunRow & { error?: ... }` patterns
   - Types now directly match database schema

### Step 1: Migration system established

- Created `supabase/migrations/` directory
- Migration naming: `YYYYMMDDHHMMSS_description.sql`
- Updated `docs/MIGRATIONS.md` with formal migration workflow

### Step 2: Missing columns added

**Migration:** `supabase/migrations/20250115000000_add_analysis_runs_updated_at_error.sql`

Added to `analysis_runs` table:
- **`updated_at TIMESTAMPTZ`** - Auto-updated via trigger on row updates
- **`error JSONB`** - Structured error storage (preferred over `error_message` text)

Backfills:
- Existing `error_message` values migrated to structured `error` jsonb format
- Existing rows get `updated_at = created_at` if null

### Step 3: Types regenerated

**File:** `lib/supabase/database.types.ts`

Updated `AnalysisRunRow` and `AnalysisRunInsert` to include:
- `updated_at: string` (required in row, optional in insert)
- `error: Json | null` (nullable jsonb)

### Step 4: Shims removed

**File:** `lib/contracts/dbGate.ts`

- Removed `getRunUpdatedAt()` function
- Removed `getRunError()` function  
- Simplified `normalizeRunError()` to work directly with `AnalysisRunRow`:
  - Prefers structured `error` jsonb field
  - Falls back to `error_message` text for backward compatibility
- Direct column access: `runRecord.updated_at`, `runRecord.error`

### Step 5: Drift guardrails

- Updated `docs/MIGRATIONS.md` with migration workflow
- Schema drift check (`pnpm check:schema`) already enforces no forbidden columns
- Migration workflow documented: "Add migration → apply locally → regenerate types → commit"

## Deliverables

✅ New migration file: `supabase/migrations/20250115000000_add_analysis_runs_updated_at_error.sql`
✅ Regenerated database types: `lib/supabase/database.types.ts`
✅ Shim removals: `lib/contracts/dbGate.ts`
✅ Documentation: `docs/MIGRATIONS.md` workflow guide

## Verification

Before merging, verify:
- [ ] Migration applied to local/dev database
- [ ] `pnpm typecheck` passes (ignoring pre-existing test errors)
- [ ] `pnpm build` succeeds
- [ ] `pnpm check:schema` passes
- [ ] Smoke test: create project → generate evidence → generate analysis (no crashes)

## What's Next

- **PR2**: Run orchestration, state machine, idempotency
- This PR aligns schema/types so PR2 can rely on authoritative DB structure

## Notes

- `updated_at` trigger handles auto-updates automatically
- `error_message` column kept for backward compatibility during transition
- Artifact meta extraction helpers (for `run_id` in JSON) kept - those handle artifact-version drift, not DB drift

