import type {
  TypedSupabaseClient,
  Artifact,
  NewArtifact,
} from '@/lib/supabase/types'

type Client = TypedSupabaseClient

export async function createArtifact(
  client: Client,
  input: NewArtifact
): Promise<Artifact> {
  const { data, error } = await client
    .from('artifacts')
    .insert(input)
    .select()
    .single()

  if (error) {
    throw new Error(error.message)
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
  const { data, error } = await client
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
  const { data, error } = await client
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
