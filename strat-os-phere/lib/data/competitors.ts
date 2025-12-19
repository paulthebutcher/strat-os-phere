import type {
  TypedSupabaseClient,
  Competitor,
  NewCompetitor,
  CompetitorUpdate,
} from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
function getTypedClient(client: Client): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

export async function createCompetitor(
  client: Client,
  input: NewCompetitor
): Promise<Competitor> {
  const typedClient = getTypedClient(client)
  const insertPayload = input as Database['public']['Tables']['competitors']['Insert']
  const query = typedClient.from('competitors') as unknown as {
    insert: (values: Database['public']['Tables']['competitors']['Insert']) => {
      select: () => {
        single: () => Promise<{ data: Competitor | null; error: { message: string; code?: string } | null }>
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

export async function listCompetitorsForProject(
  client: Client,
  projectId: string
): Promise<Competitor[]> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('competitors')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getCompetitorById(
  client: Client,
  competitorId: string
): Promise<Competitor | null> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('competitors')
    .select('*')
    .eq('id', competitorId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(error.message)
  }

  return data
}

export async function updateCompetitor(
  client: Client,
  competitorId: string,
  input: CompetitorUpdate
): Promise<Competitor> {
  const typedClient = getTypedClient(client)
  const updatePayload = input as Database['public']['Tables']['competitors']['Update']
  const query = typedClient.from('competitors') as unknown as {
    update: (values: Database['public']['Tables']['competitors']['Update']) => {
      eq: (column: string, value: string) => {
        select: () => {
          single: () => Promise<{ data: Competitor | null; error: { message: string; code?: string } | null }>
        }
      }
    }
  }
  const { data, error } = await query.update(updatePayload).eq('id', competitorId).select().single()

  if (error !== null) {
    throw new Error(error.message)
  }

  if (!data) {
    throw new Error('No data returned from update')
  }

  return data
}

export async function deleteCompetitor(
  client: Client,
  competitorId: string
): Promise<void> {
  const typedClient = getTypedClient(client)
  const { error } = await typedClient.from('competitors').delete().eq('id', competitorId)

  if (error) {
    throw new Error(error.message)
  }
}



