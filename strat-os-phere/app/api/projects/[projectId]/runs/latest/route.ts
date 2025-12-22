import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getLatestRunForProject } from '@/lib/data/runs'
import { getProjectById } from '@/lib/data/projects'

/**
 * GET /api/projects/[projectId]/runs/latest
 * Returns the latest run status for a project
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params
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

    // Verify project access
    const project = await getProjectById(supabase, projectId)
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

    const latestRun = await getLatestRunForProject(supabase, projectId)

    return NextResponse.json({
      ok: true,
      run: latestRun,
      latestSuccessfulRunId: project.latest_successful_run_id,
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

