import type { TypedSupabaseClient, Project, NewProject } from '@/lib/supabase/types'

type Client = TypedSupabaseClient

export async function createProject(
  client: Client,
  input: NewProject
): Promise<Project> {
  const { data, error } = await client
    .from('projects')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data
}

export async function listProjectsForOwner(
  client: Client,
  ownerId: string
): Promise<Project[]> {
  const { data, error } = await client
    .from('projects')
    .select('*')
    .eq('owner_id', ownerId)
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
  const { data, error } = await client
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


