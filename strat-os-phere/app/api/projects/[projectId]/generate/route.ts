import 'server-only'
import { NextResponse } from 'next/server'
import { runProjectAnalysis, PIPELINE_VERSION } from '@/lib/analysis/runProjectAnalysis'
import { toAppError, NotReadyError, UnauthorizedError, NotFoundError, AnalysisFailedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { ok, fail } from '@/lib/contracts/api'
import { appErrorToCode, errorCodeToStatus } from '@/lib/contracts/errors'
import { RunIdSchema } from '@/lib/contracts/domain'
import {
  getOrCreateActiveRun,
  getStepStatus,
  advanceRun,
  type StepName,
} from '@/lib/runs/orchestrator'
import { getLatestSuccessfulArtifact } from '@/lib/artifacts/getLatestSuccessfulArtifact'
import { logger } from '@/lib/logger'
import { z } from 'zod'
import {
  generateRequestId,
  requireUser,
  requireProjectOwner,
  parseParams,
  respondOk,
  respondError,
} from '@/lib/api/routeGuard'
import { mapErrorToApiResponse } from '@/lib/api/mapErrorToApiError'

/**
 * Response schema for generate endpoint
 */
const GenerateAnalysisResponseSchema = z.object({
  runId: RunIdSchema,
})

type GenerateAnalysisResponse = z.infer<typeof GenerateAnalysisResponseSchema>

/**
 * POST /api/projects/[projectId]/generate
 * Triggers a new analysis run for the project using project_runs
 * 
 * Idempotent behavior:
 * - If analysis step already completed and latest artifact exists, return it (don't regen)
 * - If analysis step is running, return status
 * - If analysis step failed, allow retry
 * 
 * Returns ApiResponse<{ runId }>
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<{ ok: true; data: GenerateAnalysisResponse } | { ok: false; error: { code: string; message: string; details?: Record<string, unknown>; requestId?: string } }>> {
  const requestId = generateRequestId()
  let projectId: string | undefined

  try {
    // Require authentication
    const authResult = await requireUser(requestId)
    if (!authResult.ok) {
      return authResult.response
    }
    const ctx = authResult.value

    // Validate projectId param
    const rawParams = await params
    const paramsResult = parseParams(
      z.object({ projectId: z.string().uuid() }),
      rawParams,
      requestId
    )
    if (!paramsResult.ok) {
      return paramsResult.response
    }
    projectId = paramsResult.value.projectId

    // Require project ownership
    const ownershipResult = await requireProjectOwner(ctx, projectId)
    if (!ownershipResult.ok) {
      return ownershipResult.response
    }

    // Get or create active run
    const runResult = await getOrCreateActiveRun(ctx.supabase, projectId, ctx.user.id, {
      allowCreate: true,
      pipelineVersion: PIPELINE_VERSION,
    })

    if (!runResult.ok) {
      // Map orchestrator error codes to contract error codes
      const errorCode = runResult.error.code === 'NO_INPUTS'
        ? 'NOT_READY'
        : 'INTERNAL_ERROR'
      return respondError(errorCode, runResult.error.message, { projectId }, requestId)
    }

    const run = runResult.run
    const runId = run.id

    // Check analysis step status
    const analysisStepStatus = getStepStatus(run, 'analysis')

    // If analysis step already completed, check for artifacts and return
    if (analysisStepStatus.status === 'completed') {
      // Check if we have a latest successful artifact
      const artifact = await getLatestSuccessfulArtifact(ctx.supabase, {
        projectId,
        runId,
        type: 'opportunities_v3', // or whatever the main artifact type is
      })

      if (artifact) {
        logger.info('[generate] Analysis step already completed with artifact', {
          requestId,
          projectId,
          runId,
          artifactId: artifact.id,
        })
        const responseData: GenerateAnalysisResponse = {
          runId,
        }
        const validated = GenerateAnalysisResponseSchema.parse(responseData)
        return respondOk(validated, requestId)
      }
    }

    // If analysis step is running, return current status
    if (analysisStepStatus.status === 'running') {
      logger.info('[generate] Analysis step already running', {
        requestId,
        projectId,
        runId,
      })
      const responseData: GenerateAnalysisResponse = {
        runId,
      }
      const validated = GenerateAnalysisResponseSchema.parse(responseData)
      return respondOk(validated, requestId)
    }

    // Advance run to analysis step (idempotent, handles retry if failed)
    const advanceResult = await advanceRun(ctx.supabase, runId, 'analysis')
    if (!advanceResult.ok) {
      return respondError('INTERNAL_ERROR', advanceResult.error.message, { projectId, runId }, requestId)
    }

    // Proceed with analysis
    const result = await runProjectAnalysis(projectId, PIPELINE_VERSION)

    if (result.ok) {
      const responseData: GenerateAnalysisResponse = {
        runId: result.run.id,
      }
      
      // Validate outgoing payload
      const validated = GenerateAnalysisResponseSchema.parse(responseData)
      return respondOk(validated, requestId)
    } else {
      // Convert error to AppError for consistent handling
      let appError: ReturnType<typeof toAppError>
      const errorCode = result.error.code

      if (errorCode === 'UNAUTHENTICATED') {
        appError = new UnauthorizedError(
          result.error.message,
          { details: { projectId, runId: result.error.runId } }
        )
      } else if (errorCode === 'PROJECT_NOT_FOUND_OR_FORBIDDEN' || errorCode === 'NO_INPUTS') {
        appError = new NotFoundError(
          result.error.message,
          { 
            action: { label: 'Back to Projects', href: '/dashboard' },
            details: { projectId, runId: result.error.runId, code: errorCode }
          }
        )
      } else if (errorCode === 'INSUFFICIENT_COMPETITORS') {
        appError = new NotReadyError(
          result.error.message,
          {
            userMessage: result.error.message || 'Add at least 3 competitors to get useful evidence.',
            action: { label: 'Add competitors', href: `/projects/${projectId}/competitors` },
            details: { projectId, runId: result.error.runId, code: errorCode }
          }
        )
      } else if (errorCode === 'INSUFFICIENT_EVIDENCE' || errorCode === 'INSUFFICIENT_EVIDENCE_COVERAGE') {
        appError = new NotReadyError(
          result.error.message,
          {
            userMessage: 'Not enough evidence to generate a credible analysis.',
            action: { label: 'Add evidence', href: `/projects/${projectId}/evidence` },
            details: { projectId, runId: result.error.runId, code: errorCode }
          }
        )
      } else {
        appError = new AnalysisFailedError(
          result.error.message,
          {
            details: { projectId, runId: result.error.runId, code: errorCode }
          }
        )
      }

      logAppError('api.projects.generate', appError, { requestId, projectId, runId: result.error.runId })

      // Map to contract error code
      const contractErrorCode = appErrorToCode(appError)
      const statusCode = errorCodeToStatus(contractErrorCode)

      return NextResponse.json(
        fail(contractErrorCode, appError.userMessage, {
          code: appError.code,
          runId: result.error.runId,
          ...appError.details,
          requestId,
        }),
        { status: statusCode }
      )
    }
  } catch (error) {
    logger.error('[generate] Failed to generate analysis', {
      requestId,
      error,
    })
    const { response, statusCode } = mapErrorToApiResponse(
      error,
      requestId,
      { projectId, route: '/api/projects/[projectId]/generate' }
    )
    return NextResponse.json(response, { status: statusCode })
  }
}

