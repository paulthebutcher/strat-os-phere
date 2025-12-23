import type {
  TypedSupabaseClient,
  Competitor,
  NewCompetitor,
  CompetitorUpdate,
} from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { logger } from '@/lib/logger'

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

/**
 * Add multiple competitors in bulk (with deduplication)
 */
export async function addCompetitorsBulk(
  client: Client,
  projectId: string,
  competitors: Array<{ name: string; url: string }>
): Promise<Competitor[]> {
  const typedClient = getTypedClient(client)
  const results: Competitor[] = []

  // Get existing competitors to avoid duplicates
  const existing = await listCompetitorsForProject(client, projectId)
  const existingUrls = new Set(
    existing.map((c) => c.url?.toLowerCase().trim()).filter(Boolean)
  )

  // Filter out duplicates and prepare inserts
  const toInsert = competitors
    .filter((c) => {
      const normalizedUrl = c.url.toLowerCase().trim()
      return !existingUrls.has(normalizedUrl)
    })
    .map((c) => ({
      project_id: projectId,
      name: c.name.trim(),
      url: c.url.trim(),
    }))

  if (toInsert.length === 0) {
    return results
  }

  // Insert in batch (one at a time to avoid type issues)
  for (const item of toInsert) {
    try {
      const competitor = await createCompetitor(client, item)
      results.push(competitor)
    } catch (error) {
      // Log but continue with other inserts
      logger.warn('[competitors] Failed to insert competitor in bulk', {
        error: error instanceof Error ? error.message : String(error),
        competitor: item.name,
      })
    }
  }

  return results
}

/**
 * Remove competitor by URL (useful for deduplication)
 */
export async function removeCompetitorByUrl(
  client: Client,
  projectId: string,
  url: string
): Promise<void> {
  const typedClient = getTypedClient(client)
  const normalizedUrl = url.toLowerCase().trim()

  const { error } = await typedClient
    .from('competitors')
    .delete()
    .eq('project_id', projectId)
    .eq('url', normalizedUrl)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Alias for listCompetitorsForProject (matches PR naming)
 */
export async function listCompetitors(
  client: Client,
  projectId: string
): Promise<Competitor[]> {
  return listCompetitorsForProject(client, projectId)
}

/**
 * Add a single competitor (with URL normalization)
 */
export async function addCompetitor(
  client: Client,
  projectId: string,
  input: { name: string; url: string }
): Promise<Competitor> {
  return createCompetitor(client, {
    project_id: projectId,
    name: input.name.trim(),
    url: input.url.trim(),
  })
}



