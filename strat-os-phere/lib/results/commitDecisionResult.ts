/**
 * Decision Result Commit - Canonical persistence contract
 * 
 * This module provides the official commit boundary for decision results.
 * A run is not complete until its Decision Result is committed to durable project state.
 * 
 * The commit mechanism uses project_runs.committed_at as the canonical pointer.
 * When a run has required artifacts and is committed, committed_at is set to now().
 * 
 * This is idempotent: calling commit multiple times for the same run is safe.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/supabase/database.types'
import { getProjectRunById } from '@/lib/data/projectRuns'
import { getLatestSuccessfulArtifact } from '@/lib/artifacts/getLatestSuccessfulArtifact'
import { logger } from '@/lib/logger'

export interface CommitDecisionResultParams {
  projectId: string
  runId: string
}

export interface CommitDecisionResultResult {
  ok: true
  committed: boolean // true if this call committed, false if already committed
  runId: string
}

export interface CommitDecisionResultError {
  ok: false
  code: string
  message: string
  reason?: 'missing_required_artifacts' | 'run_not_found' | 'run_not_succeeded' | 'project_mismatch' | 'unexpected_error'
}

export type CommitDecisionResultResponse =
  | CommitDecisionResultResult
  | CommitDecisionResultError

/**
 * Commit a decision result for a project
 * 
 * This function verifies that:
 * 1. The run exists and belongs to the project
 * 2. The run has status='running' or 'succeeded' (allows committing before final success)
 * 3. The run has required artifacts (opportunities_v3 or opportunities_v2)
 * 
 * If all checks pass, sets project_runs.committed_at = now().
 * This function is idempotent - calling it multiple times is safe.
 * 
 * @param supabase - TypedSupabaseClient instance
 * @param params.projectId - Project ID
 * @param params.runId - Run ID that should be committed
 * @returns CommitDecisionResultResponse
 */
export async function commitDecisionResult(
  supabase: TypedSupabaseClient,
  params: CommitDecisionResultParams
): Promise<CommitDecisionResultResponse> {
  const { projectId, runId } = params

  // Dev-only logging
  if (process.env.NODE_ENV !== 'production') {
    logger.info('[commitDecisionResult] Starting commit', { projectId, runId })
  }

  try {
    // 1. Verify run exists
    const runResult = await getProjectRunById(supabase, runId)
    
    if (!runResult.ok) {
      return {
        ok: false,
        code: runResult.error.code,
        message: runResult.error.message || 'Failed to fetch run',
        reason: 'run_not_found',
      }
    }

    if (!runResult.data) {
      return {
        ok: false,
        code: 'RUN_NOT_FOUND',
        message: `Run ${runId} not found`,
        reason: 'run_not_found',
      }
    }

    const run = runResult.data

    // Verify run belongs to project
    if (run.project_id !== projectId) {
      return {
        ok: false,
        code: 'PROJECT_MISMATCH',
        message: `Run ${runId} does not belong to project ${projectId}`,
        reason: 'project_mismatch',
      }
    }

    // Verify run is in a committable state (running or succeeded)
    if (run.status !== 'running' && run.status !== 'succeeded') {
      return {
        ok: false,
        code: 'RUN_NOT_COMMITTABLE',
        message: `Run ${runId} is not in a committable state (status: ${run.status})`,
        reason: 'run_not_succeeded',
      }
    }

    // Check if already committed (idempotent check)
    if (run.committed_at) {
      if (process.env.NODE_ENV !== 'production') {
        logger.info('[commitDecisionResult] Already committed', {
          projectId,
          runId,
          committedAt: run.committed_at,
        })
      }
      return {
        ok: true,
        committed: false, // Already committed, this call didn't commit
        runId,
      }
    }

    // 2. Verify required artifacts exist (at least one opportunities artifact)
    const v3Artifact = await getLatestSuccessfulArtifact(supabase, {
      projectId,
      runId,
      type: 'opportunities_v3',
    })

    const v2Artifact = await getLatestSuccessfulArtifact(supabase, {
      projectId,
      runId,
      type: 'opportunities_v2',
    })

    if (!v3Artifact && !v2Artifact) {
      return {
        ok: false,
        code: 'MISSING_REQUIRED_ARTIFACTS',
        message: `Run ${runId} missing required artifacts (need opportunities_v3 or opportunities_v2)`,
        reason: 'missing_required_artifacts',
      }
    }

    // 3. Set committed_at = now()
    const typedClient = supabase as unknown as SupabaseClient<Database>
    const { data, error } = await typedClient
      .from('project_runs')
      .update({ committed_at: new Date().toISOString() })
      .eq('id', runId)
      .select()
      .single()

    if (error) {
      if (process.env.NODE_ENV !== 'production') {
        logger.error('[commitDecisionResult] Failed to set committed_at', {
          projectId,
          runId,
          error: error.message,
        })
      }
      return {
        ok: false,
        code: 'COMMIT_FAILED',
        message: `Failed to set committed_at: ${error.message}`,
        reason: 'unexpected_error',
      }
    }

    if (process.env.NODE_ENV !== 'production') {
      logger.info('[commitDecisionResult] Committed', {
        projectId,
        runId,
        committedAt: data.committed_at,
        artifactType: v3Artifact ? 'opportunities_v3' : 'opportunities_v2',
        artifactId: v3Artifact?.id || v2Artifact?.id,
      })
    }

    return {
      ok: true,
      committed: true, // This call committed the run
      runId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    
    if (process.env.NODE_ENV !== 'production') {
      logger.error('[commitDecisionResult] Error', {
        projectId,
        runId,
        error: errorMessage,
      })
    }

    return {
      ok: false,
      code: 'UNEXPECTED_ERROR',
      message: errorMessage,
      reason: 'unexpected_error',
    }
  }
}

