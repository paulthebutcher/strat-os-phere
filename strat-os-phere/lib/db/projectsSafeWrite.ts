/**
 * Safe write helpers for projects table.
 * 
 * Filters out any columns that don't exist in the production schema
 * to prevent "column does not exist in schema cache" errors.
 */

import { PROJECTS_ALLOWED_COLUMNS } from "./projectsSchema";

type AnyObj = Record<string, any>;

/**
 * Filters an object to only include allowed project columns.
 * Removes any keys that are not in PROJECTS_ALLOWED_COLUMNS.
 * 
 * @param input - Object with potential project fields
 * @returns Object with only allowed columns (excluding undefined values)
 */
export function pickAllowedProjectFields<T extends AnyObj>(input: T): Partial<T> {
  const allowed = new Set(PROJECTS_ALLOWED_COLUMNS);
  const out: AnyObj = {};
  for (const [k, v] of Object.entries(input)) {
    if (allowed.has(k as any) && v !== undefined) {
      out[k] = v;
    }
  }
  return out as Partial<T>;
}

