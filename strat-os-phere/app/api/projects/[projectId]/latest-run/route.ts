import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getLatestRunningRunForProject } from '@/lib/data/projectRuns'
import { getProjectById } from '@/lib/data/projects'

/**
 * GET /api/projects/[projectId]/latest-run
 * Returns the latest running/queued run for a project, if any
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> }
): Promise<NextResponse> {
  try {
    const { projectId } = await params
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Verify user has access to this project
    const project = await getProjectById(supabase, projectId)
    if (!project || project.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get latest running run
    const runningRunResult = await getLatestRunningRunForProject(supabase, projectId)
    const runningRun = runningRunResult.ok ? runningRunResult.data : null

    if (!runningRun) {
      return NextResponse.json({
        status: null,
        runId: null,
      })
    }

    // Extract progress from metrics if available, otherwise undefined
    const progress = runningRun.metrics && typeof runningRun.metrics === 'object' && 'percent' in runningRun.metrics
      ? (runningRun.metrics as { percent?: number }).percent
      : undefined

    return NextResponse.json({
      status: runningRun.status,
      runId: runningRun.id,
      progress,
      updatedAt: runningRun.created_at,
    })
  } catch (error) {
    console.error('Error fetching latest run:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

