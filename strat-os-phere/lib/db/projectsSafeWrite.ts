/**
 * Safe write helpers for projects table.
 * 
 * Filters out any columns that don't exist in the production schema
 * to prevent "column does not exist in schema cache" errors.
 */

import { PROJECT_ALLOWED_COLUMNS, PROJECT_STABLE_COLUMNS } from "./projectsSchema";

type AnyObj = Record<string, any>;

/**
 * Filters an object to only include allowed project columns.
 * Removes any keys that are not in PROJECT_ALLOWED_COLUMNS.
 * This is the whitelist picker that must be used for all project inserts/updates.
 * 
 * @param input - Object with potential project fields (can be unknown shape)
 * @returns New object with only allowed columns (excluding undefined values)
 *          Does not mutate the input object.
 */
export function pickAllowedProjectFields<T extends AnyObj>(input: T): Partial<T> {
  const allowed = new Set(PROJECT_ALLOWED_COLUMNS);
  const out: AnyObj = {};
  for (const [k, v] of Object.entries(input)) {
    if (allowed.has(k as any) && v !== undefined) {
      out[k] = v;
    }
  }
  return out as Partial<T>;
}

/**
 * Filters an object to only include stable project columns.
 * Removes any keys that are not in PROJECT_STABLE_COLUMNS.
 * This is used for project inserts to ensure only stable fields are written.
 * All evolving fields should be stored in project_inputs.input_json instead.
 * 
 * @param input - Object with potential project fields (can be unknown shape)
 * @returns New object with only stable columns (excluding undefined values)
 *          Does not mutate the input object.
 */
export function pickStableProjectFields<T extends AnyObj>(input: T): Partial<T> {
  const allowed = new Set(PROJECT_STABLE_COLUMNS);
  const out: AnyObj = {};
  for (const [k, v] of Object.entries(input)) {
    if (allowed.has(k as any) && v !== undefined) {
      out[k] = v;
    }
  }
  return out as Partial<T>;
}

