/**
 * Determines if a user is a "first win" user (new user without completed projects).
 * A user is considered new if:
 * - They have no projects, OR
 * - All their projects have no completed artifacts/results
 */

import type { Project } from '@/lib/supabase/types'

/**
 * Check if a project has completed results/artifacts.
 * Uses latest_successful_run_id as the indicator.
 */
function hasCompletedResults(project: Project): boolean {
  // Check if latest_successful_run_id exists and is not null
  const hasRunId =
    'latest_successful_run_id' in project &&
    typeof (project as any).latest_successful_run_id === 'string' &&
    (project as any).latest_successful_run_id !== null

  return hasRunId
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

