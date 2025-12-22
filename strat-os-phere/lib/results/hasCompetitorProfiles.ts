/**
 * Helper to check if competitor profiles exist for a project
 * Returns structured information about profile status
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { listArtifacts } from '@/lib/data/artifacts'
import { COMPETITOR_PROFILE_ARTIFACT_TYPES } from '@/lib/results/prerequisites'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'

export interface HasCompetitorProfilesResult {
  ok: boolean
  profilesCount: number
  missingCompetitorIds: string[]
}

/**
 * Check if competitor profiles exist
 * Returns ok: true if profiles exist for all competitors, false otherwise
 */
export async function hasCompetitorProfiles(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<HasCompetitorProfilesResult> {
  const competitors = await listCompetitorsForProject(supabase, projectId)
  const competitorIds = competitors.map((c) => c.id)
  const competitorNames = competitors.map((c) => c.name)

  if (competitors.length === 0) {
    return {
      ok: false,
      profilesCount: 0,
      missingCompetitorIds: [],
    }
  }

  const artifacts = await listArtifacts(supabase, { projectId })

  // Find profile artifacts
  const profileArtifacts = artifacts.filter((a) =>
    COMPETITOR_PROFILE_ARTIFACT_TYPES.includes(
      a.type as (typeof COMPETITOR_PROFILE_ARTIFACT_TYPES)[number]
    )
  )

  // Extract snapshots from profile artifacts
  const allSnapshots: CompetitorSnapshot[] = []
  for (const artifact of profileArtifacts) {
    const content = artifact.content_json as unknown
    let snapshots: CompetitorSnapshot[] = []

    if (content && typeof content === 'object' && !Array.isArray(content)) {
      const contentObj = content as Record<string, unknown>

      // Format 1: { snapshots: [...] }
      if (Array.isArray(contentObj.snapshots)) {
        snapshots = contentObj.snapshots as CompetitorSnapshot[]
      }
      // Format 2: { content: [...] }
      else if (Array.isArray(contentObj.content)) {
        snapshots = contentObj.content as CompetitorSnapshot[]
      }
    }
    // Format 3: Direct array
    else if (Array.isArray(content)) {
      snapshots = content as CompetitorSnapshot[]
    }

    allSnapshots.push(...snapshots)
  }

  // Check which competitors have profiles (match by competitor_name)
  const snapshotNames = new Set(allSnapshots.map((s) => s.competitor_name))
  const missingCompetitorNames = competitorNames.filter(
    (name) => !snapshotNames.has(name)
  )

  // Map missing names back to IDs
  const missingCompetitorIds = competitors
    .filter((c) => missingCompetitorNames.includes(c.name))
    .map((c) => c.id)

  const ok = missingCompetitorIds.length === 0 && allSnapshots.length > 0

  return {
    ok,
    profilesCount: allSnapshots.length,
    missingCompetitorIds,
  }
}

