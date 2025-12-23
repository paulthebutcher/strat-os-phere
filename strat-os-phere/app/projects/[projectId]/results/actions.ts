'use server'

import {
  MIN_COMPETITORS_FOR_ANALYSIS,
  MAX_COMPETITORS_PER_PROJECT,
  MAX_EVIDENCE_CHARS,
} from '@/lib/constants'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { createArtifact } from '@/lib/data/artifacts'
import { getProjectSafe, updateProjectSafe } from '@/lib/data/projectsContract'
import { callLLM } from '@/lib/llm/callLLM'
import {
  COMPETITOR_SNAPSHOT_SCHEMA_SHAPE,
  buildSnapshotMessages,
  type ProjectContext,
} from '@/lib/prompts/snapshot'
import {
  MARKET_SYNTHESIS_SCHEMA_SHAPE,
  buildSynthesisMessages,
} from '@/lib/prompts/synthesis'
import { buildRepairMessages } from '@/lib/prompts/repair'
import {
  CompetitorSnapshotSchema,
  type CompetitorSnapshot,
} from '@/lib/schemas/competitorSnapshot'
import {
  MarketSynthesisSchema,
  type MarketSynthesis,
} from '@/lib/schemas/marketSynthesis'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import { buildProjectContext } from '@/lib/results/projectContext'
import { FLAGS } from '@/lib/flags'
import { runEvidenceHarvestAndStore } from '@/lib/evidence/runEvidenceBundle'
import { writeEvidenceBundleArtifact } from '@/lib/artifacts/writeEvidenceBundleArtifact'

type GenerateAnalysisSuccessResult = {
  ok: true
  runId: string
  artifactIds: {
    profilesId: string
    synthesisId: string
  }
}

type GenerateAnalysisErrorResult = {
  ok: false
  message: string
  details?: Record<string, unknown>
}

export type GenerateAnalysisResult =
  | GenerateAnalysisSuccessResult
  | GenerateAnalysisErrorResult

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

export async function generateAnalysis(
  projectId: string
): Promise<GenerateAnalysisResult> {
  const runId = generateRunId()

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return {
        ok: false,
        message: 'You must be signed in to generate analysis.',
        details: { code: 'UNAUTHENTICATED' },
      }
    }

    // Use safe contract to get project
    const projectResult = await getProjectSafe(supabase, projectId)
    if (!projectResult.ok) {
      return {
        ok: false,
        message: projectResult.error.message || 'Failed to load project.',
      }
    }
    const project = projectResult.data
    if (!project) {
      return {
        ok: false,
        message: 'Project not found.',
      }
    }

    if (!project || project.user_id !== user.id) {
      return {
        ok: false,
        message: 'Project not found or access denied.',
        details: { code: 'PROJECT_NOT_FOUND_OR_FORBIDDEN' },
      }
    }

    const competitors = await listCompetitorsForProject(supabase, projectId)
    const competitorCount = competitors.length

    if (competitorCount < MIN_COMPETITORS_FOR_ANALYSIS) {
      return {
        ok: false,
        message: 'Add at least 3 competitors to generate analysis.',
        details: { competitorCount },
      }
    }

    if (competitorCount > MAX_COMPETITORS_PER_PROJECT) {
      return {
        ok: false,
        message: 'Maximum of 7 competitors allowed.',
        details: { competitorCount },
      }
    }

    // Harvest evidence bundle if feature flag is enabled
    if (FLAGS.evidencePacksEnabled) {
      try {
        const harvestResult = await runEvidenceHarvestAndStore({
          project,
          competitors,
          runId,
          userId: user.id,
        })

        await writeEvidenceBundleArtifact({
          supabase,
          projectId,
          runId,
          bundle: harvestResult.bundle,
          stats: harvestResult.stats,
        })

        logger.info('Evidence bundle harvested and saved', {
          runId,
          projectId,
          totalSources: harvestResult.stats.totalSources,
        })
      } catch (error) {
        // Log error but continue with existing generation
        logger.warn('Evidence bundle harvest failed; continuing generation', {
          runId,
          projectId,
          error: error instanceof Error ? error.message : String(error),
        })
      }
    }

    // Build normalized project context (handles both legacy and new hypothesis-first projects)
    const contextSummary = buildProjectContext(project)
    const projectContext: ProjectContext = {
      market: project.market,
      target_customer: project.target_customer,
      your_product: project.your_product,
      business_goal: project.business_goal,
      geography: project.geography,
      primary_constraint: project.primary_constraint,
      risk_posture: project.risk_posture,
      ambition_level: project.ambition_level,
      organizational_capabilities: project.organizational_capabilities,
      decision_level: project.decision_level,
      explicit_non_goals: project.explicit_non_goals,
      input_confidence: project.input_confidence,
      // Note: hypothesis, starting_point, customer_profile, problem_statement,
      // market_context, solution_idea columns do not exist in production.
      // These fields are removed to prevent schema errors.
      // Computed context
      lens: contextSummary.lens,
      summaryText: contextSummary.summaryText,
    }

    const snapshots: CompetitorSnapshot[] = []

    let snapshotProvider: string | undefined
    let snapshotModel: string | undefined
    const snapshotUsageTotals = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    }

    for (const competitor of competitors) {
      const originalEvidence = competitor.evidence_text ?? ''
      const originalLength = originalEvidence.length
      const truncatedEvidence = originalEvidence.slice(0, MAX_EVIDENCE_CHARS)
      const truncatedLength = truncatedEvidence.length
      const wasTruncated = originalLength > MAX_EVIDENCE_CHARS

      if (wasTruncated) {
        logger.warn('Evidence truncated for competitor', {
          competitorId: competitor.id,
          competitorName: competitor.name,
          originalLength,
          truncatedLength,
        })
      }

      const competitorContext = {
        name: competitor.name,
        url: competitor.url,
        evidence_text: truncatedEvidence,
      }

      const messages = buildSnapshotMessages({
        project: projectContext,
        competitor: competitorContext,
      })

      const snapshotResponse = await callLLM({
        messages,
        jsonMode: true,
        temperature: 0.2,
        maxTokens: 1_600,
      })

      snapshotProvider ??= snapshotResponse.provider
      snapshotModel ??= snapshotResponse.model
      if (snapshotResponse.usage) {
        snapshotUsageTotals.inputTokens += snapshotResponse.usage.inputTokens ?? 0
        snapshotUsageTotals.outputTokens += snapshotResponse.usage.outputTokens ?? 0
        snapshotUsageTotals.totalTokens += snapshotResponse.usage.totalTokens ?? 0
      }

      let parsedSnapshot = safeParseLLMJson(
        snapshotResponse.text,
        CompetitorSnapshotSchema
      )

      if (!parsedSnapshot.ok) {
        const schemaShapeText = JSON.stringify(
          COMPETITOR_SNAPSHOT_SCHEMA_SHAPE,
          null,
          2
        )

        const repairMessages = buildRepairMessages({
          rawText: snapshotResponse.text,
          schemaName: 'CompetitorSnapshot',
          schemaShapeText,
          validationErrors: parsedSnapshot.error,
        })

        const repairResponse = await callLLM({
          messages: repairMessages,
          jsonMode: true,
          temperature: 0.1,
          maxTokens: 1_600,
        })

        if (repairResponse.usage) {
          snapshotUsageTotals.inputTokens += repairResponse.usage.inputTokens ?? 0
          snapshotUsageTotals.outputTokens += repairResponse.usage.outputTokens ?? 0
          snapshotUsageTotals.totalTokens += repairResponse.usage.totalTokens ?? 0
        }

        const repaired = safeParseLLMJson(
          repairResponse.text,
          CompetitorSnapshotSchema
        )

        if (!repaired.ok) {
          logger.error('Snapshot validation failed after repair', {
            competitorId: competitor.id,
            competitorName: competitor.name,
            summary: summarizeValidationError(repaired.error),
          })

          return {
            ok: false,
            message: `Failed to validate competitor snapshot for "${competitor.name}".`,
            details: {
              stage: 'snapshot_validation',
              competitorId: competitor.id,
              competitorName: competitor.name,
              validationError: summarizeValidationError(repaired.error),
            },
          }
        }

        parsedSnapshot = repaired
      }

      snapshots.push(parsedSnapshot.data)
    }

    const snapshotsJson = JSON.stringify(snapshots)

    const synthesisMessages = buildSynthesisMessages({
      project: projectContext,
      snapshotsJson,
    })

    let synthesisResponse = await callLLM({
      messages: synthesisMessages,
      jsonMode: true,
      temperature: 0.2,
      maxTokens: 2_400,
    })

    let synthesisParsed = safeParseLLMJson(
      synthesisResponse.text,
      MarketSynthesisSchema
    )

    if (!synthesisParsed.ok) {
      const schemaShapeText = JSON.stringify(
        MARKET_SYNTHESIS_SCHEMA_SHAPE,
        null,
        2
      )

      const repairMessages = buildRepairMessages({
        rawText: synthesisResponse.text,
        schemaName: 'MarketSynthesis',
        schemaShapeText,
        validationErrors: synthesisParsed.error,
      })

      const repairResponse = await callLLM({
        messages: repairMessages,
        jsonMode: true,
        temperature: 0.1,
        maxTokens: 2_400,
      })

      synthesisResponse = repairResponse

      synthesisParsed = safeParseLLMJson(
        repairResponse.text,
        MarketSynthesisSchema
      )

      if (!synthesisParsed.ok) {
        logger.error('Synthesis validation failed after repair', {
          summary: summarizeValidationError(synthesisParsed.error),
        })

        return {
          ok: false,
          message: 'Failed to validate market synthesis output.',
          details: {
            stage: 'synthesis_validation',
            validationError: summarizeValidationError(synthesisParsed.error),
          },
        }
      }
    }

    const generatedAt = new Date().toISOString()

    const profilesArtifact = await createArtifact(supabase, {
      project_id: projectId,
      type: 'profiles',
      content_json: {
        run_id: runId,
        generated_at: generatedAt,
        competitor_count: snapshots.length,
        llm: {
          stage: 'snapshots',
          provider: snapshotProvider,
          model: snapshotModel,
          usage: snapshotUsageTotals,
        },
        snapshots,
      },
    })

    const synthesisArtifact = await createArtifact(supabase, {
      project_id: projectId,
      type: 'synthesis',
      content_json: {
        run_id: runId,
        generated_at: generatedAt,
        competitor_count: snapshots.length,
        llm: {
          stage: 'synthesis',
          provider: synthesisResponse.provider,
          model: synthesisResponse.model,
          usage: synthesisResponse.usage,
        },
        synthesis: synthesisParsed.data,
      },
    })

    // Note: We no longer update latest_successful_run_id as it doesn't exist in production schema
    // Latest run info is derived from artifacts table via lib/data/latestRun.ts
    // The artifacts were created successfully, which is the source of truth

    return {
      ok: true,
      runId,
      artifactIds: {
        profilesId: profilesArtifact.id,
        synthesisId: synthesisArtifact.id,
      },
    }
  } catch (error) {
    logger.error('Unhandled error in generateAnalysis', error)

    return {
      ok: false,
      message: error instanceof Error
        ? error.message
        : 'Unexpected error during analysis generation.',
      details:
        error instanceof Error
          ? {
              code: 'UNEXPECTED_ERROR',
              name: error.name,
              message: error.message,
            }
          : {
              code: 'UNEXPECTED_ERROR',
              value: String(error),
            },
    }
  }
}

