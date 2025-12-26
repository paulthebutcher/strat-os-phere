import 'server-only'
import { NextResponse } from 'next/server'
import { runProjectAnalysis, PIPELINE_VERSION } from '@/lib/analysis/runProjectAnalysis'
import { toAppError, NotReadyError, UnauthorizedError, NotFoundError, AnalysisFailedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { ok, fail } from '@/lib/contracts/api'
import { appErrorToCode, errorCodeToStatus } from '@/lib/contracts/errors'
import { RunIdSchema } from '@/lib/contracts/domain'
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
 * Returns ApiResponse<{ runId }>
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<{ ok: true; data: GenerateAnalysisResponse } | { ok: false; error: { code: string; message: string; details?: Record<string, unknown> } }>> {
  const { projectId } = await params
  try {
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

