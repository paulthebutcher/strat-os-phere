import 'server-only'

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listArtifacts } from '@/lib/data/artifacts'
import { detectDrift, extractArtifactContent, type DriftDetectionResult } from './drift'

/**
 * Helper function to detect drift between current and previous run artifacts
 * Useful for monitoring model degradation over time
 * 
 * @param supabase - Supabase client
 * @param projectId - Project ID
 * @param currentRunId - Current run ID (optional, if not provided, uses most recent run)
 * @returns Drift detection result or null if no previous run found
 */
export async function detectRunDrift(
  supabase: TypedSupabaseClient,
  projectId: string,
  currentRunId?: string
): Promise<DriftDetectionResult | null> {
  const artifacts = await listArtifacts(supabase, { projectId })

  if (artifacts.length === 0) {
    return null
  }

  // Extract current run artifacts (most recent if runId not specified)
  let currentArtifacts = extractArtifactContent(artifacts)

  // If runId specified, filter to that run
  if (currentRunId) {
    const currentRunArtifacts = artifacts.filter(
      (a) =>
        a.content_json &&
        typeof a.content_json === 'object' &&
        'meta' in a.content_json &&
        a.content_json.meta &&
        typeof a.content_json.meta === 'object' &&
        'run_id' in a.content_json.meta &&
        a.content_json.meta.run_id === currentRunId
    )
    if (currentRunArtifacts.length > 0) {
      currentArtifacts = extractArtifactContent(currentRunArtifacts)
    }
  }

  // Find previous run artifacts (second most recent run of same types)
  const previousRunArtifacts = artifacts
    .filter((a) => {
      // Exclude current run
      if (currentRunId) {
        const meta = a.content_json as any
        if (meta?.meta?.run_id === currentRunId) {
          return false
        }
      }
      return true
    })
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // Group by run_id to find the most recent complete previous run
  const runGroups = new Map<string, typeof artifacts>()
  previousRunArtifacts.forEach((artifact) => {
    const meta = artifact.content_json as any
    const runId = meta?.meta?.run_id || 'unknown'
    if (!runGroups.has(runId)) {
      runGroups.set(runId, [])
    }
    runGroups.get(runId)!.push(artifact)
  })

  // Find the most recent previous run that has all artifact types
  let previousArtifacts = extractArtifactContent([])
  for (const [runId, runArtifacts] of runGroups.entries()) {
    const extracted = extractArtifactContent(runArtifacts)
    // Check if this run has at least one artifact type
    if (extracted.jtbd || extracted.opportunities || extracted.scoringMatrix) {
      previousArtifacts = extracted
      break
    }
  }

  // If no previous run found, return null
  if (!previousArtifacts.jtbd && !previousArtifacts.opportunities && !previousArtifacts.scoringMatrix) {
    return null
  }

  return detectDrift(currentArtifacts, previousArtifacts)
}

