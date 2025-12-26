import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { getProjectRunById } from '@/lib/data/projectRuns'
import { getProjectById } from '@/lib/data/projects'
import { listArtifacts } from '@/lib/data/artifacts'
import { getArtifactsForRun } from '@/lib/results/runs'

/**
 * GET /api/runs/[runId]/artifacts
 * Returns available artifacts for a run (type + created_at)
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

    // Get all artifacts for the project and filter by run_id
    const allArtifacts = await listArtifacts(supabase, { projectId: run.project_id })
    const runArtifacts = getArtifactsForRun(allArtifacts, runId)

    // Return simplified artifact info
    const artifacts = runArtifacts.map((artifact) => ({
      id: artifact.id,
      type: artifact.type,
      created_at: artifact.created_at,
    }))

    return NextResponse.json({
      ok: true,
      artifacts,
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

