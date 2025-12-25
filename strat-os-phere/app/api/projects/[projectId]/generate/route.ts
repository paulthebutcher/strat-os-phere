import 'server-only'
import { NextResponse } from 'next/server'
import { runProjectAnalysis, PIPELINE_VERSION } from '@/lib/analysis/runProjectAnalysis'
import { toAppError, NotReadyError, UnauthorizedError, NotFoundError, AnalysisFailedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'

/**
 * Response type matching what the client expects
 */
type GenerateAnalysisResult =
  | { ok: true; runId: string }
  | { ok: false; message: string; details?: Record<string, unknown> }

/**
 * POST /api/projects/[projectId]/generate
 * Triggers a new analysis run for the project using project_runs
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<GenerateAnalysisResult>> {
  const { projectId } = await params
  try {
    const result = await runProjectAnalysis(projectId, PIPELINE_VERSION)

    if (result.ok) {
      return NextResponse.json(
        {
          ok: true,
          runId: result.run.id,
        },
        { status: 200 }
      )
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

      // Map error codes to appropriate HTTP status codes
      const statusCode =
        errorCode === 'UNAUTHENTICATED'
          ? 401
          : errorCode === 'PROJECT_NOT_FOUND_OR_FORBIDDEN' ||
              errorCode === 'NO_INPUTS'
            ? 400
            : 500

      return NextResponse.json(
        {
          ok: false,
          message: appError.userMessage,
          details: {
            code: appError.code,
            runId: result.error.runId,
          },
        },
        { status: statusCode }
      )
    }
  } catch (error) {
    const appError = toAppError(error, { projectId, route: '/api/projects/[projectId]/generate' })
    logAppError('api.projects.generate', appError, { projectId })
    
    const errorResult: GenerateAnalysisResult = {
      ok: false,
      message: appError.userMessage,
      details: {
        code: appError.code,
      },
    }
    return NextResponse.json(errorResult, { status: 500 })
  }
}

