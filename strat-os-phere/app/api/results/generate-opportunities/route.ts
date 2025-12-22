import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { generateOpportunitiesV3 } from '@/lib/results/generateOpportunitiesV3'

export const runtime = 'nodejs'

/**
 * POST /api/results/generate-opportunities
 * API route for generating Opportunities V3
 * 
 * Request body: { projectId: string }
 * Response: { ok: true, runId: string, artifactId: string } | { ok: false, error: {...} }
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'UNAUTHENTICATED',
            message: 'You must be signed in to generate opportunities.',
          },
        },
        { status: 401 }
      )
    }

    const body = await request.json()
    const projectId = body.projectId as string | undefined

    if (!projectId || typeof projectId !== 'string') {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'projectId is required',
          },
        },
        { status: 400 }
      )
    }

    const result = await generateOpportunitiesV3(projectId, user.id, {})

    if (!result.ok) {
      // Map error codes to HTTP status codes
      const statusCode =
        result.error.code === 'PROJECT_NOT_FOUND_OR_FORBIDDEN'
          ? 403
          : result.error.code === 'UNAUTHENTICATED'
          ? 401
          : result.error.code === 'NO_PROFILES' ||
            result.error.code === 'NO_COMPETITORS'
          ? 409 // Conflict: prerequisite missing
          : result.error.code === 'INVALID_REQUEST'
          ? 400
          : 500

      return NextResponse.json(
        {
          ok: false,
          error: result.error,
        },
        { status: statusCode }
      )
    }

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred',
        },
      },
      { status: 500 }
    )
  }
}

