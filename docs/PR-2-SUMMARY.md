# PR-2 Summary: Create project_runs (append-only runs; no projects.latest_*)

## Overview

This PR introduces `project_runs` as an append-only table to store analysis execution runs, replacing the need for `projects.latest_run_id` and `projects.latest_successful_run_id` fields. Runs become the source of truth for execution status and artifacts.

## Changes

### 1. Database Migration

**File**: `docs/sql/create_project_runs_table.sql`

- Creates `project_runs` table with:
  - Required columns: `id`, `project_id`, `input_version`, `status`, `started_at`, `finished_at`, `created_at`
  - Expanded columns: `error_code`, `error_message`, `error_detail`, `output` (jsonb), `metrics` (jsonb), `idempotency_key`
  - Unique constraint on `idempotency_key` for idempotent runs
  - Indexes for performance: `(project_id, created_at DESC)`, `(project_id, status)`
  - RLS policies for user access control

### 2. Data Access Layer

**File**: `strat-os-phere/lib/data/projectRuns.ts` (new)

Repository module with functions that return `{ ok, data?, error? }` and never throw:

- `createProjectRun()` - Creates run with status='queued', handles idempotency via unique constraint
- `getProjectRunByIdempotencyKey()` - Fetches existing run by idempotency key
- `setRunRunning()` - Transitions to 'running', sets `started_at` if not already set
- `setRunSucceeded()` - Transitions to 'succeeded' with output and merged metrics
- `setRunFailed()` - Transitions to 'failed' with error details and merged metrics
- `updateRunMetrics()` - Updates metrics during execution without changing status
- `getLatestRunForProject()` - Gets most recent run for a project
- `listRunsForProject()` - Lists runs for run history UI

### 3. Orchestration Contract

**File**: `strat-os-phere/lib/analysis/runProjectAnalysis.ts` (new)

Idempotent, retryable, step-aware orchestrator:

- **Input resolution**: Fetches latest project input from `project_inputs` (or uses requested version)
- **Idempotency**: Uses `idempotency_key = ${projectId}:${inputVersion}:${pipelineVersion}`
- **Status transitions**: queued → running → succeeded/failed
- **Step-aware metrics**: Tracks steps (validate_inputs, collect_evidence, generate_opportunities) with status, timestamps, errors
- **Error handling**: Never throws; creates failed run records for all error cases including NO_INPUTS
- **Mocked execution**: Steps are currently mocked but structure is in place for real implementation

### 4. API Integration

**File**: `strat-os-phere/app/api/projects/[projectId]/generate/route.ts`

- Updated to use `runProjectAnalysis()` orchestrator
- Returns `runId` from `project_runs` table
- Maps error codes to appropriate HTTP status codes

### 5. Dashboard Updates

**File**: `strat-os-phere/lib/data/projects.ts`

- Updated `listProjectsWithCounts()` to fetch latest runs from `project_runs` instead of `analysis_runs`
- Uses `getLatestRunForProject()` from projectRuns repository
- Dashboard now derives "Last run" from `project_runs` table

### 6. Cleanup

- All references to `latest_run_id` / `latest_successful_run_id` are already comments noting these fields don't exist
- No actual code references these fields (they were already removed in PR-1)
- Forbidden token checks remain in place to prevent future usage

## Testing Steps

### Manual Test Plan

1. **Create project**
   ```sql
   -- In Supabase SQL editor, create a test project
   INSERT INTO projects (id, user_id, name, created_at)
   VALUES (gen_random_uuid(), '<your-user-id>', 'Test Project', NOW());
   ```

2. **Add inputs (or skip to test NO_INPUTS behavior)**
   ```sql
   -- Add project input
   INSERT INTO project_inputs (project_id, version, status, input_json)
   VALUES ('<project-id>', 1, 'final', '{"hypothesis": "test"}');
   ```

3. **Click Generate analysis**
   - Navigate to project page
   - Click "Generate analysis" button
   - Verify run row is created in `project_runs` table
   - Verify status transitions: queued → running → succeeded

4. **Verify run row exists + status transitions + dashboard last run**
   ```sql
   -- Check project_runs table
   SELECT * FROM project_runs WHERE project_id = '<project-id>' ORDER BY created_at DESC;
   ```
   - Should see one row with status='succeeded'
   - Should have `output` jsonb with pipeline_version, input_version, summary
   - Should have `metrics` jsonb with steps array

5. **Test NO_INPUTS behavior**
   - Create a project without `project_inputs`
   - Click "Generate analysis"
   - Verify a failed run is created with error_code='NO_INPUTS'

6. **Test idempotency**
   - Click "Generate analysis" twice quickly
   - Verify only one run is created (same idempotency_key)
   - Verify the second call returns the existing run

7. **Verify dashboard**
   - Navigate to `/dashboard`
   - Verify "Last run" shows status and timestamp from `project_runs`
   - Verify it shows "Never" if no runs exist

## Acceptance Criteria

✅ Clicking "Generate analysis" creates a `project_run` (or reuses idempotent one)
✅ Status transitions work (queued → running → succeeded/failed)
✅ Dashboard shows "Last run" derived from `project_runs`, not `projects`
✅ No references to `projects.latest_run_id` / `projects.latest_*` anywhere
✅ Works when a project has no inputs (creates failed run with NO_INPUTS)
✅ `pnpm run build` passes

## Migration Instructions

1. **Apply SQL migration**
   ```bash
   # In Supabase SQL editor, run:
   docs/sql/create_project_runs_table.sql
   ```

2. **Verify RLS policies**
   - Check that RLS is enabled on `project_runs`
   - Verify policies allow users to SELECT/INSERT/UPDATE their own runs

3. **Deploy code**
   - Deploy updated code
   - Verify no PostgREST schema errors

## Notes

- The orchestrator currently mocks analysis steps. Real implementation will be added in future PRs.
- The `analysis_runs` table may still exist for backward compatibility, but `project_runs` is now the source of truth.
- Pipeline version is set to `'2025-12-23.v1'` - update when pipeline logic changes.
- All functions use Result types (`{ ok, data?, error? }`) and never throw, ensuring graceful degradation.

## Files Changed

### New Files
- `docs/sql/create_project_runs_table.sql`
- `strat-os-phere/lib/data/projectRuns.ts`
- `strat-os-phere/lib/analysis/runProjectAnalysis.ts`
- `docs/PR-2-SUMMARY.md`

### Modified Files
- `strat-os-phere/app/api/projects/[projectId]/generate/route.ts`
- `strat-os-phere/lib/data/projects.ts`

