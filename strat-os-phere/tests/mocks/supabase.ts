import type { Database } from '@/lib/supabase/database.types'
import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type {
  ProjectRow,
  CompetitorRow,
  ArtifactRow,
  ProjectInsert,
  CompetitorInsert,
  ArtifactInsert,
  CompetitorUpdate,
} from '@/lib/supabase/database.types'
import { vi } from 'vitest'

/**
 * Mock data stores (in-memory database simulation)
 */
export class MockSupabaseStore {
  private projects: Map<string, ProjectRow> = new Map()
  private competitors: Map<string, CompetitorRow> = new Map()
  private artifacts: Map<string, ArtifactRow> = new Map()
  private users: Map<string, { id: string; email: string }> = new Map()

  // User management
  setUser(id: string, email: string) {
    this.users.set(id, { id, email })
  }

  getUser(id: string) {
    return this.users.get(id) || null
  }

  // Projects
  createProject(data: ProjectInsert): ProjectRow {
    const id = `project_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const project: ProjectRow = {
      id,
      ...data,
      // Normalize optional nullable fields: undefined -> null
      your_product: data.your_product ?? null,
      business_goal: data.business_goal ?? null,
      geography: data.geography ?? null,
      primary_constraint: data.primary_constraint ?? null,
      risk_posture: data.risk_posture ?? null,
      ambition_level: data.ambition_level ?? null,
      organizational_capabilities: data.organizational_capabilities ?? null,
      decision_level: data.decision_level ?? null,
      explicit_non_goals: data.explicit_non_goals ?? null,
      input_confidence: data.input_confidence ?? null,
      // Note: drift columns (starting_point, hypothesis, problem_statement, customer_profile,
      // market_context, solution_idea, latest_run_id, latest_successful_run_id) are not included as they don't exist on ProjectRow
      // Use lib/data/latestRun.ts to derive latest run info from artifacts table
      created_at: new Date().toISOString(),
    }
    this.projects.set(id, project)
    return project
  }

  getProject(id: string): ProjectRow | null {
    return this.projects.get(id) || null
  }

  listProjectsByUserId(userId: string): ProjectRow[] {
    return Array.from(this.projects.values())
      .filter((p) => p.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Competitors
  createCompetitor(data: CompetitorInsert): CompetitorRow {
    const id = `competitor_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const competitor: CompetitorRow = {
      id,
      ...data,
      // Normalize optional nullable fields: undefined -> null
      url: data.url ?? null,
      evidence_text: data.evidence_text ?? null,
      evidence_citations: data.evidence_citations ?? null,
      created_at: new Date().toISOString(),
    }
    this.competitors.set(id, competitor)
    return competitor
  }

  getCompetitor(id: string): CompetitorRow | null {
    return this.competitors.get(id) || null
  }

  listCompetitorsByProjectId(projectId: string): CompetitorRow[] {
    return Array.from(this.competitors.values())
      .filter((c) => c.project_id === projectId)
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
  }

  updateCompetitor(id: string, data: CompetitorUpdate): CompetitorRow {
    const existing = this.competitors.get(id)
    if (!existing) {
      throw new Error('Competitor not found')
    }
    const updated: CompetitorRow = {
      ...existing,
      ...data,
    }
    this.competitors.set(id, updated)
    return updated
  }

  deleteCompetitor(id: string): void {
    this.competitors.delete(id)
  }

  // Artifacts
  createArtifact(data: ArtifactInsert): ArtifactRow {
    const id = `artifact_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
    const artifact: ArtifactRow = {
      id,
      ...data,
      created_at: new Date().toISOString(),
    }
    this.artifacts.set(id, artifact)
    return artifact
  }

  getArtifact(id: string): ArtifactRow | null {
    return this.artifacts.get(id) || null
  }

  listArtifactsByProjectId(projectId: string): ArtifactRow[] {
    return Array.from(this.artifacts.values())
      .filter((a) => a.project_id === projectId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Clear all data (useful for test cleanup)
  clear() {
    this.projects.clear()
    this.competitors.clear()
    this.artifacts.clear()
    this.users.clear()
  }
}

/**
 * Type for awaitable query builder result that is both a Promise and chainable
 */
type AwaitableResult<T> = Promise<{ data: T; error: unknown | null }> & {
  select: (...args: unknown[]) => AwaitableResult<unknown>
  insert: (...args: unknown[]) => AwaitableResult<unknown>
  update: (...args: unknown[]) => AwaitableResult<unknown>
  delete: (...args: unknown[]) => AwaitableResult<unknown>
  eq: (...args: unknown[]) => AwaitableResult<unknown>
  in: (...args: unknown[]) => AwaitableResult<unknown>
  order: (...args: unknown[]) => AwaitableResult<unknown>
  single: () => AwaitableResult<unknown>
  maybeSingle: () => AwaitableResult<unknown>
}

/**
 * Helper to create query chain mocks that work with the data layer patterns
 * Supabase query builders are awaitable, so we create a promise-like object
 */
function createQueryBuilder(store: MockSupabaseStore, table: 'projects' | 'competitors' | 'artifacts') {
  // Helper to create an awaitable result
  const createAwaitable = <T>(data: T, error: unknown | null = null): AwaitableResult<T> => {
    const result = Promise.resolve({ data, error })
    // Make it chainable by adding methods
    const awaitable = Object.assign(result, {
      eq: vi.fn((column: string, value: unknown) => {
        // Store the filter for later use
        ;(result as unknown as { _lastFilter?: { column: string; value: unknown } })._lastFilter = { column, value }
        return createAwaitable(data, error)
      }),
      order: vi.fn((column: string, options?: { ascending?: boolean }) => {
        // Store the sort for later use
        ;(result as unknown as { _lastOrder?: { column: string; options?: { ascending?: boolean } } })._lastOrder = { column, options }
        return createAwaitable(data, error)
      }),
      single: vi.fn().mockResolvedValue({ data, error }),
    })
    // Cast through unknown first to satisfy TypeScript (we only implement subset of methods)
    return awaitable as unknown as AwaitableResult<T>
  }

  const chainable = {
    select: vi.fn(() => {
      // Return a chainable object that becomes awaitable
      const builder = {
        eq: vi.fn((column: string, value: any) => {
          if (table === 'projects') {
            if (column === 'id') {
              const result = store.getProject(value)
              return {
                single: vi.fn().mockResolvedValue({
                  data: result,
                  error: result ? null : { message: 'Not found', code: 'PGRST116' },
                }),
              }
            }
            if (column === 'user_id') {
              const results = store.listProjectsByUserId(value)
              return {
                order: vi.fn(() => Promise.resolve({ data: results, error: null })),
              }
            }
          }
          if (table === 'competitors') {
            if (column === 'id') {
              const result = store.getCompetitor(value)
              return {
                single: vi.fn().mockResolvedValue({
                  data: result,
                  error: result ? null : { message: 'Not found', code: 'PGRST116' },
                }),
              }
            }
            if (column === 'project_id') {
              const results = store.listCompetitorsByProjectId(value)
              return {
                order: vi.fn(() => Promise.resolve({ data: results, error: null })),
              }
            }
          }
          if (table === 'artifacts') {
            if (column === 'id') {
              const result = store.getArtifact(value)
              return {
                single: vi.fn().mockResolvedValue({
                  data: result,
                  error: result ? null : { message: 'Not found', code: 'PGRST116' },
                }),
              }
            }
            if (column === 'project_id') {
              const results = store.listArtifactsByProjectId(value)
              return {
                order: vi.fn(() => Promise.resolve({ data: results, error: null })),
              }
            }
          }
          return {
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found', code: 'PGRST116' } }),
          }
        }),
        order: vi.fn(() => {
          const allData =
            table === 'projects'
              ? Array.from(store['projects'].values())
              : table === 'competitors'
              ? Array.from(store['competitors'].values())
              : Array.from(store['artifacts'].values())
          return Promise.resolve({ data: allData, error: null })
        }),
      }
      return builder
    }),
    insert: vi.fn((values: any) => ({
      select: vi.fn(() => ({
        single: vi.fn().mockResolvedValue({
          data: (() => {
            if (table === 'projects') {
              return store.createProject(values as ProjectInsert)
            }
            if (table === 'competitors') {
              return store.createCompetitor(values as CompetitorInsert)
            }
            return store.createArtifact(values as ArtifactInsert)
          })(),
          error: null,
        }),
      })),
    })),
    update: vi.fn((values: any) => ({
      eq: vi.fn((column: string, value: any) => {
        if (table === 'competitors' && column === 'id') {
          const result = store.updateCompetitor(value, values as CompetitorUpdate)
          return {
            select: vi.fn(() => ({
              single: vi.fn().mockResolvedValue({ data: result, error: null }),
            })),
          }
        }
        return {
          select: vi.fn(() => ({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          })),
        }
      }),
    })),
    delete: vi.fn(() => ({
      eq: vi.fn((column: string, value: any) => {
        if (table === 'competitors' && column === 'id') {
          store.deleteCompetitor(value)
          return Promise.resolve({ data: null, error: null })
        }
        return Promise.resolve({ data: null, error: { message: 'Not found' } })
      }),
    })),
  }
  
  return chainable
}

/**
 * Creates a mock Supabase client that uses the provided store
 */
export function createMockSupabaseClient(
  store: MockSupabaseStore,
  currentUserId: string | null = null
): TypedSupabaseClient {
  // Mock auth methods
  const auth = {
    getUser: vi.fn().mockResolvedValue({
      data: {
        user: currentUserId
          ? {
              id: currentUserId,
              email: store.getUser(currentUserId)?.email || 'test@example.com',
            }
          : null,
      },
      error: null,
    }),
    getSession: vi.fn().mockResolvedValue({
      data: {
        session: currentUserId
          ? {
              access_token: 'mock_token',
              refresh_token: 'mock_refresh_token',
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              expires_in: 3600,
              user: {
                id: currentUserId,
                email: store.getUser(currentUserId)?.email || 'test@example.com',
              },
            }
          : null,
      },
      error: null,
    }),
    exchangeCodeForSession: vi.fn().mockResolvedValue({
      data: {
        user: currentUserId
          ? {
              id: currentUserId,
              email: store.getUser(currentUserId)?.email || 'test@example.com',
            }
          : null,
        session: currentUserId
          ? {
              access_token: 'mock_token',
              refresh_token: 'mock_refresh_token',
              expires_at: Math.floor(Date.now() / 1000) + 3600,
              expires_in: 3600,
            }
          : null,
      },
      error: null,
    }),
    signInWithOtp: vi.fn().mockResolvedValue({
      data: {},
      error: null,
    }),
    signOut: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockResolvedValue({
      data: {
        user: currentUserId
          ? {
              id: currentUserId,
              email: store.getUser(currentUserId)?.email || 'test@example.com',
            }
          : null,
        session: currentUserId
          ? {
              access_token: 'mock_token',
              refresh_token: 'mock_refresh_token',
              expires_at: Math.floor(Date.now() / 1000) + 3600,
            }
          : null,
      },
      error: null,
    }),
  }

  // Mock from() method that returns query builders
  const from = vi.fn((table: 'projects' | 'competitors' | 'artifacts') => {
    return createQueryBuilder(store, table)
  })

  return {
    auth,
    from,
  } as unknown as TypedSupabaseClient
}

