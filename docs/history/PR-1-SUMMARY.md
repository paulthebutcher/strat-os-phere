# PR-1: Project Inputs (Versioned JSON) + Onboarding Integration

**Status: Historical / reference (not source of truth)**

This document is a snapshot of past work. It provides context but is not the source of truth for current implementation.

## Summary

This PR introduces versioned JSON inputs for projects to prevent schema drift when onboarding fields evolve. All evolving onboarding fields are now stored in the `project_inputs` table instead of adding columns to the `projects` table.

## Changes

### 1. Database Migration
- **File**: `docs/sql/create_project_inputs_table.sql`
- Creates `project_inputs` table with:
  - `id`, `project_id`, `version`, `status` (draft/final), `input_json` (JSONB), `created_at`
  - Unique constraint on `(project_id, version)`
  - Indexes for performance
  - RLS policies aligned with projects table (users can only access inputs for their own projects)

### 2. Data Access Layer
- **File**: `strat-os-phere/lib/data/projectInputs.ts`**
- Functions:
  - `getLatestProjectInput()` - Returns latest final or draft input
  - `createDraftProjectInput()` - Creates new draft version (concurrency-safe)
  - `updateProjectInput()` - Updates input_json with shallow merge
  - `finalizeProjectInput()` - Sets status to 'final'
  - `mergeInputJson()` - Helper for merging JSON

### 3. Onboarding Integration
- **File**: `strat-os-phere/app/projects/actions.ts`
  - `createProjectFromForm()` now:
    1. Creates project with ONLY stable fields (`name`, `user_id`)
    2. Saves all evolving fields to `project_inputs`
    3. Finalizes the input after creation

- **File**: `strat-os-phere/components/onboarding/WizardStep3Details.tsx`
  - Updated to pass all onboarding fields (Step 1 + Step 3) to `createProjectFromForm()`

- **File**: `strat-os-phere/app/try/actions.ts`
  - Updated to also use `project_inputs` for consistency

### 4. Projects Table Stability
- Onboarding flow now only writes stable fields to `projects`:
  - `id`, `user_id`, `name`, `created_at`
- All evolving fields go to `project_inputs.input_json`:
  - `marketCategory`, `targetCustomer`, `product`, `goal`, `geography`
  - `primaryConstraint`, `pricingModel`
  - `primaryCompanyName`, `contextText`, `decisionFraming`
  - `resolvedSources`, `suggestedCompetitors`, `selectedCompetitors`
  - `evidenceWindowDays`
  - And other evolving fields

### 5. Empty State Handling
- `getLatestProjectInput()` returns `{ ok: true, data: null }` when no input exists
- Code can safely check for null and show empty states
- Pages will render even when `project_inputs` is missing

## Testing Checklist

### Manual Testing Steps

1. **Create New Project via Onboarding**
   - ✅ Navigate to `/new`
   - ✅ Complete Step 1 (Describe): Enter company name, decision, market, notes
   - ✅ Complete Step 2 (Add competitors): Select competitors
   - ✅ Complete Step 3 (Details): Enter project name and details
   - ✅ Click "Generate analysis"
   - ✅ Verify project is created with only `name` and `user_id` in `projects` table
   - ✅ Verify all onboarding fields are saved in `project_inputs.input_json`

2. **Verify Database State**
   - ✅ Check `projects` table: Should only have `id`, `user_id`, `name`, `created_at`
   - ✅ Check `project_inputs` table: Should have one row with `status='final'` and all onboarding fields in `input_json`

3. **Empty State Handling**
   - ✅ Create a project manually (via SQL or API) without `project_inputs`
   - ✅ Verify pages don't crash when reading project data
   - ✅ Verify `getLatestProjectInput()` returns null gracefully

4. **Build Verification**
   - ✅ Run `pnpm run build` - should pass
   - ✅ Run `pnpm run typecheck` - should pass
   - ✅ Run `pnpm run lint` - should pass

5. **Schema Drift Prevention**
   - ✅ Try adding a new field to onboarding form (e.g., `newField`)
   - ✅ Verify it saves to `project_inputs.input_json` without any DB migration
   - ✅ Verify no new columns are added to `projects` table

## Migration Instructions

1. Run the SQL migration in Supabase:
   ```bash
   # Apply docs/sql/create_project_inputs_table.sql in Supabase SQL editor
   ```

2. Verify RLS policies are active:
   - Check that `project_inputs` table has RLS enabled
   - Verify policies match the pattern in the migration file

3. Test the onboarding flow:
   - Create a new project through `/new`
   - Verify data is saved correctly

## Notes

- **Backward Compatibility**: Existing projects with fields in `projects` table will continue to work. Future work may migrate these to `project_inputs`.
- **Reading Project Context**: Code that reads project context (e.g., `buildProjectContext`) currently reads from `projects` table. This will need to be updated in a future PR to also check `project_inputs` for new projects.
- **Try Flow**: The `/try` flow has been updated to also use `project_inputs` for consistency.

## Files Changed

1. `docs/sql/create_project_inputs_table.sql` (new)
2. `strat-os-phere/lib/data/projectInputs.ts` (new)
3. `strat-os-phere/app/projects/actions.ts` (modified)
4. `strat-os-phere/components/onboarding/WizardStep3Details.tsx` (modified)
5. `strat-os-phere/app/try/actions.ts` (modified)

## Acceptance Criteria

✅ Creating/editing onboarding inputs no longer touches new projects columns  
✅ Inputs persist and reload correctly from project_inputs  
✅ You can add/remove form fields without any DB migration (only changes in input_json)  
✅ Existing pages render even when project_inputs is missing (empty state prompts user)  
✅ `pnpm run build` passes  
✅ New project creation still works on an empty DB  
✅ No PostgREST "schema cache" errors from projects columns during onboarding

