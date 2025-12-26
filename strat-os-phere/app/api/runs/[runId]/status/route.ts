import 'server-only'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getProjectById } from '@/lib/data/projects'
import { getLatestRunForProject } from '@/lib/data/projectRuns'
import { getStepStatus, type StepName } from '@/lib/runs/orchestrator'
import { ok, fail } from '@/lib/contracts/api'
import { appErrorToCode, errorCodeToStatus } from '@/lib/contracts/errors'
import { toAppError } from '@/lib/errors/errors'
import { z } from 'zod'

/**
 * Response schema for run status endpoint
 * Maintains backward compatibility with existing RunStatusResponse
 * Now includes step status information
 */
const RunStatusStepSchema = z.object({
  label: z.string(),
  completed: z.boolean(),
})

const RunStatusResponseSchema = z.object({
  runId: z.string().uuid(),
  analysisId: z.string().uuid().optional(),
  status: z.enum(['queued', 'running', 'completed', 'failed']),
  progress: z.object({
    step: z.string().optional(),
    completed: z.number().min(0).max(100).optional(),
    total: z.number().optional(),
  }).optional(),
  updatedAt: z.string().datetime(),
  errorMessage: z.string().optional(),
  steps: z.array(RunStatusStepSchema).optional(),
})

type RunStatusResponseContract = z.infer<typeof RunStatusResponseSchema>

/**
 * GET /api/runs/[runId]/status
 * Returns the status of an analysis run in ApiResponse<RunStatusResponse> format
 * Checks analysis_runs table first, then falls back to artifacts
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
): Promise<NextResponse<{ ok: true; data: RunStatusResponseContract } | { ok: false; error: { code: string; message: string; details?: Record<string, unknown> } }>> {
  try {
    const { runId } = await params
    const supabase = await createClient()

    // Get user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        fail('UNAUTHENTICATED', 'You must be signed in to view run status'),
        { status: 401 }
      )
    }

    // Get run record from project_runs table
    const { data: runRecord, error: runError } = await supabase
      .from('project_runs')
      .select('*')
      .eq('id', runId)
      .single()

    if (runError || !runRecord) {
      // Run not found - return queued status
      const notFoundResponse: RunStatusResponseContract = {
        runId,
        status: 'queued',
        updatedAt: new Date().toISOString(),
      }
      const notFoundValidated = RunStatusResponseSchema.parse(notFoundResponse)
      return NextResponse.json(ok(notFoundValidated))
    }

    type ProjectRunRow = {
      id: string
      project_id: string
      status: 'queued' | 'running' | 'succeeded' | 'failed'
      created_at: string
      error_message: string | null
      metrics: Record<string, any>
    }

    const typedRun = runRecord as ProjectRunRow
    const projectId = typedRun.project_id

    // Verify user has access to this project
    const project = await getProjectById(supabase, projectId)
    if (!project || project.user_id !== user.id) {
      return NextResponse.json(
        fail('FORBIDDEN', 'You do not have access to this run'),
        { status: 403 }
      )
    }

    // Map project_runs status to RunStatusResponse status
    const statusMap: Record<string, 'queued' | 'running' | 'completed' | 'failed'> = {
      queued: 'queued',
      running: 'running',
      succeeded: 'completed',
      failed: 'failed',
    }

    const status = statusMap[typedRun.status] || 'queued'

    // Get step statuses
    const stepNames: StepName[] = ['context', 'evidence', 'analysis', 'opportunities']
    const stepLabels: Record<StepName, string> = {
      context: 'Context',
      evidence: 'Evidence Collection',
      analysis: 'Analysis',
      opportunities: 'Opportunities',
    }

    const steps = stepNames.map((stepName) => {
      const stepStatus = getStepStatus(typedRun as any, stepName)
      return {
        label: stepLabels[stepName],
        completed: stepStatus.status === 'completed',
      }
    })

    // Calculate progress from step statuses
    const completedSteps = steps.filter((s) => s.completed).length
    const progress = stepNames.length > 0 ? Math.round((completedSteps / stepNames.length) * 100) : undefined

    // Convert to RunStatusResponse format
    const responseData: RunStatusResponseContract = {
      runId,
      analysisId: projectId,
      status,
      progress: progress !== undefined
        ? {
            completed: progress,
            total: 100,
          }
        : undefined,
      updatedAt: typedRun.created_at || new Date().toISOString(),
      errorMessage: typedRun.error_message || undefined,
      steps,
    }
    
    // Validate outgoing payload
    const validated = RunStatusResponseSchema.parse(responseData)
    return NextResponse.json(ok(validated))
  } catch (error) {
    console.error('Error fetching run status:', error)
    const appError = toAppError(error, { route: '/api/runs/[runId]/status' })
    const errorCode = appErrorToCode(appError)
    const statusCode = errorCodeToStatus(errorCode)
    
    return NextResponse.json(
      fail(errorCode, appError.userMessage, {
        details: appError.details,
      }),
      { status: statusCode }
    )
  }
}

