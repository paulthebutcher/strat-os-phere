import type {
  TypedSupabaseClient,
  Artifact,
  NewArtifact,
} from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
// The @supabase/ssr return type is compatible but doesn't preserve the Database generic
function getTypedClient(client: Client): SupabaseClient<Database> {
  // This assertion is safe because TypedSupabaseClient is SupabaseClient<Database>
  // and @supabase/ssr clients are compatible at runtime
  return client as unknown as SupabaseClient<Database>
}

export async function createArtifact(
  client: Client,
  input: NewArtifact
): Promise<Artifact> {
  const typedClient = getTypedClient(client)
  // Type-safe assertion: input is ArtifactInsert which matches Database Insert type
  // @supabase/ssr doesn't preserve Database generic, so we help TypeScript
  const insertPayload = input as Database['public']['Tables']['artifacts']['Insert']
  // Use type assertion on the query chain to work around TypeScript inference limitations
  // This is safe: the client is compatible and input matches the Insert type
  const query = typedClient.from('artifacts') as unknown as {
    insert: (values: Database['public']['Tables']['artifacts']['Insert']) => {
      select: () => {
        single: () => Promise<{ data: Artifact | null; error: { message: string; code?: string } | null }>
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

export interface ListArtifactsParams {
  projectId: string
}

export async function listArtifacts(
  client: Client,
  params: ListArtifactsParams
): Promise<Artifact[]> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('artifacts')
    .select('*')
    .eq('project_id', params.projectId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getArtifactById(
  client: Client,
  artifactId: string
): Promise<Artifact | null> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('artifacts')
    .select('*')
    .eq('id', artifactId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(error.message)
  }

  return data
}
