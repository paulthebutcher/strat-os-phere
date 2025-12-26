/**
 * Project Analysis Orchestrator - Idempotent, retryable, step-aware analysis execution.
 * 
 * This orchestrator manages the full lifecycle of a project analysis run:
 * - Resolves input version from project_inputs
 * - Creates or reuses run records (idempotent via idempotency_key)
 * - Manages status transitions (queued → running → succeeded/failed)
 * - Tracks step-aware metrics
 * - Handles errors gracefully
 */

import { createClient } from '@/lib/supabase/server'
import { getLatestProjectInput } from '@/lib/data/projectInputs'
import {
  createProjectRun,
  setRunRunning,
  setRunSucceeded,
  setRunFailed,
  updateRunMetrics,
  type ProjectRun,
} from '@/lib/data/projectRuns'
import { logger } from '@/lib/logger'
import { getEvidenceCoverage } from '@/lib/evidence'
import { evaluateReadiness } from '@/lib/evidence/readiness'
import { invariant } from '@/lib/guardrails/invariants'
import { readLatestEvidenceBundle } from '@/lib/evidence/readBundle'
import { getProjectById } from '@/lib/data/projects'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { generateOpportunitiesV1 } from '@/lib/opportunities/generateOpportunitiesV1'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import { markStepCompleted, markStepFailed } from '@/lib/runs/orchestrator'

/**
 * Pipeline version constant - update when pipeline logic changes
 */
export const PIPELINE_VERSION = '2025-12-23.v1'

/**
 * Result type for runProjectAnalysis
 */
export type RunProjectAnalysisResult =
  | { ok: true; run: ProjectRun }
  | { ok: false; error: { code: string; message: string; runId?: string } }

/**
 * Step status type
 */
type StepStatus = 'started' | 'done' | 'failed'

/**
 * Step definition for metrics tracking
 */
type Step = {
  name: string
  status: StepStatus
  started_at?: string
  finished_at?: string
  error?: string
}

/**
 * Run project analysis with idempotency and step-aware metrics
 */
export async function runProjectAnalysis(
  projectId: string,
  pipelineVersion: string = PIPELINE_VERSION,
  requestedInputVersion?: number
): Promise<RunProjectAnalysisResult> {
  const supabase = await createClient()
  let run: ProjectRun | null = null

  try {
    // Step 1: Resolve input version
    let inputVersion: number

    if (requestedInputVersion !== undefined) {
      inputVersion = requestedInputVersion
    } else {
      // Fetch latest project input (final preferred)
      const inputResult = await getLatestProjectInput(supabase, projectId)
      
      if (!inputResult.ok) {
        // Create a failed run for NO_INPUTS error
        const idempotencyKey = `${projectId}:0:${pipelineVersion}`
        const createResult = await createProjectRun(supabase, {
          projectId,
          inputVersion: 0,
          idempotencyKey,
        })

        if (createResult.ok && createResult.data) {
          const failedResult = await setRunFailed(supabase, createResult.data.id, {
            error_code: 'NO_INPUTS',
            error_message: 'No project inputs found',
            error_detail: inputResult.error.message,
          })

          if (failedResult.ok) {
            return {
              ok: false,
              error: {
                code: 'NO_INPUTS',
                message: 'No project inputs found. Please complete project setup first.',
                runId: failedResult.data.id,
              },
            }
          }
        }

        return {
          ok: false,
          error: {
            code: 'INPUT_FETCH_ERROR',
            message: inputResult.error.message || 'Failed to fetch project inputs',
          },
        }
      }

      if (!inputResult.data) {
        // No inputs exist - create failed run
        const idempotencyKey = `${projectId}:0:${pipelineVersion}`
        const createResult = await createProjectRun(supabase, {
          projectId,
          inputVersion: 0,
          idempotencyKey,
        })

        if (createResult.ok && createResult.data) {
          const failedResult = await setRunFailed(supabase, createResult.data.id, {
            error_code: 'NO_INPUTS',
            error_message: 'No project inputs found',
          })

          if (failedResult.ok) {
            return {
              ok: false,
              error: {
                code: 'NO_INPUTS',
                message: 'No project inputs found. Please complete project setup first.',
                runId: failedResult.data.id,
              },
            }
          }
        }

        return {
          ok: false,
          error: {
            code: 'NO_INPUTS',
            message: 'No project inputs found. Please complete project setup first.',
          },
        }
      }

      inputVersion = inputResult.data.version
    }

    // Step 2: Build idempotency key
    const idempotencyKey = `${projectId}:${inputVersion}:${pipelineVersion}`

    // Step 3: Create or reuse run (idempotent)
    const createResult = await createProjectRun(supabase, {
      projectId,
      inputVersion,
      idempotencyKey,
    })

    if (!createResult.ok) {
      return {
        ok: false,
        error: {
          code: createResult.error.code,
          message: createResult.error.message || 'Failed to create run',
        },
      }
    }

    run = createResult.data

    // If run already exists and is in progress, return it
    if (run.status === 'running' || run.status === 'queued') {
      logger.info('Run already in progress', { runId: run.id, projectId, status: run.status })
      return { ok: true, run }
    }

    // If run already succeeded, return it
    if (run.status === 'succeeded') {
      logger.info('Run already succeeded', { runId: run.id, projectId })
      return { ok: true, run }
    }

    // Step 4: Transition to running
    const runningResult = await setRunRunning(supabase, run.id)
    if (!runningResult.ok) {
      // Try to mark as failed
      await setRunFailed(supabase, run.id, {
        error_code: 'STATUS_TRANSITION_ERROR',
        error_message: 'Failed to transition to running status',
        error_detail: runningResult.error.message,
      })
      return {
        ok: false,
        error: {
          code: runningResult.error.code,
          message: runningResult.error.message || 'Failed to start run',
          runId: run.id,
        },
      }
    }

    run = runningResult.data

    // Step 5: Execute analysis steps with metrics tracking
    const steps: Step[] = []
    
    // Step: validate_inputs
    const validateStep: Step = {
      name: 'validate_inputs',
      status: 'started',
      started_at: new Date().toISOString(),
    }
    steps.push(validateStep)

    try {
      // Validate minimum competitors requirement
      const competitors = await listCompetitorsForProject(supabase, projectId)
      if (competitors.length < MIN_COMPETITORS_FOR_ANALYSIS) {
        validateStep.status = 'failed'
        validateStep.finished_at = new Date().toISOString()
        validateStep.error = `At least ${MIN_COMPETITORS_FOR_ANALYSIS} competitors required`
        
        const failedRun = await setRunFailed(supabase, run.id, {
          error_code: 'INSUFFICIENT_COMPETITORS',
          error_message: `Add at least ${MIN_COMPETITORS_FOR_ANALYSIS} competitors to get useful evidence.`,
          error_detail: `Found ${competitors.length} competitors, need ${MIN_COMPETITORS_FOR_ANALYSIS}`,
          metricsPatch: {
            steps: steps,
          },
        })

        if (failedRun.ok) {
          return {
            ok: false,
            error: {
              code: 'INSUFFICIENT_COMPETITORS',
              message: `Add at least ${MIN_COMPETITORS_FOR_ANALYSIS} competitors to get useful evidence.`,
              runId: run.id,
            },
          }
        }
      }

      // Validation passed
      validateStep.status = 'done'
      validateStep.finished_at = new Date().toISOString()
      
      // Update metrics with progress
      await updateRunMetrics(supabase, run.id, {
        steps: [...steps],
      })
    } catch (error) {
      validateStep.status = 'failed'
      validateStep.finished_at = new Date().toISOString()
      validateStep.error = error instanceof Error ? error.message : String(error)
      
      const failedRun = await setRunFailed(supabase, run.id, {
        error_code: 'VALIDATION_ERROR',
        error_message: 'Failed to validate inputs',
        error_detail: error instanceof Error ? error.stack?.slice(0, 500) : String(error),
        metricsPatch: {
          steps: steps,
        },
      })

      if (failedRun.ok) {
        return {
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Failed to validate inputs',
            runId: failedRun.data.id,
          },
        }
      }
    }

    // Step: collect_evidence (mocked for now)
    const evidenceStep: Step = {
      name: 'collect_evidence',
      status: 'started',
      started_at: new Date().toISOString(),
    }
    steps.push(evidenceStep)

    try {
      // INV-1: Guardrail - Check that evidence_sources exist before proceeding
      const { data: evidenceSources, error: evidenceError } = await supabase
        .from('evidence_sources')
        .select('id')
        .eq('project_id', projectId)
        .limit(1)

      if (evidenceError) {
        throw new Error(`Failed to check evidence sources: ${evidenceError.message}`)
      }

      // Enforce INV-1: Evidence must be harvested before LLM analysis
      const hasEvidence = invariant(
        evidenceSources && evidenceSources.length > 0,
        {
          invariantId: 'INV-1',
          projectId,
          context: 'evidence_check',
          route: '/api/projects/[projectId]/generate',
          details: {
            message: 'No evidence sources found in evidence_sources table',
            evidenceSourcesCount: evidenceSources?.length ?? 0,
          },
        }
      )

      if (!hasEvidence) {
        // No evidence sources found - abort with structured response
        evidenceStep.status = 'failed'
        evidenceStep.finished_at = new Date().toISOString()
        evidenceStep.error = 'No evidence sources found in evidence_sources table'
        
        const failedRun = await setRunFailed(supabase, run.id, {
          error_code: 'INSUFFICIENT_EVIDENCE',
          error_message: 'No evidence sources found. Evidence must be harvested and stored before analysis can be generated.',
          error_detail: 'This analysis requires evidence to be collected first. Please collect evidence for your competitors before generating analysis.',
          metricsPatch: {
            steps: steps,
          },
        })

        if (failedRun.ok) {
          return {
            ok: false,
            error: {
              code: 'INSUFFICIENT_EVIDENCE',
              message: 'No evidence sources found. Evidence must be harvested and stored before analysis can be generated.',
              runId: failedRun.data.id,
            },
          }
        }
      }

      // INV-3: Guardrail - Check evidence readiness thresholds (deterministic check)
      try {
        const coverage = await getEvidenceCoverage(supabase, projectId)
        const readiness = evaluateReadiness(coverage)
        
        // Enforce INV-3: Readiness gating must be deterministic
        const isReady = invariant(
          readiness.isReady,
          {
            invariantId: 'INV-3',
            projectId,
            context: 'readiness_check',
            route: '/api/projects/[projectId]/generate',
            details: {
              message: 'Evidence coverage does not meet minimum thresholds',
              reasons: readiness.reasons,
              missing: readiness.missing,
            },
          }
        )
        
        if (!isReady) {
          evidenceStep.status = 'failed'
          evidenceStep.finished_at = new Date().toISOString()
          evidenceStep.error = `Evidence coverage insufficient: ${readiness.reasons.join('; ')}`
          
          const failedRun = await setRunFailed(supabase, run.id, {
            error_code: 'INSUFFICIENT_EVIDENCE_COVERAGE',
            error_message: 'Evidence coverage does not meet minimum thresholds for analysis generation.',
            error_detail: readiness.reasons.join('; '),
            metricsPatch: {
              steps: steps,
            },
          })

          if (failedRun.ok) {
            return {
              ok: false,
              error: {
                code: 'INSUFFICIENT_EVIDENCE_COVERAGE',
                message: `Evidence coverage insufficient: ${readiness.reasons.join('; ')}`,
                runId: failedRun.data.id,
              },
            }
          }
        }
      } catch (coverageError) {
        // Log but don't fail - coverage check is a guardrail, not a hard requirement
        logger.warn('Failed to check evidence coverage readiness', {
          error: coverageError instanceof Error ? coverageError.message : String(coverageError),
          projectId,
        })
      }

      // Mock evidence collection
      await new Promise(resolve => setTimeout(resolve, 100))
      evidenceStep.status = 'done'
      evidenceStep.finished_at = new Date().toISOString()
      
      // Update metrics with progress
      await updateRunMetrics(supabase, run.id, {
        steps: [...steps],
      })
    } catch (error) {
      evidenceStep.status = 'failed'
      evidenceStep.finished_at = new Date().toISOString()
      evidenceStep.error = error instanceof Error ? error.message : String(error)
      
      const failedRun = await setRunFailed(supabase, run.id, {
        error_code: 'EVIDENCE_COLLECTION_ERROR',
        error_message: 'Failed to collect evidence',
        error_detail: error instanceof Error ? error.stack?.slice(0, 500) : String(error),
        metricsPatch: {
          steps: steps,
        },
      })

      if (failedRun.ok) {
        return {
          ok: false,
          error: {
            code: 'EVIDENCE_COLLECTION_ERROR',
            message: 'Failed to collect evidence',
            runId: failedRun.data.id,
          },
        }
      }
    }

    // Step: generate_opportunities
    const opportunitiesStep: Step = {
      name: 'generate_opportunities',
      status: 'started',
      started_at: new Date().toISOString(),
    }
    steps.push(opportunitiesStep)

    let opportunitiesArtifact: any = null

    try {
      // Get evidence bundle for opportunity generation
      const evidenceBundle = await readLatestEvidenceBundle(supabase, projectId)

      // Get project and competitors for context
      const project = await getProjectById(supabase, projectId)
      const competitors = project ? await listCompetitorsForProject(supabase, projectId) : []

      // Generate opportunities V1
      const generationResult = await generateOpportunitiesV1({
        projectRunId: run.id,
        pipelineVersion,
        inputVersion,
        evidenceBundle,
        projectContext: project
          ? {
              projectId: project.id,
              projectName: project.name || undefined,
              market: project.market || undefined,
              targetCustomer: project.target_customer || undefined,
              competitors: competitors.map((c) => ({
                name: c.name,
                url: c.url || undefined,
              })),
            }
          : undefined,
      })

      // Store opportunities artifact for inclusion in final output
      // Note: Even if opportunities array is empty (fail-closed), we still store the artifact
      opportunitiesArtifact = generationResult.artifact

      opportunitiesStep.status = 'done'
      opportunitiesStep.finished_at = new Date().toISOString()
      
      // Update metrics with progress
      await updateRunMetrics(supabase, run.id, {
        steps: [...steps],
      })
    } catch (error) {
      opportunitiesStep.status = 'failed'
      opportunitiesStep.finished_at = new Date().toISOString()
      opportunitiesStep.error = error instanceof Error ? error.message : String(error)
      
      // Mark analysis step as failed
      await markStepFailed(supabase, run.id, 'analysis', {
        code: 'OPPORTUNITY_GENERATION_ERROR',
        message: 'Failed to generate opportunities',
        detail: error instanceof Error ? error.stack?.slice(0, 500) : String(error),
      })
      
      const failedRun = await setRunFailed(supabase, run.id, {
        error_code: 'OPPORTUNITY_GENERATION_ERROR',
        error_message: 'Failed to generate opportunities',
        error_detail: error instanceof Error ? error.stack?.slice(0, 500) : String(error),
        metricsPatch: {
          steps: steps,
        },
      })

      if (failedRun.ok) {
        return {
          ok: false,
          error: {
            code: 'OPPORTUNITY_GENERATION_ERROR',
            message: 'Failed to generate opportunities',
            runId: failedRun.data.id,
          },
        }
      }
    }

    // Step 6: Mark analysis step as completed
    await markStepCompleted(supabase, run.id, 'analysis')

    // Step 7: Mark as succeeded with output
    // Build output with opportunities artifact if generated
    const output: Record<string, any> = {
      pipeline_version: pipelineVersion,
      input_version: inputVersion,
      summary: 'Analysis completed successfully',
    }

    // Include opportunities artifact if it was generated
    if (opportunitiesArtifact) {
      output.opportunities_artifact_v1 = opportunitiesArtifact
    }

    const successResult = await setRunSucceeded(supabase, run.id, {
      output,
      metricsPatch: {
        steps: steps,
      },
    })

    if (!successResult.ok) {
      // Try to mark as failed
      await markStepFailed(supabase, run.id, 'analysis', {
        code: 'COMPLETION_ERROR',
        message: 'Failed to mark run as succeeded',
        detail: successResult.error.message,
      })
      await setRunFailed(supabase, run.id, {
        error_code: 'COMPLETION_ERROR',
        error_message: 'Failed to mark run as succeeded',
        error_detail: successResult.error.message,
        metricsPatch: {
          steps: steps,
        },
      })

      return {
        ok: false,
        error: {
          code: successResult.error.code,
          message: successResult.error.message || 'Failed to complete run',
          runId: run.id,
        },
      }
    }

    return { ok: true, run: successResult.data }
  } catch (error) {
    // Unhandled error - mark run as failed if we have one
    const errorMessage = error instanceof Error ? error.message : String(error)
    const errorStack = error instanceof Error ? error.stack?.slice(0, 500) : undefined

    if (run) {
      await setRunFailed(supabase, run.id, {
        error_code: 'UNHANDLED',
        error_message: errorMessage,
        error_detail: errorStack,
      })
    }

    logger.error('Unhandled error in runProjectAnalysis', error, { projectId })

    return {
      ok: false,
      error: {
        code: 'UNHANDLED',
        message: errorMessage,
        runId: run?.id,
      },
    }
  }
}

