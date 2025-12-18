import type {
  TypedSupabaseClient,
  Competitor,
  NewCompetitor,
} from '@/lib/supabase/types'

type Client = TypedSupabaseClient

export async function createCompetitor(
  client: Client,
  input: NewCompetitor
): Promise<Competitor> {
  const { data, error } = await client
    .from('competitors')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listCompetitorsForProject(
  client: Client,
  projectId: string
): Promise<Competitor[]> {
  const { data, error } = await client
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
  const { data, error } = await client
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


