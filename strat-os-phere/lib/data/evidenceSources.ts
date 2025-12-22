import type {
  TypedSupabaseClient,
  EvidenceSource,
  NewEvidenceSource,
} from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
function getTypedClient(client: Client): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

export async function createEvidenceSource(
  client: Client,
  input: NewEvidenceSource
): Promise<EvidenceSource> {
  const typedClient = getTypedClient(client)
  const insertPayload = input as Database['public']['Tables']['evidence_sources']['Insert']
  const query = typedClient.from('evidence_sources') as unknown as {
    insert: (values: Database['public']['Tables']['evidence_sources']['Insert']) => {
      select: () => {
        single: () => Promise<{ data: EvidenceSource | null; error: { message: string; code?: string } | null }>
      }
    }
  }
  const { data, error } = await query.insert(insertPayload).select().single()

  if (error !== null) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('No data returned from insert')
  }

  return data
}

export async function getEvidenceSourcesForDomain(
  client: Client,
  projectId: string,
  domain: string
): Promise<EvidenceSource[]> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('evidence_sources')
    .select('*')
    .eq('project_id', projectId)
    .eq('domain', domain)
    .order('extracted_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getEvidenceSourcesByCompetitor(
  client: Client,
  competitorId: string
): Promise<EvidenceSource[]> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('evidence_sources')
    .select('*')
    .eq('competitor_id', competitorId)
    .order('extracted_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getEvidenceSourcesForProject(
  client: Client,
  projectId: string
): Promise<EvidenceSource[]> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('evidence_sources')
    .select('*')
    .eq('project_id', projectId)
    .order('extracted_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

