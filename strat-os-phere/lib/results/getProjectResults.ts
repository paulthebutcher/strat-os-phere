/**
 * Loader utility for project results
 * Handles loading project, determining active run, and fetching artifacts
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { Project, Artifact, AnalysisRun } from '@/lib/supabase/types'
import { getProjectById } from '@/lib/data/projects'
import { listArtifacts } from '@/lib/data/artifacts'
import { getArtifactsForRun } from './runs'
import { getAnalysisRunById, getLatestRunningRunForProject } from '@/lib/data/runs'

export interface ProjectResults {
  project: Project
  activeRunId: string | null
  activeRun: AnalysisRun | null // The run record (may be running)
  artifacts: Artifact[]
  hasSuccessfulRun: boolean
  artifactsByType: Record<string, Artifact | undefined> // Partial artifacts keyed by type
  availableArtifactTypes: string[] // List of artifact types that exist
}

/**
 * Get project results for a specific run or the latest successful run
 * Supports partial artifacts (for running runs)
 * 
 * @param supabase - Supabase client
 * @param projectId - Project ID
 * @param runId - Optional run ID from query params. If not provided, uses project.latest_successful_run_id or latest running run
 * @returns Project results with artifacts for the active run (may be partial if run is still running)
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

  // Determine active run ID and run record:
  // 1. Prefer runId from query params if provided
  // 2. Else check for a running run
  // 3. Else prefer project.latest_successful_run_id
  // 4. Else null (show empty state)
  let activeRunId: string | null = null
  let activeRun: AnalysisRun | null = null
  
  if (runId) {
    // Check if this run exists (either in artifacts or as a run record)
    const runRecord = await getAnalysisRunById(supabase, runId)
    const runArtifacts = getArtifactsForRun(allArtifacts, runId)
    
    if (runRecord || runArtifacts.length > 0) {
      activeRunId = runId
      activeRun = runRecord
    }
  }
  
  // If no runId specified, check for running run first
  if (!activeRunId) {
    const runningRun = await getLatestRunningRunForProject(supabase, projectId)
    if (runningRun) {
      activeRunId = runningRun.id
      activeRun = runningRun
    }
  }
  
  // Fall back to latest successful run
  if (!activeRunId && project.latest_successful_run_id) {
    // Verify this run exists in artifacts
    const runArtifacts = getArtifactsForRun(allArtifacts, project.latest_successful_run_id)
    if (runArtifacts.length > 0) {
      activeRunId = project.latest_successful_run_id
      // Try to load run record (may not exist for old runs)
      activeRun = await getAnalysisRunById(supabase, activeRunId)
    }
  }

  // Get artifacts for the active run (or empty array if no active run)
  // This may be partial if the run is still running
  const artifacts = activeRunId 
    ? getArtifactsForRun(allArtifacts, activeRunId)
    : []

  // Build artifactsByType map for easy lookup
  const artifactsByType: Record<string, Artifact | undefined> = {}
  const availableArtifactTypes: string[] = []
  
  for (const artifact of artifacts) {
    artifactsByType[artifact.type] = artifact
    if (!availableArtifactTypes.includes(artifact.type)) {
      availableArtifactTypes.push(artifact.type)
    }
  }

  // Check if there's any successful run (for UI state)
  const hasSuccessfulRun = Boolean(project.latest_successful_run_id)

  return {
    project,
    activeRunId,
    activeRun,
    artifacts,
    hasSuccessfulRun,
    artifactsByType,
    availableArtifactTypes,
  }
}

