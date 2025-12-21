import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { generateResultsV2 } from '@/lib/results/generateV2'

export const runtime = 'nodejs'

/**
 * POST /api/results/generate-v2
 * Canonical API route for generating Results v2 artifacts
 * 
 * Request body: { projectId: string }
 * Response: { ok: true, runId: string, artifactIds: string[], signals: {...} } | { ok: false, error: {...} }
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
            message: 'You must be signed in to generate results.',
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

    const result = await generateResultsV2(projectId, user.id, {})

    if (!result.ok) {
      // Map error codes to HTTP status codes
      // Use 409 Conflict for prerequisite/missing dependencies (blocked state)
      const statusCode =
        result.error.code === 'PROJECT_NOT_FOUND_OR_FORBIDDEN'
          ? 403
          : result.error.code === 'UNAUTHENTICATED'
          ? 401
          : result.error.code === 'MISSING_COMPETITOR_PROFILES' ||
            result.error.code === 'NO_SNAPSHOTS'
          ? 409 // Conflict: prerequisite missing, run is blocked
          : result.error.code === 'INSUFFICIENT_COMPETITORS' ||
            result.error.code === 'TOO_MANY_COMPETITORS'
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

