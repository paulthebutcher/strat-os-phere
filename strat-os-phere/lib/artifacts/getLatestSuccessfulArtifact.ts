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
 * This function ensures idempotency by only returning artifacts from the specified run.
 * No stale artifacts from different runs can satisfy idempotency checks.
 * 
 * Strategy:
 * 1. Filter artifacts by projectId, runId (from content_json), and type
 * 2. Order by created_at DESC
 * 3. Return the first one (most recent)
 * 
 * Enforced selection criteria:
 * - project_id = projectId (exact match)
 * - run_id = runId (from content_json, exact match)
 * - type = type (exact match)
 * - Order by created_at DESC, limit 1
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

    // Filter by runId and type (run-scoped lookup)
    // This ensures no stale artifact from a different run can satisfy idempotency checks
    const runArtifacts = artifacts.filter((artifact) => {
      // Enforce: project_id must match
      if (artifact.project_id !== params.projectId) {
        return false
      }

      // Enforce: run_id must match (from content_json)
      const contentJson = artifact.content_json
      if (!contentJson || typeof contentJson !== 'object') {
        return false
      }

      const artifactRunId = 'run_id' in contentJson ? contentJson.run_id : null
      if (artifactRunId !== params.runId) {
        return false
      }

      // Enforce: type must match
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

