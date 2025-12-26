/**
 * Get the latest successful artifact for a run
 * 
 * This helper provides a deterministic "latest successful for run" selector
 * for idempotency checks.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listArtifacts } from '@/lib/data/artifacts'
import type { Artifact } from '@/lib/supabase/types'

export interface GetLatestSuccessfulArtifactParams {
  projectId: string
  runId: string
  type: string
}

/**
 * Get the latest successful artifact for a run and type
 * 
 * Strategy:
 * 1. Filter artifacts by projectId, runId (from content_json), and type
 * 2. Order by created_at DESC
 * 3. Return the first one (most recent)
 * 
 * This is deterministic: same run + type always returns the same artifact
 */
export async function getLatestSuccessfulArtifact(
  supabase: TypedSupabaseClient,
  params: GetLatestSuccessfulArtifactParams
): Promise<Artifact | null> {
  try {
    // Get all artifacts for the project
    const artifacts = await listArtifacts(supabase, { projectId: params.projectId })

    // Filter by runId and type
    const runArtifacts = artifacts.filter((artifact) => {
      // Check if artifact belongs to this run
      const contentJson = artifact.content_json
      if (!contentJson || typeof contentJson !== 'object') {
        return false
      }

      const artifactRunId = 'run_id' in contentJson ? contentJson.run_id : null
      if (artifactRunId !== params.runId) {
        return false
      }

      // Check type
      if (artifact.type !== params.type) {
        return false
      }

      return true
    })

    if (runArtifacts.length === 0) {
      return null
    }

    // Sort by created_at DESC and return the most recent
    const sorted = runArtifacts.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    return sorted[0]
  } catch (error) {
    // Log but don't throw - this is a helper for idempotency checks
    console.error('[getLatestSuccessfulArtifact] Error', error)
    return null
  }
}

