/**
 * Dev-only Run Inspector endpoint
 * 
 * GET /api/runs/[runId]/inspect
 * 
 * Returns comprehensive run telemetry and debug information.
 * Only available in development or when ENABLE_RUN_INSPECTOR=true
 */

import 'server-only'
import { NextResponse } from 'next/server'
import { z } from 'zod'
import {
  generateRequestId,
  requireUser,
  requireProjectOwner,
  parseParams,
  respondOk,
  respondError,
} from '@/lib/api/routeGuard'
import type { ProjectRun } from '@/lib/data/projectRuns'
import { getStepStatus, getTelemetry, type StepName } from '@/lib/runs/orchestrator'
import { RunIdSchema } from '@/lib/contracts/domain'

/**
 * Check if Run Inspector is enabled
 */
function isInspectorEnabled(): boolean {
  if (process.env.NODE_ENV !== 'production') {
    return true
  }
  return process.env.ENABLE_RUN_INSPECTOR === 'true'
}

/**
 * GET /api/runs/[runId]/inspect
 * Returns run telemetry and debug information
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ runId: string }> }
): Promise<NextResponse> {
  const requestId = generateRequestId()

  // Check if inspector is enabled
  if (!isInspectorEnabled()) {
    return respondError('NOT_FOUND', 'Run Inspector not available', undefined, requestId, 404)
  }

  try {
    // Require authentication
    const authResult = await requireUser(requestId)
    if (!authResult.ok) {
      return authResult.response
    }
    const ctx = authResult.value

    // Validate runId param
    const rawParams = await params
    const paramsResult = parseParams(
      z.object({ runId: RunIdSchema }),
      rawParams,
      requestId
    )
    if (!paramsResult.ok) {
      return paramsResult.response
    }
    const { runId } = paramsResult.value

    // Fetch run
    const { data: runData, error: fetchError } = await ctx.supabase
      .from('project_runs')
      .select('*')
      .eq('id', runId)
      .single()

    if (fetchError || !runData) {
      return respondError('NOT_FOUND', 'Run not found', { runId }, requestId, 404)
    }

    const run = runData as ProjectRun

    // Verify project ownership
    const ownershipResult = await requireProjectOwner(ctx, run.project_id)
    if (!ownershipResult.ok) {
      return ownershipResult.response
    }

    // Get telemetry
    const telemetry = getTelemetry(run)

    // Get step statuses
    const stepNames: StepName[] = ['context', 'evidence', 'analysis', 'opportunities']
    const stepStatuses: Record<string, ReturnType<typeof getStepStatus>> = {}
    for (const step of stepNames) {
      stepStatuses[step] = getStepStatus(run, step)
    }

    // Build inspection response
    const inspectionData = {
      runId: run.id,
      projectId: run.project_id,
      status: run.status,
      createdAt: run.created_at,
      startedAt: run.started_at,
      finishedAt: run.finished_at,
      error: run.error_code || run.error_message
        ? {
            code: run.error_code || 'UNKNOWN',
            message: run.error_message || '',
            detail: run.error_detail || undefined,
          }
        : undefined,
      stepStatuses,
      telemetry: {
        timeline: telemetry.timeline,
        counters: telemetry.counters,
        upstreams: telemetry.upstreams,
        lastEvent: telemetry.lastEvent,
        debug: telemetry.debug,
      },
    }

    return respondOk(inspectionData, requestId)
  } catch (error) {
    return respondError(
      'INTERNAL_ERROR',
      error instanceof Error ? error.message : 'Failed to inspect run',
      undefined,
      requestId
    )
  }
}

