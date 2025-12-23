import 'server-only'
import { NextResponse } from 'next/server'
import { runProjectAnalysis, PIPELINE_VERSION } from '@/lib/analysis/runProjectAnalysis'

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
  try {
    const { projectId } = await params
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
      // Map error codes to appropriate HTTP status codes
      const statusCode =
        result.error.code === 'UNAUTHENTICATED'
          ? 401
          : result.error.code === 'PROJECT_NOT_FOUND_OR_FORBIDDEN' ||
              result.error.code === 'NO_INPUTS'
            ? 400
            : 500

      return NextResponse.json(
        {
          ok: false,
          message: result.error.message,
          details: {
            code: result.error.code,
            runId: result.error.runId,
          },
        },
        { status: statusCode }
      )
    }
  } catch (error) {
    const errorResult: GenerateAnalysisResult = {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Unexpected error during analysis generation.',
      details: {
        code: 'INTERNAL_ERROR',
      },
    }
    return NextResponse.json(errorResult, { status: 500 })
  }
}

