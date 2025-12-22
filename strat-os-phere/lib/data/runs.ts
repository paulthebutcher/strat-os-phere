import type {
  TypedSupabaseClient,
  AnalysisRun,
  NewAnalysisRun,
  AnalysisRunEvent,
  NewAnalysisRunEvent,
  AnalysisRunStatus,
} from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'

type Client = TypedSupabaseClient

// Helper to get a properly typed Supabase client
function getTypedClient(client: Client): SupabaseClient<Database> {
  return client as unknown as SupabaseClient<Database>
}

/**
 * Create a new analysis run
 */
export async function createAnalysisRun(
  client: Client,
  input: NewAnalysisRun
): Promise<AnalysisRun> {
  const typedClient = getTypedClient(client)
  const insertPayload = input as Database['public']['Tables']['analysis_runs']['Insert']
  const query = typedClient.from('analysis_runs') as unknown as {
    insert: (values: Database['public']['Tables']['analysis_runs']['Insert']) => {
      select: () => {
        single: () => Promise<{ data: AnalysisRun | null; error: { message: string; code?: string } | null }>
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

/**
 * Get an analysis run by ID
 */
export async function getAnalysisRunById(
  client: Client,
  runId: string
): Promise<AnalysisRun | null> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('analysis_runs')
    .select('*')
    .eq('id', runId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(error.message)
  }

  return data
}

/**
 * Get the latest run for a project
 */
export async function getLatestRunForProject(
  client: Client,
  projectId: string
): Promise<AnalysisRun | null> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('analysis_runs')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(error.message)
  }

  return data
}

/**
 * Get the latest running run for a project
 */
export async function getLatestRunningRunForProject(
  client: Client,
  projectId: string
): Promise<AnalysisRun | null> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('analysis_runs')
    .select('*')
    .eq('project_id', projectId)
    .in('status', ['queued', 'running'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    if (error.code === 'PGRST116') {
      return null
    }
    throw new Error(error.message)
  }

  return data
}

/**
 * Update an analysis run
 */
export async function updateAnalysisRun(
  client: Client,
  runId: string,
  updates: Partial<{
    status: AnalysisRunStatus
    started_at: string | null
    completed_at: string | null
    last_heartbeat_at: string | null
    current_phase: string | null
    percent: number | null
    error_message: string | null
  }>
): Promise<void> {
  const typedClient = getTypedClient(client)
  const updatePayload = updates as Database['public']['Tables']['analysis_runs']['Update']
  const query = typedClient.from('analysis_runs') as unknown as {
    update: (values: Database['public']['Tables']['analysis_runs']['Update']) => {
      eq: (column: string, value: string) => Promise<{ error: { message: string; code?: string } | null }>
    }
  }
  const { error } = await query.update(updatePayload).eq('id', runId)

  if (error) {
    throw new Error(error.message)
  }
}

/**
 * Create a progress event for a run
 */
export async function createAnalysisRunEvent(
  client: Client,
  input: NewAnalysisRunEvent
): Promise<AnalysisRunEvent> {
  const typedClient = getTypedClient(client)
  const insertPayload = input as Database['public']['Tables']['analysis_run_events']['Insert']
  const query = typedClient.from('analysis_run_events') as unknown as {
    insert: (values: Database['public']['Tables']['analysis_run_events']['Insert']) => {
      select: () => {
        single: () => Promise<{ data: AnalysisRunEvent | null; error: { message: string; code?: string } | null }>
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

/**
 * List events for a run (newest first)
 */
export async function listAnalysisRunEvents(
  client: Client,
  runId: string,
  limit: number = 100
): Promise<AnalysisRunEvent[]> {
  const typedClient = getTypedClient(client)
  const { data, error } = await typedClient
    .from('analysis_run_events')
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) {
    throw new Error(error.message)
  }

  return data ?? []
}

