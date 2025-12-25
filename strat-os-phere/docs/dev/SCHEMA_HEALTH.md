# Schema Health

## Overview

Schema health checks validate that the recent data/schema refactor is working correctly. The refactor established these architectural invariants:

1. **Projects table uses only stable columns** - No evolving fields, no derived run state
2. **Inputs come from project_inputs** - Versioned JSON storage for onboarding/context fields
3. **Runs are append-only** - Latest run derived from `project_runs`, not stored on `projects`

## What "Schema Health" Means

Schema health means the codebase adheres to these invariants:

- ✅ Projects table contains only allowed columns (no drift)
- ✅ No references to `latest_run_id` or `latest_successful_run_id` on projects
- ✅ Evolving fields stored in `project_inputs.input_json` (not on projects)
- ✅ Latest run derived by querying `project_runs` (not from projects columns)
- ✅ Project inserts/updates use `pickAllowedProjectFields()` helper

## Running Health Checks

### Static Checks (CI-friendly)

Run the static analysis script to detect architectural drift in code:

```bash
pnpm schema:health
```

This script:
- Scans the codebase for forbidden patterns
- Detects references to derived run state on projects
- Flags direct writes of forbidden fields
- Reports violations with file paths and line numbers

**Exit codes:**
- `0` - No violations (or only warnings)
- `1` - Errors found (must fix)

### Runtime Health Report (Dev-only)

Visit the dev-only health page in your browser:

```
http://localhost:3000/dev/health
```

This page:
- Queries your actual database to check runtime invariants
- Shows sample projects, inputs, and runs
- Highlights unexpected columns on projects
- Confirms inputs/runs are stored correctly

**Note:** This page is gated behind `NODE_ENV !== 'production'` or `ENABLE_DEV_TOOLS=true`.

## What to Do When It Fails

### Static Check Failures

If `pnpm schema:health` reports violations:

1. **Review the violation** - Check the file and line number
2. **Fix the code**:
   - Use `project_inputs` for evolving fields (not projects table)
   - Use `project_runs` for run state (derive latest, don't store)
   - Use `pickAllowedProjectFields()` for project inserts/updates
3. **Re-run the check** - Verify the fix

**Common violations:**

- `projects.latest_run_id` → Use `getLatestRunForProject()` from `lib/data/projectRuns`
- `projects.hypothesis` → Store in `project_inputs.input_json`
- Direct insert without `pickAllowedProjectFields()` → Wrap with the helper

### Runtime Health Warnings

If the dev health page shows warnings:

1. **Unexpected columns on projects** - Check if a migration added columns that aren't in `PROJECT_ALLOWED_COLUMNS`
2. **Missing project_inputs** - Normal for new projects, but should appear after onboarding
3. **Missing project_runs** - Normal for new projects, but should appear after first analysis

## Architecture Invariants

The invariants are defined in `lib/health/invariants.ts`:

```typescript
export const INVARIANTS = {
  projects: {
    allowedColumns: [...],  // Whitelist of allowed columns
    stableColumns: [...],    // Truly stable columns (user_id, name)
    forbidDerivedRunState: true,
  },
  inputs: {
    source: 'project_inputs',
    versioned: true,
  },
  runs: {
    source: 'project_runs',
    appendOnly: true,
    noProjectsLatestPointers: true,
  },
}
```

## Debug Logging

Health events are logged in development (not production):

- `project_created` - When a project is created
- `project_input_saved` - When project inputs are saved
- `project_run_created` - When a project run is created

These logs help track that the architecture is being followed during development.

## Integration with CI

The static check (`pnpm schema:health`) can be added to CI:

```yaml
# Example GitHub Actions
- name: Schema Health Check
  run: pnpm schema:health
```

This ensures architectural drift is caught before merging.

## Related Files

- `lib/health/invariants.ts` - Invariant definitions
- `scripts/schemaHealthCheck.ts` - Static analysis script
- `app/dev/health/page.tsx` - Runtime health page
- `lib/health/logHealth.ts` - Debug logging helpers
- `lib/db/projectsSchema.ts` - Allowed columns source of truth
- `lib/db/projectsSafeWrite.ts` - Safe write helpers

