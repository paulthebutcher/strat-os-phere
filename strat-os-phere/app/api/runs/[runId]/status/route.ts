import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getRunStatus } from '@/lib/runs/status'
import { getAnalysisRunById } from '@/lib/data/runs'
import { getProjectById } from '@/lib/data/projects'
import type { ArtifactRow } from '@/lib/supabase/database.types'

/**
 * GET /api/runs/[runId]/status
 * Returns the status of an analysis run
 * Checks analysis_runs table first, then falls back to artifacts
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
): Promise<NextResponse> {
  try {
    const { runId } = await params
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

    // Try to get run record to find projectId
    const runRecord = await getAnalysisRunById(supabase, runId)
    let projectId: string | null = null

    if (runRecord) {
      projectId = runRecord.project_id
    } else {
      // Fallback: try to find projectId from artifacts by searching for artifacts with this runId
      // This is a fallback for when the run record doesn't exist yet
      // We'll search for artifacts where content_json contains the runId
      const { data: artifacts, error: artifactsError } = await supabase
        .from('artifacts')
        .select('project_id, content_json')

      if (!artifactsError && artifacts && Array.isArray(artifacts) && artifacts.length > 0) {
        // Filter in memory to find artifacts with matching runId
        // This is not ideal but works as a fallback
        const typedArtifacts = artifacts as Pick<ArtifactRow, 'project_id' | 'content_json'>[]
        for (const artifact of typedArtifacts) {
          const contentJson = artifact.content_json
          if (
            contentJson &&
            typeof contentJson === 'object' &&
            'run_id' in contentJson &&
            contentJson.run_id === runId
          ) {
            projectId = artifact.project_id
            break
          }
        }
      }
    }

    // If we have projectId, get status
    if (projectId) {
      // Verify user has access to this project
      const project = await getProjectById(supabase, projectId)
      if (!project || project.user_id !== user.id) {
        return NextResponse.json(
          { error: 'Forbidden' },
          { status: 403 }
        )
      }

      const statusInfo = await getRunStatus(supabase, runId, projectId)
      return NextResponse.json(statusInfo)
    }

    // If no projectId found, return unknown status
    // This can happen if the run doesn't exist yet
    return NextResponse.json({
      status: 'queued',
      progress: undefined,
      updatedAt: undefined,
    })
  } catch (error) {
    console.error('Error fetching run status:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}

