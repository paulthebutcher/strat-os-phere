import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getProjectRunById } from '@/lib/data/projectRuns'
import { getProjectById } from '@/lib/data/projects'

/**
 * GET /api/runs/[runId]/events
 * Returns the latest events for a run (newest first, max 100)
 * 
 * NOTE: This endpoint currently returns empty events array since project_runs
 * doesn't have a separate events table. Events would need to be stored in
 * the metrics JSONB field or re-implemented separately.
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
    const runResult = await getProjectRunById(supabase, runId)
    const run = runResult.ok ? runResult.data : null
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

    // TODO: Events need to be re-implemented using project_runs.metrics JSONB
    // For now, return empty array
    const events: any[] = []

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

