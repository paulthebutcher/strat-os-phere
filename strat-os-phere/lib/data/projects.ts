import type { TypedSupabaseClient, Project, NewProject } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { PROJECT_FULL_SELECT, PROJECT_LIST_SELECT, PROJECT_DASHBOARD_SELECT } from './projectSelect'
import { isMissingColumnError } from '@/lib/db/safeDb'

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
      select: (columns?: string) => {
        single: () => Promise<{ data: Project | null; error: { message: string; code?: string } | null }>
      }
    }
  }
  // Use safe selector that excludes non-existent columns (starting_point, customer_profile)
  const { data, error } = await query.insert(insertPayload).select(PROJECT_FULL_SELECT).single()

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
  // Use safe dashboard selector that only includes confirmed production columns
  const { data, error } = await typedClient
    .from('projects')
    .select(PROJECT_DASHBOARD_SELECT)
    .eq('user_id', ownerId)
    .order('created_at', { ascending: false })

  if (error) {
    // Re-throw with context for error handling
    const enhancedError = new Error(`Failed to list projects: ${error.message}`)
    ;(enhancedError as any).originalError = error
    ;(enhancedError as any).isMissingColumn = isMissingColumnError(error)
    throw enhancedError
  }

  return data ?? []
}

export async function getProjectById(
  client: Client,
  projectId: string
): Promise<Project | null> {
  const typedClient = getTypedClient(client)
  // Use safe selector that excludes non-existent columns (starting_point, customer_profile)
  const { data, error } = await typedClient
    .from('projects')
    .select(PROJECT_FULL_SELECT)
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

export async function updateProjectRunFields(
  client: Client,
  projectId: string,
  fields: {
    latest_successful_run_id?: string | null
    latest_run_id?: string | null
  }
): Promise<void> {
  const typedClient = getTypedClient(client)
  const updatePayload = fields as Database['public']['Tables']['projects']['Update']
  const query = typedClient.from('projects') as unknown as {
    update: (values: Database['public']['Tables']['projects']['Update']) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string; code?: string } | null }>
    }
  }
  const { error } = await query.update(updatePayload).eq('id', projectId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Extended project data with counts for table view
 */
export type ProjectWithCounts = {
  id: string
  name: string
  market: string | null
  latest_successful_run_id: string | null
  latest_run_id: string | null
  created_at: string
  updated_at?: string | null
  competitorCount: number
  competitorsWithEvidenceCount: number
  evidenceSourceCount: number
  latestRunCreatedAt: string | null
}

/**
 * List projects with counts for table view
 * Fetches projects and enriches with competitor/evidence counts and latest run data
 */
export async function listProjectsWithCounts(
  client: Client,
  ownerId: string
): Promise<ProjectWithCounts[]> {
  const typedClient = getTypedClient(client)
  
  // Fetch all projects using safe dashboard selector that only includes confirmed production columns
  const { data: projects, error: projectsError } = await typedClient
    .from('projects')
    .select(PROJECT_DASHBOARD_SELECT)
    .eq('user_id', ownerId)
    .order('created_at', { ascending: false })

  if (projectsError) {
    // Re-throw with context for error handling
    const enhancedError = new Error(`Failed to list projects with counts: ${projectsError.message}`)
    ;(enhancedError as any).originalError = projectsError
    ;(enhancedError as any).isMissingColumn = isMissingColumnError(projectsError)
    throw enhancedError
  }

  if (!projects || projects.length === 0) {
    return []
  }

  // Type assertion needed because Supabase types are complex
  const projectList = projects as Database['public']['Tables']['projects']['Row'][]
  const projectIds = projectList.map(p => p.id)

  // Fetch counts in parallel for all projects
  const [competitorCounts, evidenceCounts, runData] = await Promise.all([
    // Count competitors per project
    Promise.all(
      projectIds.map(async (projectId) => {
        const { count, error } = await typedClient
          .from('competitors')
          .select('*', { count: 'exact', head: true })
          .eq('project_id', projectId)
        
        if (error) {
          console.warn(`Failed to count competitors for project ${projectId}:`, error)
          return { projectId, count: 0 }
        }
        return { projectId, count: count ?? 0 }
      })
    ),
    // Count evidence sources per project and competitors with evidence
    Promise.all(
      projectIds.map(async (projectId) => {
        const [evidenceResult, competitorsResult] = await Promise.all([
          // Count evidence sources
          typedClient
            .from('evidence_sources')
            .select('*', { count: 'exact', head: true })
            .eq('project_id', projectId),
          // Get competitors with evidence (distinct competitor_ids that have evidence)
          typedClient
            .from('evidence_sources')
            .select('competitor_id')
            .eq('project_id', projectId)
            .not('competitor_id', 'is', null)
        ])

        const evidenceCount = evidenceResult.count ?? 0
        const competitorsData = (competitorsResult.data ?? []) as Array<{ competitor_id: string | null }>
        const competitorsWithEvidence = new Set(
          competitorsData
            .map(e => e.competitor_id)
            .filter((id): id is string => id !== null)
        ).size

        return {
          projectId,
          evidenceCount,
          competitorsWithEvidence,
        }
      })
    ),
    // Get latest run created_at for each project
    Promise.all(
      projectIds.map(async (projectId) => {
        const { data, error } = await typedClient
          .from('analysis_runs')
          .select('created_at')
          .eq('project_id', projectId)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.warn(`Failed to get latest run for project ${projectId}:`, error)
        }

        const runData = data as Database['public']['Tables']['analysis_runs']['Row'] | null
        return {
          projectId,
          latestRunCreatedAt: runData?.created_at ?? null,
        }
      })
    ),
  ])

  // Build maps for quick lookup
  const competitorCountMap = new Map(
    competitorCounts.map(c => [c.projectId, c.count])
  )
  const evidenceCountMap = new Map(
    evidenceCounts.map(e => [e.projectId, e.evidenceCount])
  )
  const competitorsWithEvidenceMap = new Map(
    evidenceCounts.map(e => [e.projectId, e.competitorsWithEvidence])
  )
  const latestRunMap = new Map(
    runData.map(r => [r.projectId, r.latestRunCreatedAt])
  )

  // Combine data
  return projectList.map((project): ProjectWithCounts => {
    const projectId = project.id
    // Safely extract updated_at (may not exist in schema)
    const updatedAt = 'updated_at' in project && typeof (project as any).updated_at === 'string'
      ? (project as any).updated_at
      : null
    
    return {
      id: project.id,
      name: project.name,
      market: project.market,
      latest_successful_run_id: project.latest_successful_run_id ?? null,
      latest_run_id: project.latest_run_id ?? null,
      created_at: project.created_at,
      updated_at: updatedAt,
      competitorCount: competitorCountMap.get(projectId) ?? 0,
      competitorsWithEvidenceCount: competitorsWithEvidenceMap.get(projectId) ?? 0,
      evidenceSourceCount: evidenceCountMap.get(projectId) ?? 0,
      latestRunCreatedAt: latestRunMap.get(projectId) ?? null,
    }
  })
}


