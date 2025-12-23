import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { generateResultsV2 } from '@/lib/results/generateV2'
import { initializeRun } from '@/lib/results/progressWriter'

// Generate run ID (same logic as in generateV2)
function generateRunId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID()
  }
  return `run_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`
}
import { updateProjectSafe } from '@/lib/data/projectsContract'
import { logger } from '@/lib/logger'

export const runtime = 'nodejs'

/**
 * POST /api/results/generate-v2
 * Canonical API route for generating Results v2 artifacts
 * 
 * Returns immediately with runId, then runs generation in background.
 * 
 * Request body: { projectId: string }
 * Response: { ok: true, runId: string } | { ok: false, error: {...} }
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

    // Generate run ID and create run record
    const runId = generateRunId()
    await initializeRun(supabase, projectId, runId)

    // Note: We no longer update latest_run_id as it doesn't exist in production schema
    // Latest run info is now derived from artifacts table via lib/data/latestRun.ts

    // Start generation in background (fire and forget)
    // Note: In production, this should use a proper job queue (e.g., Vercel Queue, BullMQ)
    // For now, we use a fire-and-forget pattern. The generation will continue even if
    // the HTTP request completes, but may be cancelled in serverless environments
    // if the function times out. A proper queue is recommended for production.
    generateResultsV2(projectId, user.id, { runId })
      .then(async (result) => {
        if (result.ok) {
          // Note: We no longer update latest_successful_run_id as it doesn't exist in production schema
          // Latest run info is derived from artifacts table via lib/data/latestRun.ts
          logger.info('Background generation completed', { runId, projectId })
        } else {
          logger.error('Background generation failed', {
            runId,
            projectId,
            error: result.error,
          })
        }
      })
      .catch((error) => {
        logger.error('Background generation error', {
          runId,
          projectId,
          error: error instanceof Error ? error.message : String(error),
        })
      })

    // Return immediately with runId
    return NextResponse.json({
      ok: true,
      runId,
    })
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

