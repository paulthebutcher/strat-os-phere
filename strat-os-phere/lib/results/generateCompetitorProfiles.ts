/**
 * Generate competitor profiles (snapshots) for a project
 * This function can be called from both generateAnalysis and generateResultsV2
 */

import 'server-only'

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { createArtifact } from '@/lib/data/artifacts'
import { getProjectById } from '@/lib/data/projects'
import { callLLM } from '@/lib/llm/callLLM'
import {
  COMPETITOR_SNAPSHOT_SCHEMA_SHAPE,
  buildSnapshotMessages,
  type ProjectContext,
} from '@/lib/prompts/snapshot'
import { buildRepairMessages } from '@/lib/prompts/repair'
import {
  CompetitorSnapshotSchema,
  type CompetitorSnapshot,
} from '@/lib/schemas/competitorSnapshot'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'
import { MAX_EVIDENCE_CHARS } from '@/lib/constants'
import { logger } from '@/lib/logger'
import type { ProgressCallback } from '@/lib/results/progress'

export type GenerateCompetitorProfilesResult =
  | {
      ok: true
      runId: string
      profilesArtifactId: string
      snapshots: CompetitorSnapshot[]
    }
  | {
      ok: false
      error: {
        code: string
        message: string
      }
      details?: Record<string, unknown>
    }

function summarizeValidationError(error: string | undefined): string | undefined {
  if (!error) return undefined
  return error.length > 500 ? `${error.slice(0, 497)}...` : error
}

function generateRunId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID()
  }
  return `run_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`
}

/**
 * Generate competitor profiles (snapshots) for a project
 * 
 * @param supabase - Supabase client
 * @param projectId - Project ID
 * @param runId - Optional run ID (will generate one if not provided)
 * @param onProgress - Optional progress callback
 * @param force - If true, regenerate profiles even if they exist
 */
export async function generateCompetitorProfiles(
  supabase: TypedSupabaseClient,
  projectId: string,
  runId?: string,
  onProgress?: ProgressCallback,
  force: boolean = false
): Promise<GenerateCompetitorProfilesResult> {
  const actualRunId = runId ?? generateRunId()

  try {
    const project = await getProjectById(supabase, projectId)
    if (!project) {
      return {
        ok: false,
        error: {
          code: 'PROJECT_NOT_FOUND',
          message: 'Project not found.',
        },
      }
    }

    const competitors = await listCompetitorsForProject(supabase, projectId)
    const competitorCount = competitors.length

    if (competitorCount === 0) {
      return {
        ok: false,
        error: {
          code: 'NO_COMPETITORS',
          message: 'Add at least one competitor to generate profiles.',
        },
        details: { competitorCount: 0 },
      }
    }

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
    }

    const snapshots: CompetitorSnapshot[] = []

    let snapshotProvider: string | undefined
    let snapshotModel: string | undefined
    const snapshotUsageTotals = {
      inputTokens: 0,
      outputTokens: 0,
      totalTokens: 0,
    }

    // Generate snapshot for each competitor
    for (let i = 0; i < competitors.length; i++) {
      const competitor = competitors[i]
      
      onProgress?.({
        runId: actualRunId,
        phase: 'competitor_profiles',
        status: 'progress',
        message: 'Generating competitor profiles',
        detail: `Summarizing what ${competitor.name} offers today (${i + 1}/${competitorCount})`,
        timestamp: new Date().toISOString(),
        meta: {
          current: i + 1,
          total: competitorCount,
          competitorId: competitor.id,
          competitorName: competitor.name,
        },
      })

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
        onProgress?.({
          runId: actualRunId,
          phase: 'competitor_profiles',
          status: 'progress',
          message: 'Generating competitor profiles',
          detail: `Repairing invalid JSON for ${competitor.name}...`,
          timestamp: new Date().toISOString(),
          meta: {
            current: i + 1,
            total: competitorCount,
            competitorId: competitor.id,
            competitorName: competitor.name,
          },
        })

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
            error: {
              code: 'SNAPSHOT_VALIDATION_FAILED',
              message: `Failed to validate competitor snapshot for "${competitor.name}".`,
            },
            details: {
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

    const generatedAt = new Date().toISOString()

    onProgress?.({
      runId: actualRunId,
      phase: 'competitor_profiles',
      status: 'progress',
      message: 'Generating competitor profiles',
      detail: 'Saving profiles artifact...',
      timestamp: new Date().toISOString(),
      meta: {
        total: competitorCount,
      },
    })

    const profilesArtifact = await createArtifact(supabase, {
      project_id: projectId,
      type: 'profiles',
      content_json: {
        run_id: actualRunId,
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

    onProgress?.({
      runId: actualRunId,
      phase: 'competitor_profiles',
      status: 'completed',
      message: 'Competitor profiles generated',
      detail: `Generated ${snapshots.length} profile${snapshots.length !== 1 ? 's' : ''} with citations`,
      timestamp: new Date().toISOString(),
      meta: {
        total: competitorCount,
      },
    })

    logger.info('Competitor profiles generated', {
      runId: actualRunId,
      projectId,
      competitorCount: snapshots.length,
    })

    return {
      ok: true,
      runId: actualRunId,
      profilesArtifactId: profilesArtifact.id,
      snapshots,
    }
  } catch (error) {
    logger.error('Unhandled error in generateCompetitorProfiles', error)

    return {
      ok: false,
      error: {
        code: 'UNEXPECTED_ERROR',
        message:
          error instanceof Error
            ? error.message
            : 'Unexpected error during profile generation.',
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

