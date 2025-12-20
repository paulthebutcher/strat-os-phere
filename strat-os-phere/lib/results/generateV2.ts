import 'server-only'

import {
  MIN_COMPETITORS_FOR_ANALYSIS,
  MAX_COMPETITORS_PER_PROJECT,
} from '@/lib/constants'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { createArtifact, listArtifacts } from '@/lib/data/artifacts'
import { getProjectById } from '@/lib/data/projects'
import { callLLM } from '@/lib/llm/callLLM'
import type { ProjectContext } from '@/lib/prompts/snapshot'
import { buildJtbdMessages, JTBD_SCHEMA_SHAPE } from '@/lib/prompts/jtbd'
import {
  buildOpportunitiesMessages,
  OPPORTUNITIES_V2_SCHEMA_SHAPE,
} from '@/lib/prompts/opportunities'
import {
  buildScoringMessages,
  SCORING_MATRIX_SCHEMA_SHAPE,
} from '@/lib/prompts/scoring'
import { buildRepairMessages } from '@/lib/prompts/repair'
import {
  JtbdArtifactContentSchema,
  type JtbdArtifactContent,
} from '@/lib/schemas/jtbd'
import {
  OpportunitiesArtifactContentSchema,
  type OpportunitiesArtifactContent,
} from '@/lib/schemas/opportunities'
import {
  ScoringMatrixArtifactContentSchema,
  type ScoringMatrixArtifactContent,
} from '@/lib/schemas/scoring'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import {
  computeJtbdOpportunityScore,
  computeOpportunityScore,
} from '@/lib/results/scoringHelpers'
import {
  computeResultsV2Signals,
  type ResultsV2QualitySignals,
} from '@/lib/results/qualitySignals'
import {
  type ProgressCallback,
  type ProgressEvent,
  makeProgressEvent,
} from '@/lib/results/progress'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'
import type { MarketSynthesis } from '@/lib/schemas/marketSynthesis'

export type GenerateResultsV2SuccessResult = {
  ok: true
  runId: string
  artifactIds: string[]
  signals: ResultsV2QualitySignals
}

export type GenerateResultsV2ErrorResult = {
  ok: false
  error: {
    code: string
    message: string
  }
  details?: Record<string, unknown>
}

export type GenerateResultsV2Result =
  | GenerateResultsV2SuccessResult
  | GenerateResultsV2ErrorResult

function generateRunId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID()
  }
  return `run_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`
}

function summarizeValidationError(error: string | undefined): string | undefined {
  if (!error) return undefined
  return error.length > 500 ? `${error.slice(0, 497)}...` : error
}

export interface GenerateResultsV2Options {
  runId?: string
  onProgress?: ProgressCallback
}

/**
 * Generate Results v2 artifacts (JTBD, Opportunities, Scoring Matrix)
 * This is the canonical generation function - should only be called from the API route
 */
export async function generateResultsV2(
  projectId: string,
  userId: string,
  options?: GenerateResultsV2Options
): Promise<GenerateResultsV2Result> {
  const runId = options?.runId ?? generateRunId()
  const onProgress = options?.onProgress

  try {
    const supabase = await createClient()

    const project = await getProjectById(supabase, projectId)

    if (!project || project.user_id !== userId) {
      return {
        ok: false,
        error: {
          code: 'PROJECT_NOT_FOUND_OR_FORBIDDEN',
          message: 'Project not found or access denied.',
        },
      }
    }

    // Phase: load_input
    const t0 = performance.now()
    onProgress?.(
      makeProgressEvent(runId, 'load_input', 'Loading project data and competitors...', {
        meta: { competitorCount: 0 },
      })
    )

    const competitors = await listCompetitorsForProject(supabase, projectId)
    const competitorCount = competitors.length

    onProgress?.(
      makeProgressEvent(runId, 'load_input', 'Project data loaded', {
        detail: `Found ${competitorCount} competitor${competitorCount !== 1 ? 's' : ''}`,
        meta: { competitorCount },
      })
    )

    if (competitorCount < MIN_COMPETITORS_FOR_ANALYSIS) {
      return {
        ok: false,
        error: {
          code: 'INSUFFICIENT_COMPETITORS',
          message: 'Add at least 3 competitors to generate results.',
        },
        details: { competitorCount },
      }
    }

    if (competitorCount > MAX_COMPETITORS_PER_PROJECT) {
      return {
        ok: false,
        error: {
          code: 'TOO_MANY_COMPETITORS',
          message: 'Maximum of 7 competitors allowed.',
        },
        details: { competitorCount },
      }
    }

    // Load existing artifacts
    const artifacts = await listArtifacts(supabase, { projectId })
    const profilesArtifact = artifacts.find((a) => a.type === 'profiles')
    const synthesisArtifact = artifacts.find((a) => a.type === 'synthesis')

    if (!profilesArtifact) {
      return {
        ok: false,
        error: {
          code: 'MISSING_PROFILES',
          message: 'Competitor profiles are required. Please generate analysis first.',
        },
      }
    }

    // Parse snapshots from profiles artifact
    const profilesContent = profilesArtifact.content_json as {
      snapshots?: CompetitorSnapshot[]
    }
    const snapshots = profilesContent.snapshots || []

    if (snapshots.length === 0) {
      return {
        ok: false,
        error: {
          code: 'NO_SNAPSHOTS',
          message: 'No competitor snapshots found in profiles artifact.',
        },
      }
    }

    const snapshotsJson = JSON.stringify(snapshots)

    // Parse synthesis if available
    let synthesisJson: string | undefined
    if (synthesisArtifact) {
      const synthesisContent = synthesisArtifact.content_json as {
        synthesis?: MarketSynthesis
      }
      if (synthesisContent.synthesis) {
        synthesisJson = JSON.stringify(synthesisContent.synthesis)
      }
    }

    const projectContext: ProjectContext = {
      market: project.market,
      target_customer: project.target_customer,
      your_product: project.your_product,
      business_goal: project.business_goal,
      geography: project.geography,
    }

    const generatedAt = new Date().toISOString()

    // Phase: jobs_generate
    const tJobsStart = performance.now()
    onProgress?.(
      makeProgressEvent(
        runId,
        'jobs_generate',
        'Extracting the jobs your market actually hires tools for...',
        {
          detail: 'Drafting Jobs to Be Done (1/3)',
          meta: { llmCallsDone: 0, llmCallsTotal: 3 },
        }
      )
    )

    // Generate JTBD
    const jtbdMessages = buildJtbdMessages({
      project: projectContext,
      snapshotsJson,
      synthesisJson,
    })

    let jtbdResponse = await callLLM({
      messages: jtbdMessages,
      jsonMode: true,
      temperature: 0.2,
      maxTokens: 2_400,
    })

    onProgress?.(
      makeProgressEvent(runId, 'jobs_generate', 'Jobs draft complete', {
        detail: 'Validating structure...',
        meta: { llmCallsDone: 1, llmCallsTotal: 3 },
      })
    )

    // Phase: jobs_validate
    onProgress?.(
      makeProgressEvent(
        runId,
        'jobs_validate',
        'Validating structure and removing vague language...',
        {
          meta: { repairsUsed: 0 },
        }
      )
    )

    let jtbdParsed = safeParseLLMJson<JtbdArtifactContent>(
      jtbdResponse.text,
      JtbdArtifactContentSchema
    )

    if (!jtbdParsed.ok) {
      onProgress?.(
        makeProgressEvent(runId, 'jobs_validate', 'Repairing invalid JSON...', {
          detail: 'Model retrying due to invalid JSON (attempt 1/1)',
          meta: { repairsUsed: 1 },
        })
      )

      const schemaShapeText = JSON.stringify(JTBD_SCHEMA_SHAPE, null, 2)

      const repairMessages = buildRepairMessages({
        rawText: jtbdResponse.text,
        schemaName: 'JtbdArtifactContent',
        schemaShapeText,
        validationErrors: jtbdParsed.error,
      })

      const repairResponse = await callLLM({
        messages: repairMessages,
        jsonMode: true,
        temperature: 0.1,
        maxTokens: 2_400,
      })

      jtbdResponse = repairResponse

      jtbdParsed = safeParseLLMJson<JtbdArtifactContent>(
        repairResponse.text,
        JtbdArtifactContentSchema
      )

      if (!jtbdParsed.ok) {
        logger.error('JTBD validation failed after repair', {
          summary: summarizeValidationError(jtbdParsed.error),
        })

        return {
          ok: false,
          error: {
            code: 'JTBD_VALIDATION_FAILED',
            message: 'Failed to validate JTBD output.',
          },
          details: {
            validationError: summarizeValidationError(jtbdParsed.error),
          },
        }
      }
    }

    const tJobsEnd = performance.now()
    logger.debug('JTBD generation completed', {
      durationMs: Math.round(tJobsEnd - tJobsStart),
    })

    onProgress?.(
      makeProgressEvent(runId, 'jobs_validate', 'Jobs validated', {
        detail: `${jtbdParsed.data.jobs.length} jobs extracted`,
        meta: {
          durationMs: Math.round(tJobsEnd - tJobsStart),
        },
      })
    )

    // Compute opportunity scores for JTBD items
    const jtbdWithScores: JtbdArtifactContent = {
      ...jtbdParsed.data,
      jobs: jtbdParsed.data.jobs.map((job) => ({
        ...job,
        opportunity_score: computeJtbdOpportunityScore(
          job.importance_score,
          job.satisfaction_score
        ),
      })),
    }

    // Update meta with schema_version=2
    jtbdWithScores.meta.run_id = runId
    jtbdWithScores.meta.generated_at = generatedAt
    jtbdWithScores.meta.schema_version = 2

    // Phase: scorecard_generate
    const tScorecardStart = performance.now()
    onProgress?.(
      makeProgressEvent(
        runId,
        'scorecard_generate',
        'Building competitive scorecard...',
        {
          detail: 'Drafting Scorecard (2/3)',
          meta: { llmCallsDone: 1, llmCallsTotal: 3 },
        }
      )
    )

    // Generate Scoring Matrix
    const scoringMessages = buildScoringMessages({
      project: projectContext,
      snapshotsJson,
      synthesisJson,
    })

    let scoringResponse = await callLLM({
      messages: scoringMessages,
      jsonMode: true,
      temperature: 0.2,
      maxTokens: 2_400,
    })

    onProgress?.(
      makeProgressEvent(runId, 'scorecard_generate', 'Scorecard draft complete', {
        detail: 'Validating structure...',
        meta: { llmCallsDone: 2, llmCallsTotal: 3 },
      })
    )

    // Phase: scorecard_validate
    onProgress?.(
      makeProgressEvent(
        runId,
        'scorecard_validate',
        'Validating scorecard structure...',
        {
          meta: { repairsUsed: jtbdParsed.ok ? 0 : 1 },
        }
      )
    )

    let scoringParsed = safeParseLLMJson<ScoringMatrixArtifactContent>(
      scoringResponse.text,
      ScoringMatrixArtifactContentSchema
    )

    if (!scoringParsed.ok) {
      onProgress?.(
        makeProgressEvent(runId, 'scorecard_validate', 'Repairing invalid JSON...', {
          detail: 'Model retrying due to invalid JSON (attempt 1/1)',
          meta: { repairsUsed: (jtbdParsed.ok ? 0 : 1) + 1 },
        })
      )

      const schemaShapeText = JSON.stringify(SCORING_MATRIX_SCHEMA_SHAPE, null, 2)

      const repairMessages = buildRepairMessages({
        rawText: scoringResponse.text,
        schemaName: 'ScoringMatrixArtifactContent',
        schemaShapeText,
        validationErrors: scoringParsed.error,
      })

      const repairResponse = await callLLM({
        messages: repairMessages,
        jsonMode: true,
        temperature: 0.1,
        maxTokens: 2_400,
      })

      scoringResponse = repairResponse

      scoringParsed = safeParseLLMJson<ScoringMatrixArtifactContent>(
        repairResponse.text,
        ScoringMatrixArtifactContentSchema
      )

      if (!scoringParsed.ok) {
        logger.error('Scoring validation failed after repair', {
          summary: summarizeValidationError(scoringParsed.error),
        })

        return {
          ok: false,
          error: {
            code: 'SCORING_VALIDATION_FAILED',
            message: 'Failed to validate scoring matrix output.',
          },
          details: {
            validationError: summarizeValidationError(scoringParsed.error),
          },
        }
      }
    }

    const tScorecardEnd = performance.now()
    logger.debug('Scorecard generation completed', {
      durationMs: Math.round(tScorecardEnd - tScorecardStart),
    })

    onProgress?.(
      makeProgressEvent(runId, 'scorecard_validate', 'Scorecard validated', {
        detail: `${scoringParsed.data.criteria.length} criteria defined`,
        meta: {
          durationMs: Math.round(tScorecardEnd - tScorecardStart),
        },
      })
    )

    // Update scoring meta with schema_version=2
    scoringParsed.data.meta.run_id = runId
    scoringParsed.data.meta.generated_at = generatedAt
    scoringParsed.data.meta.schema_version = 2

    // Phase: opportunities_generate
    const tOpportunitiesStart = performance.now()
    onProgress?.(
      makeProgressEvent(
        runId,
        'opportunities_generate',
        'Ranking differentiation opportunities...',
        {
          detail: 'Drafting Opportunities (3/3)',
          meta: { llmCallsDone: 2, llmCallsTotal: 3 },
        }
      )
    )

    // Generate Opportunities (with JTBD context)
    const jtbdJson = JSON.stringify(jtbdWithScores)
    const opportunitiesMessages = buildOpportunitiesMessages({
      project: projectContext,
      snapshotsJson,
      synthesisJson,
      jtbdJson,
    })

    let opportunitiesResponse = await callLLM({
      messages: opportunitiesMessages,
      jsonMode: true,
      temperature: 0.2,
      maxTokens: 2_400,
    })

    onProgress?.(
      makeProgressEvent(runId, 'opportunities_generate', 'Opportunities draft complete', {
        detail: 'Validating structure...',
        meta: { llmCallsDone: 3, llmCallsTotal: 3 },
      })
    )

    // Phase: opportunities_validate
    onProgress?.(
      makeProgressEvent(
        runId,
        'opportunities_validate',
        'Validating opportunities structure...',
        {
          meta: {
            repairsUsed: (jtbdParsed.ok ? 0 : 1) + (scoringParsed.ok ? 0 : 1),
          },
        }
      )
    )

    let opportunitiesParsed = safeParseLLMJson<OpportunitiesArtifactContent>(
      opportunitiesResponse.text,
      OpportunitiesArtifactContentSchema
    )

    if (!opportunitiesParsed.ok) {
      const totalRepairs =
        (jtbdParsed.ok ? 0 : 1) + (scoringParsed.ok ? 0 : 1) + 1
      onProgress?.(
        makeProgressEvent(runId, 'opportunities_validate', 'Repairing invalid JSON...', {
          detail: 'Model retrying due to invalid JSON (attempt 1/1)',
          meta: { repairsUsed: totalRepairs },
        })
      )

      const schemaShapeText = JSON.stringify(
        OPPORTUNITIES_V2_SCHEMA_SHAPE,
        null,
        2
      )

      const repairMessages = buildRepairMessages({
        rawText: opportunitiesResponse.text,
        schemaName: 'OpportunitiesArtifactContent',
        schemaShapeText,
        validationErrors: opportunitiesParsed.error,
      })

      const repairResponse = await callLLM({
        messages: repairMessages,
        jsonMode: true,
        temperature: 0.1,
        maxTokens: 2_400,
      })

      opportunitiesResponse = repairResponse

      opportunitiesParsed = safeParseLLMJson<OpportunitiesArtifactContent>(
        repairResponse.text,
        OpportunitiesArtifactContentSchema
      )

      if (!opportunitiesParsed.ok) {
        logger.error('Opportunities validation failed after repair', {
          summary: summarizeValidationError(opportunitiesParsed.error),
        })

        return {
          ok: false,
          error: {
            code: 'OPPORTUNITIES_VALIDATION_FAILED',
            message: 'Failed to validate opportunities output.',
          },
          details: {
            validationError: summarizeValidationError(opportunitiesParsed.error),
          },
        }
      }
    }

    const tOpportunitiesEnd = performance.now()
    logger.debug('Opportunities generation completed', {
      durationMs: Math.round(tOpportunitiesEnd - tOpportunitiesStart),
    })

    onProgress?.(
      makeProgressEvent(runId, 'opportunities_validate', 'Opportunities validated', {
        detail: `${opportunitiesParsed.data.opportunities.length} opportunities ranked`,
        meta: {
          durationMs: Math.round(tOpportunitiesEnd - tOpportunitiesStart),
        },
      })
    )

    // Phase: scoring_compute
    onProgress?.(
      makeProgressEvent(
        runId,
        'scoring_compute',
        'Computing scores...',
        {
          detail: 'Scoring competitors against weighted criteria',
        }
      )
    )

    // Compute opportunity scores
    const opportunitiesWithScores: OpportunitiesArtifactContent = {
      ...opportunitiesParsed.data,
      opportunities: opportunitiesParsed.data.opportunities.map((opp) => {
        // Find linked JTBD if job_link is provided
        let linkedJtbdScore: number | undefined
        if (opp.job_link !== undefined) {
          const jobIndex =
            typeof opp.job_link === 'number'
              ? opp.job_link - 1
              : parseInt(opp.job_link, 10) - 1
          if (jobIndex >= 0 && jobIndex < jtbdWithScores.jobs.length) {
            linkedJtbdScore = jtbdWithScores.jobs[jobIndex].opportunity_score
          }
        }

        return {
          ...opp,
          score: computeOpportunityScore(
            opp.impact,
            opp.effort,
            opp.confidence,
            linkedJtbdScore
          ),
        }
      }),
    }

    // Update opportunities meta with schema_version=2
    opportunitiesWithScores.meta.run_id = runId
    opportunitiesWithScores.meta.generated_at = generatedAt
    opportunitiesWithScores.meta.schema_version = 2

    // Compute quality signals
    const signals = computeResultsV2Signals({
      jtbd: jtbdWithScores,
      opportunities: opportunitiesWithScores,
      scoringMatrix: scoringParsed.data,
    })

    onProgress?.(
      makeProgressEvent(runId, 'scoring_compute', 'Scores computed', {
        detail: 'All deterministic scores calculated',
      })
    )

    // Store signals in meta for all artifacts
    // Cast to Record<string, unknown> to match schema type (double cast via unknown)
    const signalsRecord = signals as unknown as Record<string, unknown>
    jtbdWithScores.meta.signals = signalsRecord
    opportunitiesWithScores.meta.signals = signalsRecord
    scoringParsed.data.meta.signals = signalsRecord

    // Log quality signals (environment gated)
    logger.info('Results v2 generation completed', {
      runId,
      projectId,
      signals,
    })

    // Phase: save_artifacts
    onProgress?.(
      makeProgressEvent(
        runId,
        'save_artifacts',
        'Writing outputs to your workspace...',
        {
          detail: 'Saving Jobs, Scorecard, and Opportunities',
          meta: { writesDone: 0, writesTotal: 3 },
        }
      )
    )

    // Store artifacts
    // Note: Using type assertions because database types haven't been updated yet
    // The database accepts any string for the type field and any JSON-serializable value
    const jtbdArtifact = await createArtifact(supabase, {
      project_id: projectId,
      type: 'jtbd' as any,
      content_json: jtbdWithScores as any,
    })

    onProgress?.(
      makeProgressEvent(runId, 'save_artifacts', 'Writing outputs to your workspace...', {
        detail: 'Saving Jobs, Scorecard, and Opportunities',
        meta: { writesDone: 1, writesTotal: 3 },
      })
    )

    const opportunitiesArtifact = await createArtifact(supabase, {
      project_id: projectId,
      type: 'opportunities_v2' as any,
      content_json: opportunitiesWithScores as any,
    })

    onProgress?.(
      makeProgressEvent(runId, 'save_artifacts', 'Writing outputs to your workspace...', {
        detail: 'Saving Jobs, Scorecard, and Opportunities',
        meta: { writesDone: 2, writesTotal: 3 },
      })
    )

    const scoringArtifact = await createArtifact(supabase, {
      project_id: projectId,
      type: 'scoring_matrix' as any,
      content_json: scoringParsed.data as any,
    })

    onProgress?.(
      makeProgressEvent(runId, 'save_artifacts', 'Writing outputs to your workspace...', {
        detail: 'This lets you regenerate without losing history',
        meta: { writesDone: 3, writesTotal: 3 },
      })
    )

    // Phase: finalize
    const tTotal = performance.now() - t0
    onProgress?.(
      makeProgressEvent(runId, 'finalize', 'Finalizing artifacts for copy/export...', {
        detail: 'Indexing results for fast reuse',
        meta: {
          artifactCount: 3,
          durationMs: Math.round(tTotal),
        },
      })
    )

    return {
      ok: true,
      runId,
      artifactIds: [
        jtbdArtifact.id,
        opportunitiesArtifact.id,
        scoringArtifact.id,
      ],
      signals,
    }
  } catch (error) {
    logger.error('Unhandled error in generateResultsV2', error)

    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unexpected error during results generation.',
      },
      details:
        error instanceof Error
          ? {
              name: error.name,
              message: error.message,
            }
          : {
              value: String(error),
            },
    }
  }
}

