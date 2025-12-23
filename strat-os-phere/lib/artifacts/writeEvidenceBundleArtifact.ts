/**
 * Helper to persist an evidence bundle as an artifact
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { createArtifact } from '@/lib/data/artifacts'
import type { HarvestEvidenceBundle } from '@/lib/evidence/types'

export interface WriteEvidenceBundleArtifactParams {
  supabase: TypedSupabaseClient
  projectId: string
  runId: string
  bundle: HarvestEvidenceBundle
  stats: {
    totalSources: number
    uniqueUrls: number
    uniqueDomains: number
    byType: Record<string, number>
  }
}

/**
 * Save evidence bundle as an artifact
 */
export async function writeEvidenceBundleArtifact(
  params: WriteEvidenceBundleArtifactParams
): Promise<{ artifactId: string }> {
  const { supabase, projectId, runId, bundle, stats } = params

  // Store bundle with metadata in content_json
  // The bundle already contains meta information, so we wrap it with run context
  const artifactContent = {
    run_id: runId,
    ...bundle,
    // Add stats at top level for easy access
    stats,
  }

  const artifact = await createArtifact(supabase, {
    project_id: projectId,
    type: 'evidence_bundle_v1',
    content_json: artifactContent,
  })

  return {
    artifactId: artifact.id,
  }
}

