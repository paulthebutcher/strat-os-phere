/**
 * Schema Health Invariants
 * 
 * Source-of-truth definitions for architectural invariants that must be maintained.
 * These invariants represent the core decisions from the data/schema refactor:
 * - Projects table uses only stable columns
 * - Inputs come from project_inputs (versioned JSON)
 * - Runs are append-only and derived from project_runs
 * - No derived state stored on projects table
 */

import { PROJECT_ALLOWED_COLUMNS, PROJECT_STABLE_COLUMNS } from '@/lib/db/projectsSchema'
import { pickAllowedProjectFields as pickAllowedFields } from '@/lib/db/projectsSafeWrite'

/**
 * Core architectural invariants
 */
export const INVARIANTS = {
  projects: {
    /**
     * Columns that are allowed to exist on the projects table.
     * This is the whitelist - any column not in this list should not be used.
     */
    allowedColumns: PROJECT_ALLOWED_COLUMNS,
    /**
     * Truly stable columns that can be safely written during project creation.
     * All other fields should be stored in project_inputs.input_json.
     */
    stableColumns: PROJECT_STABLE_COLUMNS,
    /**
     * Forbid storing derived run state on projects table.
     * Latest run info must be derived from project_runs, not stored as columns.
     */
    forbidDerivedRunState: true,
  },
  inputs: {
    /**
     * Source of truth for project inputs (onboarding fields, evolving context).
     */
    source: 'project_inputs' as const,
    /**
     * Inputs are versioned (each project can have multiple input versions).
     */
    versioned: true,
  },
  runs: {
    /**
     * Source of truth for analysis runs.
     */
    source: 'project_runs' as const,
    /**
     * Runs are append-only (never updated, only inserted).
     */
    appendOnly: true,
    /**
     * Projects table must not have latest run pointers.
     * Latest run is derived by querying project_runs, not from projects columns.
     */
    noProjectsLatestPointers: true,
  },
} as const

/**
 * Check if a field name is allowed on the projects table.
 * 
 * @param key - Field name to check
 * @returns true if the field is in the allowed columns list
 */
export function isAllowedProjectField(key: string): boolean {
  return PROJECT_ALLOWED_COLUMNS.includes(key as any)
}

/**
 * Filter an object to only include allowed project fields.
 * Re-exports pickAllowedProjectFields for convenience.
 * 
 * @param obj - Object with potential project fields
 * @returns New object with only allowed columns
 */
export function pickAllowedProjectFields(obj: Record<string, unknown>): Record<string, unknown> {
  return pickAllowedFields(obj)
}

