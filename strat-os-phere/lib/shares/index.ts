import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { getProjectById } from '@/lib/data/projects'
import { listArtifacts } from '@/lib/data/artifacts'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
function getTypedClient(client: Client): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

interface ProjectShareRow {
  id: string
  project_id: string
  share_token: string
  created_at: string
  revoked_at: string | null
  created_by: string | null
}

/**
 * Create a share link for a project
 * Returns the share token that can be used to access the project publicly
 */
export async function createShareLink(
  client: Client,
  projectId: string,
  userId: string
): Promise<{ shareToken: string }> {
  // Verify project belongs to user
  const project = await getProjectById(client, projectId)
  if (!project || project.user_id !== userId) {
    throw new Error('Project not found or access denied')
  }

  // Check if an active share already exists
  const typedClient = getTypedClient(client)
  const result = await (typedClient
    .from('project_shares' as any)
    .select('share_token')
    .eq('project_id', projectId)
    .is('revoked_at', null)
    .maybeSingle() as unknown as Promise<{ data: { share_token: string } | null; error: any }>)
  const { data: existingShare, error: findError } = result

  if (findError) {
    throw new Error(`Failed to check existing shares: ${findError.message}`)
  }

  if (existingShare?.share_token) {
    // Return existing active share token
    return { shareToken: existingShare.share_token }
  }

  // Create new share
  const createResult = await (typedClient
    .from('project_shares' as any)
    .insert({
      project_id: projectId,
      created_by: userId,
    } as any)
    .select('share_token')
    .single() as unknown as Promise<{ data: { share_token: string } | null; error: any }>)
  const { data: newShare, error: createError } = createResult

  if (createError) {
    throw new Error(`Failed to create share link: ${createError.message}`)
  }

  if (!newShare?.share_token) {
    throw new Error('No share token returned')
  }

  return { shareToken: newShare.share_token }
}

/**
 * Revoke a share link for a project
 */
export async function revokeShareLink(
  client: Client,
  projectId: string,
  userId: string
): Promise<void> {
  // Verify project belongs to user
  const project = await getProjectById(client, projectId)
  if (!project || project.user_id !== userId) {
    throw new Error('Project not found or access denied')
  }

  const typedClient = getTypedClient(client)
  const revokeResult = await ((typedClient
    .from('project_shares' as any) as any)
    .update({ revoked_at: new Date().toISOString() })
    .eq('project_id', projectId)
    .is('revoked_at', null) as unknown as Promise<{ error: any }>)
  const { error } = revokeResult

  if (error) {
    throw new Error(`Failed to revoke share link: ${error.message}`)
  }
}

/**
 * Get shared project data by token
 * Returns null if token is invalid, revoked, or project doesn't exist
 */
export interface SharedProjectData {
  project: {
    id: string
    name: string
    market: string | null
  }
  opportunitiesV3: unknown | null
  opportunitiesV2: unknown | null
  profiles: { snapshots: unknown[] } | null
  strategicBets: unknown | null
  jtbd: unknown | null
  competitorCount: number
  generatedAt: string | null
}

export async function getSharedProjectByToken(
  client: Client,
  shareToken: string
): Promise<SharedProjectData | null> {
  const typedClient = getTypedClient(client)

  // Find the share record
  const shareResult = await (typedClient
    .from('project_shares' as any)
    .select('project_id, revoked_at')
    .eq('share_token', shareToken)
    .single() as unknown as Promise<{ data: { project_id: string; revoked_at: string | null } | null; error: any }>)
  const { data: share, error: shareError } = shareResult

  if (shareError || !share) {
    return null
  }

  // Check if revoked
  if (share.revoked_at) {
    return null
  }

  // Get project
  const project = await getProjectById(client, share.project_id)
  if (!project) {
    return null
  }

  // Get artifacts and competitors
  const [artifacts, competitors] = await Promise.all([
    listArtifacts(client, { projectId: share.project_id }),
    listCompetitorsForProject(client, share.project_id),
  ])

  // Normalize artifacts
  const normalized = normalizeResultsArtifacts(artifacts)

  return {
    project: {
      id: project.id,
      name: project.name,
      market: project.market,
    },
    opportunitiesV3: normalized.opportunitiesV3?.content || null,
    opportunitiesV2: normalized.opportunitiesV2?.content || null,
    profiles: normalized.profiles
      ? { snapshots: normalized.profiles.snapshots }
      : null,
    strategicBets: normalized.strategicBets?.content || null,
    jtbd: normalized.jtbd?.content || null,
    competitorCount: competitors.length,
    generatedAt: normalized.generatedAt,
  }
}

