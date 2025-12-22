import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { listAnalysisRunEvents, getAnalysisRunById } from '@/lib/data/runs'
import { getProjectById } from '@/lib/data/projects'

/**
 * GET /api/runs/[runId]/events
 * Returns the latest events for a run (newest first, max 100)
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
) {
  try {
    const { runId } = await params
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
            message: 'You must be signed in.',
          },
        },
        { status: 401 }
      )
    }

    // Verify run access via project
    const run = await getAnalysisRunById(supabase, runId)
    if (!run) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'RUN_NOT_FOUND',
            message: 'Run not found.',
          },
        },
        { status: 404 }
      )
    }

    const project = await getProjectById(supabase, run.project_id)
    if (!project || project.user_id !== user.id) {
      return NextResponse.json(
        {
          ok: false,
          error: {
            code: 'PROJECT_NOT_FOUND_OR_FORBIDDEN',
            message: 'Project not found or access denied.',
          },
        },
        { status: 403 }
      )
    }

    const events = await listAnalysisRunEvents(supabase, runId, 100)

    return NextResponse.json({
      ok: true,
      events,
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

