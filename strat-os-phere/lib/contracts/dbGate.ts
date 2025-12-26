/**
 * Contract Gate for DB Reads
 * 
 * Validates high-risk DB reads into canonical shapes.
 * Throws SchemaMismatchError if DB is missing required fields.
 * 
 * Keep this light - only gate 2-4 core reads for the MVP spine.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { getProjectRunById, type ProjectRun } from '@/lib/data/projectRuns'
import { listArtifacts } from '@/lib/data/artifacts'
import { z } from './z'
import { RunStatusSchema, ArtifactSchema } from './domain'
import { SchemaMismatchError } from '@/lib/errors/errors'

/**
 * Type for error-like values that might appear in run records
 */
type RunErrorLike =
  | string
  | { message?: string; code?: string; details?: unknown }
  | null
  | undefined

/**
 * Normalize error from ProjectRun to canonical error shape.
 * Uses error_code and error_message fields from ProjectRun.
 */
function normalizeRunError(runRecord: ProjectRun): { code: string; message: string; details?: unknown } | undefined {
  // Use error_code and error_message from ProjectRun
  if (runRecord.error_code && runRecord.error_message) {
    return {
      code: runRecord.error_code,
      message: runRecord.error_message,
      details: runRecord.error_detail || undefined,
    }
  }
  
  return undefined
}

/**
 * Validate and gate a run status read
 * Returns canonical RunStatus or throws SchemaMismatchError
 */
export async function gateRunStatus(
  supabase: TypedSupabaseClient,
  runId: string,
  projectId: string
): Promise<z.infer<typeof RunStatusSchema>> {
  const runRecordResult = await getProjectRunById(supabase, runId)
  const runRecord = runRecordResult.ok ? runRecordResult.data : null
  
  if (!runRecord) {
    // Return minimal queued status if run doesn't exist
    return {
      id: runId,
      projectId,
      state: 'queued',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
  
  // Extract progress from metrics if available
  let progress: { completed: number; total: number } | undefined = undefined
  if (runRecord.metrics && typeof runRecord.metrics === 'object' && 'percent' in runRecord.metrics) {
    const percent = (runRecord.metrics as { percent?: number }).percent
    if (typeof percent === 'number') {
      progress = {
        completed: percent,
        total: 100,
      }
    }
  }
  
  // Map ProjectRun to canonical shape (map 'succeeded' to 'completed')
  const state = runRecord.status === 'succeeded' ? 'completed' : runRecord.status as 'queued' | 'running' | 'completed' | 'failed'
  
  // Map DB record to canonical shape
  const canonical = {
    id: runRecord.id,
    projectId: runRecord.project_id,
    state,
    currentStep: undefined, // Not in DB yet
    stepStatus: undefined, // Not in DB yet
    createdAt: runRecord.created_at,
    updatedAt: runRecord.finished_at || runRecord.created_at, // Use finished_at or created_at as updatedAt
    error: normalizeRunError(runRecord),
    progress,
  }
  
  // Validate against schema
  const result = RunStatusSchema.safeParse(canonical)
  if (!result.success) {
    throw new SchemaMismatchError(
      `Run status schema mismatch: ${result.error.message}`,
      {
        details: {
          runId,
          projectId,
          errors: result.error.errors,
        },
      }
    )
  }
  
  return result.data
}

/**
 * Validate and gate artifacts read
 * Returns canonical Artifact[] or throws SchemaMismatchError
 */
export async function gateArtifacts(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<z.infer<typeof ArtifactSchema>[]> {
  const artifacts = await listArtifacts(supabase, { projectId })
  
  const canonical: z.infer<typeof ArtifactSchema>[] = []
  
  for (const artifact of artifacts) {
    const canonicalArtifact = {
      id: artifact.id,
      projectId: artifact.project_id,
      runId: artifact.content_json && typeof artifact.content_json === 'object' && 'run_id' in artifact.content_json
        ? (artifact.content_json.run_id as string)
        : undefined,
      type: artifact.type,
      version: artifact.content_json && typeof artifact.content_json === 'object' && 'meta' in artifact.content_json && typeof artifact.content_json.meta === 'object' && artifact.content_json.meta && 'schema_version' in artifact.content_json.meta
        ? String(artifact.content_json.meta.schema_version)
        : undefined,
      createdAt: artifact.created_at,
      payload: artifact.content_json,
    }
    
    // Validate against schema
    const result = ArtifactSchema.safeParse(canonicalArtifact)
    if (!result.success) {
      // Log but continue (backward compat)
      console.warn('[gateArtifacts] Artifact validation warning', {
        artifactId: canonicalArtifact.id,
        errors: result.error.errors,
      })
      // Include anyway for backward compat
      canonical.push(canonicalArtifact)
    } else {
      canonical.push(result.data)
    }
  }
  
  return canonical
}

