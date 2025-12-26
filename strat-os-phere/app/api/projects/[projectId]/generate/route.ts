import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
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
): Promise<NextResponse<{ ok: true; data: GenerateAnalysisResponse } | { ok: false; error: { code: string; message: string; details?: Record<string, unknown> } }>> {
  const { projectId } = await params
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        fail('UNAUTHENTICATED', 'You must be signed in to generate analysis'),
        { status: 401 }
      )
    }

    // Get or create active run
    const runResult = await getOrCreateActiveRun(supabase, projectId, user.id, {
      allowCreate: true,
      pipelineVersion: PIPELINE_VERSION,
    })

    if (!runResult.ok) {
      // Map orchestrator error codes to contract error codes
      const errorCode = runResult.error.code === 'NO_INPUTS'
        ? 'NOT_READY'
        : 'INTERNAL_ERROR'
      return NextResponse.json(
        fail(errorCode, runResult.error.message),
        { status: 400 }
      )
    }

    const run = runResult.run
    const runId = run.id

    // Check analysis step status
    const analysisStepStatus = getStepStatus(run, 'analysis')

    // If analysis step already completed, check for artifacts and return
    if (analysisStepStatus.status === 'completed') {
      // Check if we have a latest successful artifact
      const artifact = await getLatestSuccessfulArtifact(supabase, {
        projectId,
        runId,
        type: 'opportunities_v3', // or whatever the main artifact type is
      })

      if (artifact) {
        logger.info('[generate] Analysis step already completed with artifact', {
          projectId,
          runId,
          artifactId: artifact.id,
        })
        const responseData: GenerateAnalysisResponse = {
          runId,
        }
        const validated = GenerateAnalysisResponseSchema.parse(responseData)
        return NextResponse.json(ok(validated), { status: 200 })
      }
    }

    // If analysis step is running, return current status
    if (analysisStepStatus.status === 'running') {
      logger.info('[generate] Analysis step already running', {
        projectId,
        runId,
      })
      const responseData: GenerateAnalysisResponse = {
        runId,
      }
      const validated = GenerateAnalysisResponseSchema.parse(responseData)
      return NextResponse.json(ok(validated), { status: 200 })
    }

    // Advance run to analysis step (idempotent, handles retry if failed)
    const advanceResult = await advanceRun(supabase, runId, 'analysis')
    if (!advanceResult.ok) {
      return NextResponse.json(
        fail('INTERNAL_ERROR', advanceResult.error.message),
        { status: 500 }
      )
    }

    // Proceed with analysis
    const result = await runProjectAnalysis(projectId, PIPELINE_VERSION)

    if (result.ok) {
      const responseData: GenerateAnalysisResponse = {
        runId: result.run.id,
      }
      
      // Validate outgoing payload
      const validated = GenerateAnalysisResponseSchema.parse(responseData)
      return NextResponse.json(ok(validated), { status: 200 })
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

      logAppError('api.projects.generate', appError, { projectId, runId: result.error.runId })

      // Map to contract error code
      const contractErrorCode = appErrorToCode(appError)
      const statusCode = errorCodeToStatus(contractErrorCode)

      return NextResponse.json(
        fail(contractErrorCode, appError.userMessage, {
          code: appError.code,
          runId: result.error.runId,
          ...appError.details,
        }),
        { status: statusCode }
      )
    }
  } catch (error) {
    const appError = toAppError(error, { projectId, route: '/api/projects/[projectId]/generate' })
    logAppError('api.projects.generate', appError, { projectId })
    
    const contractErrorCode = appErrorToCode(appError)
    const statusCode = errorCodeToStatus(contractErrorCode)
    
    return NextResponse.json(
      fail(contractErrorCode, appError.userMessage, {
        code: appError.code,
        ...appError.details,
      }),
      { status: statusCode }
    )
  }
}

