/**
 * Derived "latest run" resolver that uses artifacts table as source of truth.
 * 
 * This avoids schema drift by not relying on projects.latest_run_id column
 * which doesn't exist in production. Instead, we derive "latest run" information
 * from the artifacts table, which is the most reliable indicator that an analysis
 * has been run for a project.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
function getTypedClient(client: Client): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

export interface LatestAnalysisInfo {
  lastArtifactAt?: string // ISO date string of most recent artifact
  lastArtifactType?: string // Type of most recent artifact
}

/**
 * Get latest analysis info for multiple projects by deriving from artifacts table.
 * 
 * Returns a map keyed by project_id with the most recent artifact information.
 * If a project has no artifacts, it won't appear in the map (graceful degradation).
 */
export async function getLatestAnalysisInfoForProjects(
  client: Client,
  projectIds: string[]
): Promise<Record<string, LatestAnalysisInfo>> {
  if (projectIds.length === 0) {
    return {}
  }

  const typedClient = getTypedClient(client)

  // Query artifacts for all projects, ordered by created_at descending
  // We'll take the first artifact per project as the "latest"
  const { data: artifacts, error } = await typedClient
    .from('artifacts')
    .select('project_id, type, created_at')
    .in('project_id', projectIds)
    .order('created_at', { ascending: false })

  if (error) {
    // Log but don't throw - graceful degradation
    console.warn('Failed to fetch latest analysis info from artifacts:', error)
    return {}
  }

  if (!artifacts || artifacts.length === 0) {
    return {}
  }

  // Type assertion needed because Supabase types are complex
  const artifactList = artifacts as Array<{
    project_id: string
    type: string
    created_at: string
  }>

  // Build a map, keeping only the first (most recent) artifact per project
  const latestByProject = new Map<string, LatestAnalysisInfo>()

  for (const artifact of artifactList) {
    const projectId = artifact.project_id
    // Only keep the first occurrence (most recent due to ordering)
    if (!latestByProject.has(projectId)) {
      latestByProject.set(projectId, {
        lastArtifactAt: artifact.created_at,
        lastArtifactType: artifact.type,
      })
    }
  }

  // Convert Map to Record
  const result: Record<string, LatestAnalysisInfo> = {}
  for (const [projectId, info] of latestByProject.entries()) {
    result[projectId] = info
  }

  return result
}

/**
 * Get latest analysis info for a single project.
 * Convenience wrapper around getLatestAnalysisInfoForProjects.
 */
export async function getLatestAnalysisInfoForProject(
  client: Client,
  projectId: string
): Promise<LatestAnalysisInfo | null> {
  const info = await getLatestAnalysisInfoForProjects(client, [projectId])
  return info[projectId] ?? null
}

