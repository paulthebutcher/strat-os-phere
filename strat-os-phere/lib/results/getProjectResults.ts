/**
 * Loader utility for project results
 * Handles loading project, determining active run, and fetching artifacts
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { Project, Artifact } from '@/lib/supabase/types'
import { getProjectById } from '@/lib/data/projects'
import { listArtifacts } from '@/lib/data/artifacts'
import { getArtifactsForRun } from './runs'

export interface ProjectResults {
  project: Project
  activeRunId: string | null
  artifacts: Artifact[]
  hasSuccessfulRun: boolean
}

/**
 * Get project results for a specific run or the latest successful run
 * 
 * @param supabase - Supabase client
 * @param projectId - Project ID
 * @param runId - Optional run ID from query params. If not provided, uses project.latest_successful_run_id
 * @returns Project results with artifacts for the active run
 */
export async function getProjectResults(
  supabase: TypedSupabaseClient,
  projectId: string,
  runId?: string | null
): Promise<ProjectResults> {
  const project = await getProjectById(supabase, projectId)
  
  if (!project) {
    throw new Error('Project not found')
  }

  // Load all artifacts for the project
  const allArtifacts = await listArtifacts(supabase, { projectId })

  // Determine active run ID:
  // 1. Prefer runId from query params if provided
  // 2. Else prefer project.latest_successful_run_id
  // 3. Else null (show empty state)
  let activeRunId: string | null = null
  
  if (runId) {
    // Verify this run exists in artifacts
    const runArtifacts = getArtifactsForRun(allArtifacts, runId)
    if (runArtifacts.length > 0) {
      activeRunId = runId
    }
  }
  
  if (!activeRunId && project.latest_successful_run_id) {
    // Verify this run exists in artifacts
    const runArtifacts = getArtifactsForRun(allArtifacts, project.latest_successful_run_id)
    if (runArtifacts.length > 0) {
      activeRunId = project.latest_successful_run_id
    }
  }

  // Get artifacts for the active run (or empty array if no active run)
  const artifacts = activeRunId 
    ? getArtifactsForRun(allArtifacts, activeRunId)
    : []

  // Check if there's any successful run (for UI state)
  const hasSuccessfulRun = Boolean(project.latest_successful_run_id)

  return {
    project,
    activeRunId,
    artifacts,
    hasSuccessfulRun,
  }
}

