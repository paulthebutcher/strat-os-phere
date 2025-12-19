import type { TypedSupabaseClient, Project, NewProject } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
function getTypedClient(client: Client): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

export async function createProject(
  client: Client,
  input: NewProject
): Promise<Project> {
  const typedClient = getTypedClient(client)
  const insertPayload = input as Database['public']['Tables']['projects']['Insert']
  const query = typedClient.from('projects') as unknown as {
    insert: (values: Database['public']['Tables']['projects']['Insert']) => {
      select: () => {
        single: () => Promise<{ data: Project | null; error: { message: string; code?: string } | null }>
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

export async function listProjectsForOwner(
  client: Client,
  ownerId: string
): Promise<Project[]> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('projects')
    .select('*')
    .eq('user_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

export async function getProjectById(
  client: Client,
  projectId: string
): Promise<Project | null> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows found
      return null
    }
    throw new Error(error.message)
  }

  return data
}


