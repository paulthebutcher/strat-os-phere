/**
 * Utilities for working with analysis runs
 * Runs are tracked via run_id in artifact content_json, not a separate table
 */

import type { Artifact } from '@/lib/supabase/types'
import type { Json } from '@/lib/supabase/database.types'

/**
 * Extract run_id from an artifact's content_json
 */
export function extractRunIdFromArtifact(artifact: Artifact): string | null {
  const content = artifact.content_json as Json
  if (typeof content === 'object' && content !== null && 'run_id' in content) {
    const runId = content.run_id
    if (typeof runId === 'string') {
      return runId
    }
  }
  return null
}

/**
 * Group artifacts by run_id
 */
export function groupArtifactsByRunId(artifacts: Artifact[]): Map<string, Artifact[]> {
  const grouped = new Map<string, Artifact[]>()
  
  for (const artifact of artifacts) {
    const runId = extractRunIdFromArtifact(artifact)
    if (runId) {
      const existing = grouped.get(runId) || []
      existing.push(artifact)
      grouped.set(runId, existing)
    }
  }
  
  return grouped
}

/**
 * Get all unique run_ids from artifacts, sorted by most recent (based on artifact created_at)
 */
export function getRunIdsFromArtifacts(artifacts: Artifact[]): string[] {
  const runIdToLatestArtifact = new Map<string, Artifact>()
  
  for (const artifact of artifacts) {
    const runId = extractRunIdFromArtifact(artifact)
    if (runId) {
      const existing = runIdToLatestArtifact.get(runId)
      if (!existing || new Date(artifact.created_at) > new Date(existing.created_at)) {
        runIdToLatestArtifact.set(runId, artifact)
      }
    }
  }
  
  // Sort by most recent artifact created_at
  return Array.from(runIdToLatestArtifact.entries())
    .sort((a, b) => {
      const dateA = new Date(a[1].created_at).getTime()
      const dateB = new Date(b[1].created_at).getTime()
      return dateB - dateA
    })
    .map(([runId]) => runId)
}

/**
 * Determine if a run is "successful" based on artifacts
 * A run is successful if it has both profiles and synthesis artifacts
 */
export function isRunSuccessful(artifacts: Artifact[]): boolean {
  const hasProfiles = artifacts.some(a => a.type === 'profiles')
  const hasSynthesis = artifacts.some(a => a.type === 'synthesis')
  return hasProfiles && hasSynthesis
}

/**
 * Get artifacts for a specific run_id
 */
export function getArtifactsForRun(artifacts: Artifact[], runId: string): Artifact[] {
  return artifacts.filter(artifact => {
    const artifactRunId = extractRunIdFromArtifact(artifact)
    return artifactRunId === runId
  })
}

/**
 * Get the most recent successful run_id from artifacts
 */
export function getLatestSuccessfulRunId(artifacts: Artifact[]): string | null {
  const runIds = getRunIdsFromArtifacts(artifacts)
  
  for (const runId of runIds) {
    const runArtifacts = getArtifactsForRun(artifacts, runId)
    if (isRunSuccessful(runArtifacts)) {
      return runId
    }
  }
  
  return null
}

/**
 * Get the most recent run_id from artifacts (regardless of success)
 */
export function getLatestRunId(artifacts: Artifact[]): string | null {
  const runIds = getRunIdsFromArtifacts(artifacts)
  return runIds[0] || null
}

