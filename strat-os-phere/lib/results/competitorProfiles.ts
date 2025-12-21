/**
 * Helper functions for checking and managing competitor profiles
 * Provides a single source of truth for profile existence checks
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { listArtifacts } from '@/lib/data/artifacts'
import { COMPETITOR_PROFILE_ARTIFACT_TYPES } from '@/lib/results/prerequisites'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'

export interface ProfileStatus {
  competitorsCount: number
  profilesCount: number
  missingProfiles: boolean
  competitorIds: string[]
  profileArtifacts: Array<{ id: string; type: string; snapshots: CompetitorSnapshot[] }>
}

/**
 * Check if competitor profiles exist for a project
 * Returns counts and status information
 * 
 * Preferred strictness: requires at least 1 profile per competitor (by competitor_id matching competitor_name)
 * Falls back to requiring profilesCount > 0 if strict matching is not feasible
 */
export async function checkCompetitorProfileStatus(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<ProfileStatus> {
  const competitors = await listCompetitorsForProject(supabase, projectId)
  const competitorCount = competitors.length
  const competitorIds = competitors.map((c) => c.id)
  const competitorNames = competitors.map((c) => c.name)

  const artifacts = await listArtifacts(supabase, { projectId })
  
  // Find profile artifacts
  const profileArtifacts = artifacts.filter((a) =>
    COMPETITOR_PROFILE_ARTIFACT_TYPES.includes(a.type as typeof COMPETITOR_PROFILE_ARTIFACT_TYPES[number])
  )

  // Extract snapshots from profile artifacts
  const profileArtifactsWithSnapshots = profileArtifacts.map((artifact) => {
    const content = artifact.content_json as unknown
    let snapshots: CompetitorSnapshot[] = []
    
    if (content && typeof content === 'object' && !Array.isArray(content)) {
      const contentObj = content as Record<string, unknown>
      
      // Format 1: { snapshots: [...] } - current format
      if (Array.isArray(contentObj.snapshots)) {
        snapshots = contentObj.snapshots as CompetitorSnapshot[]
      }
      // Format 2: { content: [...] } - schema format
      else if (Array.isArray(contentObj.content)) {
        snapshots = contentObj.content as CompetitorSnapshot[]
      }
    }
    // Format 3: Direct array (unlikely but handle it)
    else if (Array.isArray(content)) {
      snapshots = content as CompetitorSnapshot[]
    }

    return {
      id: artifact.id,
      type: artifact.type,
      snapshots,
    }
  })

  // Count total snapshots
  const totalSnapshots = profileArtifactsWithSnapshots.reduce(
    (sum, artifact) => sum + artifact.snapshots.length,
    0
  )

  // Check if we have profiles for all competitors
  // We match by competitor_name since that's what's stored in snapshots
  const snapshotNames = new Set(
    profileArtifactsWithSnapshots.flatMap((a) =>
      a.snapshots.map((s) => s.competitor_name)
    )
  )
  
  const allCompetitorsHaveProfiles =
    competitorCount > 0 &&
    competitorNames.every((name) => snapshotNames.has(name)) &&
    totalSnapshots >= competitorCount

  // Profiles are missing if:
  // - No competitors (edge case, should be handled elsewhere)
  // - Not all competitors have profiles
  // - No valid snapshots found
  const missingProfiles =
    competitorCount === 0 ? false : !allCompetitorsHaveProfiles || totalSnapshots === 0

  return {
    competitorsCount: competitorCount,
    profilesCount: totalSnapshots,
    missingProfiles,
    competitorIds,
    profileArtifacts: profileArtifactsWithSnapshots,
  }
}

