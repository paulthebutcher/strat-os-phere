/**
 * Prerequisite checks for pipeline phases
 * Ensures hard dependencies are met before proceeding with each phase
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { AppError } from '@/lib/errors'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { listArtifacts } from '@/lib/data/artifacts'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'

/**
 * Artifact types that represent competitor profiles/snapshots
 * Used to check if profiles have been generated before running analysis
 * 
 * Current implementation: 'profiles' artifact contains array of snapshots
 * This constant allows us to extend support for other profile artifact types if needed
 */
export const COMPETITOR_PROFILE_ARTIFACT_TYPES = ['profiles'] as const

export type CompetitorProfileArtifactType = typeof COMPETITOR_PROFILE_ARTIFACT_TYPES[number]

/**
 * Assert that the project has at least the minimum required competitors
 * Throws AppError with code INSUFFICIENT_COMPETITORS if check fails
 */
export async function assertHasCompetitors(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<void> {
  const competitors = await listCompetitorsForProject(supabase, projectId)
  
  if (competitors.length < MIN_COMPETITORS_FOR_ANALYSIS) {
    throw new AppError(
      'INSUFFICIENT_COMPETITORS',
      `At least ${MIN_COMPETITORS_FOR_ANALYSIS} competitors are required. Found ${competitors.length}.`,
      { competitorCount: competitors.length }
    )
  }
}

/**
 * Assert that competitor profiles exist for the project
 * Profiles are the foundation artifact that must exist before:
 * - Evidence/live signals generation
 * - JTBD/scorecard/opportunities generation
 * - Strategic bets generation
 * 
 * Checks for any artifact with a type in COMPETITOR_PROFILE_ARTIFACT_TYPES
 * and verifies it contains valid snapshot/profile data.
 * 
 * Throws AppError with code MISSING_COMPETITOR_PROFILES if check fails
 */
export async function assertHasCompetitorProfiles(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<void> {
  const competitors = await listCompetitorsForProject(supabase, projectId)
  const competitorCount = competitors.length
  const competitorIds = competitors.map((c) => c.id)
  const competitorNames = competitors.map((c) => c.name)

  const artifacts = await listArtifacts(supabase, { projectId })
  
  // Find any artifact that matches profile artifact types
  const profileArtifacts = artifacts.filter((a) =>
    COMPETITOR_PROFILE_ARTIFACT_TYPES.includes(a.type as CompetitorProfileArtifactType)
  )

  const foundTypes = [...new Set(profileArtifacts.map((a) => a.type))]

  // If no profile artifacts found at all, fail early with diagnostic info
  if (profileArtifacts.length === 0) {
    throw new AppError(
      'MISSING_COMPETITOR_PROFILES',
      'Competitor profiles are required before live market signals and scoring can run.',
      {
        competitorCount,
        competitorIds,
        competitorNames,
        profilesFoundCount: 0,
        foundTypes: [],
        missingCompetitorIds: competitorIds,
      }
    )
  }

  // Check each profile artifact for valid snapshot data
  // Accept multiple formats to be resilient:
  // 1. content_json.snapshots (array) - current format from generateAnalysis
  // 2. content_json.content (array) - schema format
  // 3. content_json as array - direct array format
  let validSnapshotsFound = 0

  for (const artifact of profileArtifacts) {
    const content = artifact.content_json as unknown
    
    // Try to find snapshots in various structures
    let snapshots: unknown[] = []
    
    if (content && typeof content === 'object' && !Array.isArray(content)) {
      const contentObj = content as Record<string, unknown>
      
      // Format 1: { snapshots: [...] } - current format
      if (Array.isArray(contentObj.snapshots)) {
        snapshots = contentObj.snapshots
      }
      // Format 2: { content: [...] } - schema format
      else if (Array.isArray(contentObj.content)) {
        snapshots = contentObj.content
      }
    }
    // Format 3: Direct array (unlikely but handle it)
    else if (Array.isArray(content)) {
      snapshots = content
    }

    if (snapshots.length > 0) {
      validSnapshotsFound += snapshots.length
    }
  }

  // If we found valid snapshots, we're good
  if (validSnapshotsFound > 0) {
    return
  }

  // No valid snapshots found - provide diagnostic details
  throw new AppError(
    'NO_SNAPSHOTS',
    `Found ${profileArtifacts.length} profile artifact(s) but none contain valid snapshots.`,
    {
      competitorCount,
      competitorIds,
      competitorNames,
      profilesFoundCount: profileArtifacts.length,
      foundTypes,
      snapshotCount: 0,
      missingCompetitorIds: competitorIds,
    }
  )
}

