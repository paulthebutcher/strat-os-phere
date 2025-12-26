import type { TypedSupabaseClient, Project, NewProject } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { PROJECT_FULL_SELECT, PROJECT_LIST_SELECT, PROJECT_DASHBOARD_SELECT } from './projectSelect'
import { isMissingColumnError } from '@/lib/db/safeDb'
import { buildProjectUpdate } from '@/lib/db/projectUpdate'
import { getLatestAnalysisInfoForProjects } from './latestRun'
import { getLatestRunForProject, getLatestCommittedRunForProject } from './projectRuns'

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
  // Use buildProjectUpdate to filter out any unknown columns (e.g., decision_framing, starting_point, customer_profile)
  const insertPayload = buildProjectUpdate(input) as unknown as Database['public']['Tables']['projects']['Insert']
  const query = typedClient.from('projects') as unknown as {
    insert: (values: Database['public']['Tables']['projects']['Insert']) => {
      select: (columns?: string) => {
        single: () => Promise<{ data: Project | null; error: { message: string; code?: string } | null }>
      }
    }
  }
  // Use safe selector that excludes non-existent columns (starting_point, customer_profile, decision_framing)
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

/**
 * @deprecated This function is deprecated. Use updateProjectSafe from projectsContract.ts instead.
 * Note: latest_successful_run_id and latest_run_id do not exist in production schema.
 */
export async function updateProjectRunFields(
  client: Client,
  projectId: string,
  fields: Record<string, never> // Empty - no fields to update
): Promise<void> {
  // No-op: latest_successful_run_id doesn't exist in production schema
  // Latest run info is derived from artifacts table via lib/data/latestRun.ts
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
  // Note: latest_successful_run_id and latest_run_id do not exist in production schema
  // Use lib/data/latestRun.ts to derive latest run info from artifacts table
  created_at: string
  updated_at?: string | null
  competitorCount: number
  competitorsWithEvidenceCount: number
  evidenceSourceCount: number
  latestRunCreatedAt: string | null // Latest run from project_runs
  latestCommittedRunId: string | null // Latest committed run ID (committed_at IS NOT NULL)
  latestCommittedRunCreatedAt: string | null // Latest committed run created_at
  lastArtifactAt?: string | null // Derived from artifacts table
  lastArtifactType?: string | null // Derived from artifacts table
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

  // Fetch counts and latest run info in parallel for all projects
  const [competitorCounts, evidenceCounts, runData, successfulRunData, latestAnalysisInfo] = await Promise.all([
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
    // Get latest run created_at for each project from project_runs (new source of truth)
    // Note: This replaces the old analysis_runs table query
    Promise.all(
      projectIds.map(async (projectId) => {
        const runResult = await getLatestRunForProject(client, projectId)
        if (runResult.ok && runResult.data) {
          return {
            projectId,
            latestRunCreatedAt: runResult.data.created_at,
          }
        }
        return {
          projectId,
          latestRunCreatedAt: null,
        }
      })
    ),
    // Get latest committed run for each project
    Promise.all(
      projectIds.map(async (projectId) => {
        const committedRunResult = await getLatestCommittedRunForProject(client, projectId)
        if (committedRunResult.ok && committedRunResult.data) {
          return {
            projectId,
            latestCommittedRunId: committedRunResult.data.id,
            latestCommittedRunCreatedAt: committedRunResult.data.created_at,
            latestCommittedRunCommittedAt: committedRunResult.data.committed_at,
          }
        }
        return {
          projectId,
          latestCommittedRunId: null,
          latestCommittedRunCreatedAt: null,
          latestCommittedRunCommittedAt: null,
        }
      })
    ),
    // Get latest analysis info from artifacts table (derived, resilient)
    getLatestAnalysisInfoForProjects(client, projectIds),
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
  const latestCommittedRunMap = new Map(
    successfulRunData.map(r => [r.projectId, {
      runId: r.latestCommittedRunId,
      createdAt: r.latestCommittedRunCreatedAt,
      committedAt: r.latestCommittedRunCommittedAt,
    }])
  )

  // Combine data
  return projectList.map((project): ProjectWithCounts => {
    const projectId = project.id
    // Safely extract updated_at (may not exist in schema)
    const updatedAt = 'updated_at' in project && typeof (project as any).updated_at === 'string'
      ? (project as any).updated_at
      : null
    
    const latestInfo = latestAnalysisInfo[projectId]
    
    return {
      id: project.id,
      name: project.name,
      market: project.market,
      // Note: latest_successful_run_id and latest_run_id do not exist in production schema
      created_at: project.created_at,
      updated_at: updatedAt,
      competitorCount: competitorCountMap.get(projectId) ?? 0,
      competitorsWithEvidenceCount: competitorsWithEvidenceMap.get(projectId) ?? 0,
      evidenceSourceCount: evidenceCountMap.get(projectId) ?? 0,
      // Latest run from project_runs (new source of truth, replaces analysis_runs)
      latestRunCreatedAt: latestRunMap.get(projectId) ?? null,
      // Latest committed run from project_runs
      latestCommittedRunId: latestCommittedRunMap.get(projectId)?.runId ?? null,
      latestCommittedRunCreatedAt: latestCommittedRunMap.get(projectId)?.createdAt ?? null,
      // Derived from artifacts table (resilient, no schema drift)
      lastArtifactAt: latestInfo?.lastArtifactAt ?? null,
      lastArtifactType: latestInfo?.lastArtifactType ?? null,
    }
  })
}


