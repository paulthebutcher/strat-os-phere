import type { TypedSupabaseClient, ArtifactRow } from '@/lib/supabase/types'
import { createArtifact } from '@/lib/data/artifacts'
import type { EvidenceBundle } from './types'

type Client = TypedSupabaseClient

// Type for the selected fields from artifacts table
type ArtifactContentSelect = Pick<ArtifactRow, 'content_json'>

/**
 * Save an evidence bundle as an artifact
 * @param supabase - Supabase client
 * @param projectId - Project ID
 * @param bundle - Evidence bundle to save
 * @returns Artifact ID string
 */
export async function saveEvidenceBundle(
  supabase: Client,
  projectId: string,
  bundle: EvidenceBundle
): Promise<string> {
  // Create artifact with evidence bundle content
  const artifact = await createArtifact(supabase, {
    project_id: projectId,
    type: 'evidence_bundle_v1',
    content_json: bundle as unknown as ArtifactRow['content_json'],
  })

  return artifact.id
}

/**
 * Get the latest evidence bundle for a project
 * @param supabase - Supabase client
 * @param projectId - Project ID
 * @returns Latest evidence bundle or null if none exists
 */
export async function getLatestEvidenceBundle(
  supabase: Client,
  projectId: string
): Promise<EvidenceBundle | null> {
  // Query for latest evidence bundle artifact
  // Select only content_json to ensure proper type inference
  const { data, error } = await supabase
    .from('artifacts')
    .select('content_json')
    .eq('project_id', projectId)
    .eq('type', 'evidence_bundle_v1')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  
  // Type the result to ensure proper inference
  const row = data as ArtifactContentSelect | null

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(error.message)
  }

  // Use optional chaining for cleaner null check
  if (!row?.content_json) {
    return null
  }

  // Type assertion: content_json should be EvidenceBundle
  // In a real implementation, you might want to validate this with Zod
  return row.content_json as unknown as EvidenceBundle
}

