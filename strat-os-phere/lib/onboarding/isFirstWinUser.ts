/**
 * Determines if a user is a "first win" user (new user without completed projects).
 * A user is considered new if:
 * - They have no projects, OR
 * - All their projects have no completed artifacts/results
 */

import type { Project } from '@/lib/supabase/types'

/**
 * Check if a project has completed results/artifacts.
 * Note: latest_successful_run_id doesn't exist in production schema.
 * For now, we return false - this can be enhanced later to check artifacts.
 */
function hasCompletedResults(project: Project): boolean {
  // TODO: Enhance this to check artifacts table for completed results
  // For now, return false to be conservative
  return false
}

/**
 * Determine if a user is a "first win" user based on their projects.
 * Returns true if they are new (no projects or no completed results).
 */
export function isFirstWinUser(projects: Project[]): boolean {
  // If no projects, definitely a new user
  if (projects.length === 0) {
    return true
  }

  // If all projects have no completed results, still a new user
  const hasAnyCompletedResults = projects.some(hasCompletedResults)
  return !hasAnyCompletedResults
}

