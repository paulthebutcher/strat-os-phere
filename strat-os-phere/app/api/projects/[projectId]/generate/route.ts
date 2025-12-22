import 'server-only'
import { NextResponse } from 'next/server'
import { generateAnalysis } from '@/app/projects/[projectId]/results/actions'
import type { GenerateAnalysisResult } from '@/app/projects/[projectId]/results/actions'

/**
 * POST /api/projects/[projectId]/generate
 * Triggers a new analysis run for the project
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse<GenerateAnalysisResult>> {
  try {
    const { projectId } = await params
    const result = await generateAnalysis(projectId)

    if (result.ok) {
      return NextResponse.json(result, { status: 200 })
    } else {
      // Map error codes to appropriate HTTP status codes
      const statusCode =
        result.details?.code === 'UNAUTHENTICATED'
          ? 401
          : result.details?.code === 'PROJECT_NOT_FOUND_OR_FORBIDDEN'
            ? 403
            : 400

      return NextResponse.json(result, { status: statusCode })
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

