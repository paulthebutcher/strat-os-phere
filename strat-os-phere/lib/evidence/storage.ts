import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { createArtifact } from '@/lib/data/artifacts'
import type { EvidenceBundle } from './types'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
function getTypedClient(client: Client): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

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
  const typedClient = getTypedClient(supabase)
  
  // Create artifact with evidence bundle content
  const artifact = await createArtifact(supabase, {
    project_id: projectId,
    type: 'evidence_bundle_v1',
    content_json: bundle as unknown as Database['public']['Tables']['artifacts']['Row']['content_json'],
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
  const typedClient = getTypedClient(supabase)
  
  // Query for latest evidence bundle artifact
  const { data, error } = await typedClient
    .from('artifacts')
    .select('*')
    .eq('project_id', projectId)
    .eq('type', 'evidence_bundle_v1')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(error.message)
  }

  if (!data || !data.content_json) {
    return null
  }

  // Type assertion: content_json should be EvidenceBundle
  // In a real implementation, you might want to validate this with Zod
  return data.content_json as unknown as EvidenceBundle
}

