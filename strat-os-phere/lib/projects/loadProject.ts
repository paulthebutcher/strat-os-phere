/**
 * Unified project loader with fail-open resilience.
 * 
 * This is the single source of truth for loading projects in /projects/[projectId]/* routes.
 * It provides structured error handling and clear diagnostics.
 */

import type { TypedSupabaseClient, Project } from '@/lib/supabase/types'
import { getProjectSafe, type SafeProject } from '@/lib/data/projectsContract'
import { logProjectError } from './logProjectError'
import { isMissingColumnError } from '@/lib/db/safeDb'

/**
 * Result type for project loading operations.
 * Provides structured error information for UI handling.
 */
export type LoadProjectResult =
  | { ok: true; project: SafeProject }
  | { 
      ok: false
      kind: 'not_found' | 'unauthorized' | 'query_failed'
      message?: string
      isMissingColumn?: boolean
    }

/**
 * Load a project by ID with comprehensive error handling.
 * 
 * This function:
 * - Uses the safe project loader (getProjectSafe) that never throws
 * - Returns structured results for UI handling
 * - Provides detailed diagnostics in server logs
 * - Fails-open for missing related data, fails-closed for missing/unauthorized projects
 * 
 * @param client - Supabase client
 * @param projectId - Project ID to load
 * @param userId - User ID for authorization check (optional, will fetch if not provided)
 * @param route - Route path for logging (e.g., "/projects/[id]/overview")
 * @returns LoadProjectResult with structured success/error information
 */
export async function loadProject(
  client: TypedSupabaseClient,
  projectId: string,
  userId?: string,
  route?: string
): Promise<LoadProjectResult> {
  const logRoute = route || `/projects/${projectId}`
  
  // Log start for diagnostics
  console.log(`[project] load start {projectId: ${projectId}}`)
  
  // Get user if not provided
  let effectiveUserId = userId
  if (!effectiveUserId) {
    try {
      const {
        data: { user },
        error: userError,
      } = await client.auth.getUser()
      
      if (userError) {
        logProjectError({
          route: logRoute,
          projectId,
          queryName: 'auth.getUser',
          error: userError,
        })
        return {
          ok: false,
          kind: 'unauthorized',
          message: 'Failed to authenticate',
        }
      }
      
      if (!user) {
        return {
          ok: false,
          kind: 'unauthorized',
          message: 'User not authenticated',
        }
      }
      
      effectiveUserId = user.id
    } catch (error) {
      logProjectError({
        route: logRoute,
        projectId,
        queryName: 'auth.getUser',
        error,
      })
      return {
        ok: false,
        kind: 'unauthorized',
        message: 'Authentication error',
      }
    }
  }
  
  // Load project using safe loader
  const projectResult = await getProjectSafe(client, projectId)
  
  if (!projectResult.ok) {
    // Log detailed error information
    const error = projectResult.error
    const isMissingColumn = error.isMissingColumn || isMissingColumnError(error)
    
    // Enhanced diagnostics logging
    console.error(`[project] load failed {projectId: ${projectId}}`, {
      queryName: 'getProjectSafe',
      route: logRoute,
      error: {
        code: error.code,
        message: error.message,
        isMissingColumn,
      },
      timestamp: new Date().toISOString(),
    })
    
    logProjectError({
      route: logRoute,
      projectId,
      queryName: 'getProjectSafe',
      error: new Error(error.message),
    })
    
    return {
      ok: false,
      kind: 'query_failed',
      message: error.message,
      isMissingColumn,
    }
  }
  
  const project = projectResult.data
  
  // Handle not found
  if (!project) {
    console.log(`[project] not found {projectId: ${projectId}}`)
    return {
      ok: false,
      kind: 'not_found',
      message: 'Project not found',
    }
  }
  
  // Check authorization
  if (project.user_id !== effectiveUserId) {
    console.log(`[project] unauthorized {projectId: ${projectId}, userId: ${effectiveUserId}}`)
    return {
      ok: false,
      kind: 'unauthorized',
      message: 'You do not have access to this project',
    }
  }
  
  // Success
  console.log(`[project] load success {projectId: ${projectId}}`)
  return {
    ok: true,
    project,
  }
}

