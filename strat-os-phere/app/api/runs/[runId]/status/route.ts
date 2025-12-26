import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRunStatus } from '@/lib/runs/status'
import { getAnalysisRunById } from '@/lib/data/runs'
import { getProjectById } from '@/lib/data/projects'
import type { ArtifactRow } from '@/lib/supabase/database.types'
import type { RunStatusResponse } from '@/lib/runs/types'
import { ok, fail } from '@/lib/contracts/api'
import { appErrorToCode, errorCodeToStatus } from '@/lib/contracts/errors'
import { toAppError } from '@/lib/errors/errors'
import { z } from 'zod'

/**
 * Response schema for run status endpoint
 * Maintains backward compatibility with existing RunStatusResponse
 */
const RunStatusResponseSchema = z.object({
  runId: z.string().uuid(),
  analysisId: z.string().uuid().optional(),
  status: z.enum(['queued', 'running', 'completed', 'failed']),
  progress: z.object({
    step: z.string().optional(),
    completed: z.number().min(0).max(100).optional(),
    total: z.number().optional(),
  }).optional(),
  updatedAt: z.string().datetime(),
  errorMessage: z.string().optional(),
})

type RunStatusResponseContract = z.infer<typeof RunStatusResponseSchema>

/**
 * GET /api/runs/[runId]/status
 * Returns the status of an analysis run in ApiResponse<RunStatusResponse> format
 * Checks analysis_runs table first, then falls back to artifacts
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
): Promise<NextResponse<{ ok: true; data: RunStatusResponseContract } | { ok: false; error: { code: string; message: string; details?: Record<string, unknown> } }>> {
  try {
    const { runId } = await params
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        fail('UNAUTHENTICATED', 'You must be signed in to view run status'),
        { status: 401 }
      )
    }

    // Try to get run record to find projectId
    const runRecord = await getAnalysisRunById(supabase, runId)
    let projectId: string | null = null

    if (runRecord) {
      projectId = runRecord.project_id
    } else {
      // Fallback: try to find projectId from artifacts by searching for artifacts with this runId
      // This is a fallback for when the run record doesn't exist yet
      // We'll search for artifacts where content_json contains the runId
      const { data: artifacts, error: artifactsError } = await supabase
        .from('artifacts')
        .select('project_id, content_json')

      if (!artifactsError && artifacts && Array.isArray(artifacts) && artifacts.length > 0) {
        // Filter in memory to find artifacts with matching runId
        // This is not ideal but works as a fallback
        const typedArtifacts = artifacts as Pick<ArtifactRow, 'project_id' | 'content_json'>[]
        for (const artifact of typedArtifacts) {
          const contentJson = artifact.content_json
          if (
            contentJson &&
            typeof contentJson === 'object' &&
            'run_id' in contentJson &&
            contentJson.run_id === runId
          ) {
            projectId = artifact.project_id
            break
          }
        }
      }
    }

    // If we have projectId, get status
    if (projectId) {
      // Verify user has access to this project
      const project = await getProjectById(supabase, projectId)
      if (!project || project.user_id !== user.id) {
        return NextResponse.json(
          fail('FORBIDDEN', 'You do not have access to this run'),
          { status: 403 }
        )
      }

      const statusInfo = await getRunStatus(supabase, runId, projectId)
      
      // Convert to RunStatusResponse format
      const responseData: RunStatusResponseContract = {
        runId,
        analysisId: projectId, // Using projectId as analysisId for now
        status: statusInfo.status as 'queued' | 'running' | 'completed' | 'failed',
        progress: statusInfo.progress
          ? {
              completed: statusInfo.progress,
              total: 100,
            }
          : undefined,
        updatedAt: statusInfo.updatedAt || new Date().toISOString(),
      }
      
      // Validate outgoing payload
      const validated = RunStatusResponseSchema.parse(responseData)
      return NextResponse.json(ok(validated))
    }

    // If no projectId found, return queued status
    // This can happen if the run doesn't exist yet
    const responseData: RunStatusResponseContract = {
      runId,
      status: 'queued',
      updatedAt: new Date().toISOString(),
    }
    
    const validated = RunStatusResponseSchema.parse(responseData)
    return NextResponse.json(ok(validated))
  } catch (error) {
    console.error('Error fetching run status:', error)
    const appError = toAppError(error, { route: '/api/runs/[runId]/status' })
    const errorCode = appErrorToCode(appError)
    const statusCode = errorCodeToStatus(errorCode)
    
    return NextResponse.json(
      fail(errorCode, appError.userMessage, {
        details: appError.details,
      }),
      { status: statusCode }
    )
  }
}

