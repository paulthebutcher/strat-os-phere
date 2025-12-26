import 'server-only'
import { NextResponse } from 'next/server'
import { getProjectById } from '@/lib/data/projects'
import { getStepStatus, type StepName } from '@/lib/runs/orchestrator'
import { ok } from '@/lib/contracts/api'
import { z } from 'zod'
import {
  generateRequestId,
  requireUser,
  parseParams,
  respondOk,
} from '@/lib/api/routeGuard'
import { mapErrorToApiResponse } from '@/lib/api/mapErrorToApiError'
import { logger } from '@/lib/logger'

/**
 * Response schema for run status endpoint
 * Maintains backward compatibility with existing RunStatusResponse
 * Now includes step status information
 */
const RunStatusStepSchema = z.object({
  label: z.string(),
  completed: z.boolean(),
})

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
  steps: z.array(RunStatusStepSchema).optional(),
})

type RunStatusResponseContract = z.infer<typeof RunStatusResponseSchema>

/**
 * GET /api/runs/[runId]/status
 * Returns the status of an analysis run in ApiResponse<RunStatusResponse> format
 * Checks project_runs table and verifies ownership via project
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
): Promise<NextResponse<{ ok: true; data: RunStatusResponseContract } | { ok: false; error: { code: string; message: string; details?: Record<string, unknown>; requestId?: string } }>> {
  const requestId = generateRequestId()

  try {
    // Require authentication
    const authResult = await requireUser(requestId)
    if (!authResult.ok) {
      return authResult.response
    }
    const ctx = authResult.value

    // Validate runId param
    const rawParams = await params
    const paramsResult = parseParams(
      z.object({ runId: z.string().uuid() }),
      rawParams,
      requestId
    )
    if (!paramsResult.ok) {
      return paramsResult.response
    }
    const { runId } = paramsResult.value

    // Get run record from project_runs table
    const { data: runRecord, error: runError } = await ctx.supabase
      .from('project_runs')
      .select('*')
      .eq('id', runId)
      .single()

    if (runError || !runRecord) {
      // Run not found - return queued status (graceful degradation for polling)
      logger.info('[status] Run not found, returning queued status', {
        requestId,
        runId,
      })
      const notFoundResponse: RunStatusResponseContract = {
        runId,
        status: 'queued',
        updatedAt: new Date().toISOString(),
      }
      const notFoundValidated = RunStatusResponseSchema.parse(notFoundResponse)
      return respondOk(notFoundValidated, requestId)
    }

    type ProjectRunRow = {
      id: string
      project_id: string
      status: 'queued' | 'running' | 'succeeded' | 'failed'
      created_at: string
      error_message: string | null
      metrics: Record<string, any>
    }

    const typedRun = runRecord as ProjectRunRow
    const projectId = typedRun.project_id

    // Verify user has access to this project (ownership check)
    const project = await getProjectById(ctx.supabase, projectId)
    if (!project || project.user_id !== ctx.user.id) {
      logger.warn('[status] Access denied - run does not belong to user', {
        requestId,
        runId,
        projectId,
        userId: ctx.user.id,
        projectOwnerId: project?.user_id,
      })
      const { response, statusCode } = mapErrorToApiResponse(
        new Error('You do not have access to this run'),
        requestId,
        { runId, projectId }
      )
      // Override to FORBIDDEN
      return NextResponse.json(
        { ...response, error: { ...response.error, code: 'FORBIDDEN', requestId } },
        { status: 403 }
      )
    }

    // Map project_runs status to RunStatusResponse status
    const statusMap: Record<string, 'queued' | 'running' | 'completed' | 'failed'> = {
      queued: 'queued',
      running: 'running',
      succeeded: 'completed',
      failed: 'failed',
    }

    const status = statusMap[typedRun.status] || 'queued'

    // Get step statuses
    const stepNames: StepName[] = ['context', 'evidence', 'analysis', 'opportunities']
    const stepLabels: Record<StepName, string> = {
      context: 'Context',
      evidence: 'Evidence Collection',
      analysis: 'Analysis',
      opportunities: 'Opportunities',
    }

    const steps = stepNames.map((stepName) => {
      const stepStatus = getStepStatus(typedRun as any, stepName)
      return {
        label: stepLabels[stepName],
        completed: stepStatus.status === 'completed',
      }
    })

    // Calculate progress from step statuses
    const completedSteps = steps.filter((s) => s.completed).length
    const progress = stepNames.length > 0 ? Math.round((completedSteps / stepNames.length) * 100) : undefined

    // Convert to RunStatusResponse format
    const responseData: RunStatusResponseContract = {
      runId,
      analysisId: projectId,
      status,
      progress: progress !== undefined
        ? {
            completed: progress,
            total: 100,
          }
        : undefined,
      updatedAt: typedRun.created_at || new Date().toISOString(),
      errorMessage: typedRun.error_message || undefined,
      steps,
    }
    
    // Validate outgoing payload
    const validated = RunStatusResponseSchema.parse(responseData)
    return respondOk(validated, requestId)
  } catch (error) {
    logger.error('[status] Error fetching run status', {
      requestId,
      error,
    })
    const { response, statusCode } = mapErrorToApiResponse(
      error,
      requestId,
      { route: '/api/runs/[runId]/status' }
    )
    return NextResponse.json(response, { status: statusCode })
  }
}

