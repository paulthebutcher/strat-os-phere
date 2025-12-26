/**
 * Loader utility for project results
 * Handles loading project, determining active run, and fetching artifacts
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { Project, Artifact } from '@/lib/supabase/types'
import { getProjectSafe } from '@/lib/data/projectsContract'
import { listArtifacts } from '@/lib/data/artifacts'
import { getArtifactsForRun } from './runs'
import { getLatestRunningRunForProject, getProjectRunById, type ProjectRun } from '@/lib/data/projectRuns'
import { getLatestCommittedRunForProject } from '@/lib/data/projectRuns'

export interface ProjectResults {
  project: Project
  activeRunId: string | null
  activeRun: ProjectRun | null // The run record (may be running)
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
 * @param runId - Optional run ID from query params. If not provided, uses latest running run or latest artifacts
 * @returns Project results with artifacts for the active run (may be partial if run is still running)
 */
export async function getProjectResults(
  supabase: TypedSupabaseClient,
  projectId: string,
  runId?: string | null
): Promise<ProjectResults> {
  const projectResult = await getProjectSafe(supabase, projectId)
  
  if (!projectResult.ok || !projectResult.data) {
    throw new Error(projectResult.ok ? 'Project not found' : projectResult.error.message)
  }
  
  const project = projectResult.data

  // Load all artifacts for the project
  const allArtifacts = await listArtifacts(supabase, { projectId })

  // Determine active run ID and run record:
  // 1. Prefer runId from query params if provided
  // 2. Else check for a running run
  // 3. Else use latest successful (committed) run
  // 4. Else null (show empty state)
  let activeRunId: string | null = null
  let activeRun: ProjectRun | null = null
  
  if (runId) {
    // Check if this run exists (either in artifacts or as a run record)
    const runRecordResult = await getProjectRunById(supabase, runId)
    const runRecord = runRecordResult.ok ? runRecordResult.data : null
    const runArtifacts = getArtifactsForRun(allArtifacts, runId)
    
    if (runRecord || runArtifacts.length > 0) {
      activeRunId = runId
      activeRun = runRecord
    }
  }
  
  // If no runId specified, check for running run first
  if (!activeRunId) {
    const runningRunResult = await getLatestRunningRunForProject(supabase, projectId)
    if (runningRunResult.ok && runningRunResult.data) {
      activeRunId = runningRunResult.data.id
      activeRun = runningRunResult.data
    }
  }
  
  // Fall back to latest committed run
  if (!activeRunId) {
    const committedRunResult = await getLatestCommittedRunForProject(supabase, projectId)
    if (committedRunResult.ok && committedRunResult.data) {
      activeRunId = committedRunResult.data.id
      // Convert ProjectRun to AnalysisRun format if needed
      // For now, we'll use the run ID and fetch artifacts
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

  // Check if there's any committed run (for UI state)
  const committedRunResult = await getLatestCommittedRunForProject(supabase, projectId)
  const hasSuccessfulRun = committedRunResult.ok && committedRunResult.data !== null

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

