import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getLatestRunForProject, projectRunToUiRun } from '@/lib/data/projectRuns'
import { getProjectSafe } from '@/lib/data/projectsContract'

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

    // Verify project access using safe contract
    const projectResult = await getProjectSafe(supabase, projectId)
    if (!projectResult.ok || !projectResult.data || projectResult.data.user_id !== user.id) {
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
    const project = projectResult.data

    const latestRunResult = await getLatestRunForProject(supabase, projectId)
    const latestRun = latestRunResult.ok ? latestRunResult.data : null
    const uiRun = projectRunToUiRun(latestRun)

    return NextResponse.json({
      ok: true,
      run: uiRun,
      // Note: latest_successful_run_id doesn't exist in production schema
      // Latest run info is derived from artifacts table via lib/data/latestRun.ts
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

