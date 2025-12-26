/**
 * Helper functions to derive run status from artifacts
 * Used as fallback when project_runs table doesn't have the run record
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { Artifact } from '@/lib/supabase/types'
import { listArtifacts } from '@/lib/data/artifacts'
import { getProjectRunById, type ProjectRun } from '@/lib/data/projectRuns'

// Run status type for UI/derived status (maps 'succeeded' -> 'completed')
export type RunStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface RunStatusInfo {
  status: RunStatus
  progress?: number
  updatedAt?: string
}

/**
 * Derive run status from artifacts
 * A run is considered "completed" if it has both profiles and synthesis artifacts
 * Otherwise, if it has any artifacts, it's "running"
 * If no artifacts, it's "queued" or "unknown"
 */
function deriveStatusFromArtifacts(
  artifacts: Artifact[],
  runId: string
): RunStatus {
  const runArtifacts = artifacts.filter(
    (a) => a.content_json && typeof a.content_json === 'object' && 'run_id' in a.content_json && a.content_json.run_id === runId
  )

  if (runArtifacts.length === 0) {
    return 'queued'
  }

  // Check for key artifacts that indicate completion
  const hasProfiles = runArtifacts.some((a) => a.type === 'profiles')
  const hasSynthesis = runArtifacts.some((a) => a.type === 'synthesis')

  // If we have both profiles and synthesis, consider it completed
  if (hasProfiles && hasSynthesis) {
    return 'completed'
  }

  // If we have some artifacts but not both, it's still running
  if (runArtifacts.length > 0) {
    return 'running'
  }

  return 'queued'
}

/**
 * Get run status by checking project_runs table first, then falling back to artifacts
 */
export async function getRunStatus(
  supabase: TypedSupabaseClient,
  runId: string,
  projectId: string
): Promise<RunStatusInfo> {
  // First, try to get from project_runs table
  const runRecordResult = await getProjectRunById(supabase, runId)
  const runRecord = runRecordResult.ok ? runRecordResult.data : null

  if (runRecord) {
    // Extract progress from metrics if available
    const progress = runRecord.metrics && typeof runRecord.metrics === 'object' && 'percent' in runRecord.metrics
      ? (runRecord.metrics as { percent?: number }).percent
      : undefined
    
    // Map ProjectRun status to RunStatus ('succeeded' -> 'completed')
    const status: RunStatus = runRecord.status === 'succeeded' ? 'completed' : runRecord.status
    
    return {
      status,
      progress,
      updatedAt: runRecord.finished_at || runRecord.created_at,
    }
  }

  // Fallback: derive from artifacts (legacy support)
  const artifacts = await listArtifacts(supabase, { projectId })
  const status = deriveStatusFromArtifacts(artifacts, runId)

  // Try to estimate progress from artifacts
  let progress: number | undefined
  const runArtifacts = artifacts.filter(
    (a) => a.content_json && typeof a.content_json === 'object' && 'run_id' in a.content_json && a.content_json.run_id === runId
  )

  if (runArtifacts.length > 0) {
    // Rough estimate: 50% if we have profiles, 90% if we have both
    const hasProfiles = runArtifacts.some((a) => a.type === 'profiles')
    const hasSynthesis = runArtifacts.some((a) => a.type === 'synthesis')
    
    if (hasProfiles && hasSynthesis) {
      progress = 100
    } else if (hasProfiles) {
      progress = 50
    } else {
      progress = 10
    }
  }

  // Get most recent artifact created_at as updatedAt
  const mostRecentArtifact = runArtifacts.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]

  return {
    status,
    progress,
    updatedAt: mostRecentArtifact?.created_at,
  }
}

