import 'server-only'

import {
  MIN_COMPETITORS_FOR_ANALYSIS,
  MAX_COMPETITORS_PER_PROJECT,
} from '@/lib/constants'
import { listCompetitorsForProject } from '@/lib/data/competitors'
import { createArtifact, listArtifacts } from '@/lib/data/artifacts'
import { getProjectById } from '@/lib/data/projects'
import { getEvidenceSourcesForProject } from '@/lib/data/evidenceSources'
import {
  assertHasCompetitors,
  COMPETITOR_PROFILE_ARTIFACT_TYPES,
} from '@/lib/results/prerequisites'
import { checkCompetitorProfileStatus } from '@/lib/results/competitorProfiles'
import { generateCompetitorProfiles } from '@/lib/results/generateCompetitorProfiles'
import { AppError, isAppError } from '@/lib/errors'
import { callLLM } from '@/lib/llm/callLLM'
import type { ProjectContext } from '@/lib/prompts/snapshot'
import {
  buildOpportunityV3Messages,
  OPPORTUNITY_V3_SCHEMA_SHAPE,
} from '@/lib/prompts/opportunityV3'
import { buildRepairMessages } from '@/lib/prompts/repair'
import {
  OpportunityV3ArtifactContentSchema,
  type OpportunityV3ArtifactContent,
  type OpportunityV3Item,
  type Scoring,
} from '@/lib/schemas/opportunityV3'
import { safeParseLLMJson } from '@/lib/schemas/safeParseLLMJson'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logger'
import {
  type ProgressCallback,
  type ProgressEvent,
  makeProgressEvent,
  RESULTS_V2_PHASES,
} from '@/lib/results/progress'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'
import type { JtbdArtifactContent } from '@/lib/schemas/jtbd'
import type { ScoringMatrixArtifactContent } from '@/lib/schemas/scoring'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeArtifacts'
import type { EvidenceSource } from '@/lib/supabase/types'

export type GenerateOpportunitiesV3SuccessResult = {
  ok: true
  runId: string
  artifactId: string
}

export type GenerateOpportunitiesV3ErrorResult = {
  ok: false
  error: {
    code: string
    message: string
  }
  details?: Record<string, unknown>
}

export type GenerateOpportunitiesV3Result =
  | GenerateOpportunitiesV3SuccessResult
  | GenerateOpportunitiesV3ErrorResult

function generateRunId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return (crypto as Crypto).randomUUID()
  }
  return `run_${Date.now()}_${Math.floor(Math.random() * 1_000_000)}`
}

/**
 * Compute deterministic total score from breakdown and weights
 */
function computeOpportunityV3TotalScore(
  breakdown: Scoring['breakdown'],
  weights: Scoring['weights']
): number {
  const total =
    breakdown.customer_pain * weights.customer_pain +
    breakdown.willingness_to_pay * weights.willingness_to_pay +
    breakdown.strategic_fit * weights.strategic_fit +
    breakdown.feasibility * weights.feasibility +
    breakdown.defensibility * weights.defensibility +
    breakdown.competitor_gap * weights.competitor_gap +
    breakdown.recencyConfidence * weights.recencyConfidence

  // Scale to 0-100 and round to integer
  return Math.min(100, Math.max(0, Math.round(total * 10)))
}

/**
 * Compute recencyConfidence from citations (0-10)
 * Higher if citations are within 90 days and include reviews/pricing/changelog
 */
function computeRecencyConfidence(
  citations: OpportunityV3Item['citations']
): number {
  if (citations.length === 0) return 0

  const now = Date.now()
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000

  let recentCount = 0
  let highValueSourceCount = 0

  for (const citation of citations) {
    if (citation.extracted_at) {
      const extractedDate = new Date(citation.extracted_at).getTime()
      if (extractedDate >= ninetyDaysAgo) {
        recentCount++
      }
    }

    if (
      citation.source_type === 'reviews' ||
      citation.source_type === 'pricing' ||
      citation.source_type === 'changelog'
    ) {
      highValueSourceCount++
    }
  }

  // Base score on recent citations (0-6)
  const recentScore = Math.min(6, (recentCount / citations.length) * 6)

  // Bonus for high-value sources (0-4)
  const sourceScore = Math.min(4, (highValueSourceCount / citations.length) * 4)

  return Math.min(10, Math.round(recentScore + sourceScore))
}

/**
 * Generate stable ID from normalized title, projectId, and primary JTBD
 */
function generateOpportunityId(
  title: string,
  projectId: string,
  jtbdId?: string | number
): string {
  // Normalize title: lowercase, replace spaces with hyphens, remove special chars
  const normalizedTitle = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  const jtbdPart = jtbdId ? `-${jtbdId}` : ''
  return `${normalizedTitle}-${projectId}${jtbdPart}`
}

/**
 * Generate Opportunities V3 - unified opportunities that distill all existing results
 */
export async function generateOpportunitiesV3(
  projectId: string,
  userId: string,
  options?: { runId?: string; onProgress?: ProgressCallback }
): Promise<GenerateOpportunitiesV3Result> {
  const runId = options?.runId ?? generateRunId()
  const onProgress = options?.onProgress
  const generatedAt = new Date().toISOString()

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

    // Phase 1: Validating inputs
    onProgress?.(
      makeProgressEvent(runId, 'load_input', 'Validating inputs', {
        meta: { competitorCount: 0 },
      })
    )

    try {
      await assertHasCompetitors(supabase, projectId)
    } catch (error) {
      if (isAppError(error)) {
        const competitors = await listCompetitorsForProject(supabase, projectId)
        return {
          ok: false,
          error: {
            code: error.code,
            message: error.message,
          },
          details: { competitorCount: competitors.length },
        }
      }
      throw error
    }

    const competitors = await listCompetitorsForProject(supabase, projectId)
    const competitorCount = competitors.length

    onProgress?.(
      makeProgressEvent(runId, 'load_input', 'Inputs validated', {
        detail: `Found ${competitorCount} competitor${competitorCount !== 1 ? 's' : ''}`,
        meta: { competitorCount },
      })
    )

    // Phase 2: Reading live competitor signals
    onProgress?.(
      makeProgressEvent(runId, RESULTS_V2_PHASES.EVIDENCE_QUALITY_CHECK, 'Reading live competitor signals', {
        status: 'started',
        detail: 'Scanning pricing, reviews, changelog, jobs',
      })
    )

    const evidenceSources = await getEvidenceSourcesForProject(supabase, projectId)
    
    // Count sources by type
    const sourceCounts = {
      evidence_sources_count: evidenceSources.length,
      review_sources_count: evidenceSources.filter((s) => s.source_type === 'reviews').length,
      pricing_sources_count: evidenceSources.filter((s) => s.source_type === 'pricing').length,
      changelog_sources_count: evidenceSources.filter((s) => s.source_type === 'changelog').length,
      jobs_sources_count: evidenceSources.filter((s) => s.source_type === 'jobs').length,
    }

    onProgress?.(
      makeProgressEvent(runId, RESULTS_V2_PHASES.EVIDENCE_QUALITY_CHECK, 'Live signals loaded', {
        status: 'completed',
        detail: `${evidenceSources.length} sources found`,
        meta: sourceCounts,
      })
    )

    // Phase 3: Building competitor profiles (if needed)
    const profileStatus = await checkCompetitorProfileStatus(supabase, projectId)

    if (profileStatus.missingProfiles) {
      if (profileStatus.competitorsCount === 0) {
        return {
          ok: false,
          error: {
            code: 'NO_COMPETITORS',
            message: 'Add at least one competitor to run analysis.',
          },
          details: { competitorCount: 0 },
        }
      }

      onProgress?.(
        makeProgressEvent(runId, 'competitor_profiles', 'Building competitor profiles', {
          status: 'started',
          detail: 'Summarizing what each competitor offers today',
        })
      )

      const profilesResult = await generateCompetitorProfiles(
        supabase,
        projectId,
        runId,
        onProgress
      )

      if (!profilesResult.ok) {
        onProgress?.(
          makeProgressEvent(runId, 'competitor_profiles', 'Failed to generate profiles', {
            status: 'failed',
            detail: profilesResult.error.message,
          })
        )
        return {
          ok: false,
          error: {
            code: profilesResult.error.code,
            message: profilesResult.error.message,
          },
          details: profilesResult.details || {
            competitorCount: profileStatus.competitorsCount,
          },
        }
      }

      onProgress?.(
        makeProgressEvent(runId, 'competitor_profiles', 'Profiles ready', {
          status: 'completed',
          detail: `${profileStatus.competitorsCount} profiles generated`,
          meta: { profilesCount: profileStatus.competitorsCount },
        })
      )
    } else {
      onProgress?.(
        makeProgressEvent(runId, 'competitor_profiles', 'Profiles verified', {
          status: 'completed',
          detail: `${profileStatus.profilesCount} profiles ready`,
          meta: { profilesCount: profileStatus.profilesCount },
        })
      )
    }

    // Load existing artifacts
    const artifacts = await listArtifacts(supabase, { projectId })
    const normalized = normalizeResultsArtifacts(artifacts)

    // Get profiles
    const profiles = normalized.profiles
    if (!profiles || profiles.snapshots.length === 0) {
      return {
        ok: false,
        error: {
          code: 'NO_PROFILES',
          message: 'Competitor profiles are required. Please generate profiles first.',
        },
      }
    }

    const snapshots = profiles.snapshots
    const snapshotsJson = JSON.stringify(snapshots)

    // Build project context
    const projectContext: ProjectContext = {
      market: project.market || 'Unknown market',
      target_customer: project.target_customer || 'Unknown customer',
      your_product: project.your_product || undefined,
      business_goal: project.business_goal || undefined,
      geography: project.geography || undefined,
    }

    // Get optional inputs
    const jtbd = normalized.jtbd
    const scoring = normalized.scoringMatrix
    const jtbdJson = jtbd ? JSON.stringify(jtbd.content) : undefined
    const scoringJson = scoring ? JSON.stringify(scoring.content) : undefined

    // Prepare evidence sources JSON (simplified for prompt)
    const evidenceSourcesForPrompt = evidenceSources.map((source) => ({
      id: source.id,
      url: source.url,
      page_title: source.page_title,
      source_type: source.source_type,
      extracted_at: source.extracted_at,
      source_date_range: source.source_date_range,
      source_confidence: source.source_confidence,
      domain: source.domain,
      extracted_text: source.extracted_text.substring(0, 500), // Truncate for prompt
    }))
    const evidenceSourcesJson = JSON.stringify(evidenceSourcesForPrompt)

    // Phase 4: Drafting opportunities
    onProgress?.(
      makeProgressEvent(runId, 'opportunities_generate', 'Drafting opportunities', {
        status: 'started',
        detail: 'Generating unified opportunities from all inputs',
      })
    )

    const opportunityMessages = buildOpportunityV3Messages({
      project: projectContext,
      snapshotsJson,
      jtbdJson,
      scoringJson,
      evidenceSourcesJson,
    })

    let opportunityResponse = await callLLM({
      messages: opportunityMessages,
      jsonMode: true,
      temperature: 0.2,
      maxTokens: 4_000,
    })

    // Phase 5: Scoring + stress-testing claims
    onProgress?.(
      makeProgressEvent(runId, 'opportunities_validate', 'Scoring and stress-testing claims', {
        status: 'started',
        detail: 'Validating structure and computing scores',
      })
    )

    let opportunityParsed = safeParseLLMJson(
      opportunityResponse.text,
      OpportunityV3ArtifactContentSchema
    )

    // Repair if validation fails
    if (!opportunityParsed.ok) {
      logger.warn('Opportunity V3 validation failed, attempting repair', {
        runId,
        projectId,
        summary: opportunityParsed.error?.substring(0, 200),
      })

      const schemaShapeText = JSON.stringify(OPPORTUNITY_V3_SCHEMA_SHAPE, null, 2)
      const repairMessages = buildRepairMessages({
        rawText: opportunityResponse.text,
        schemaName: 'OpportunityV3ArtifactContent',
        schemaShapeText,
        validationErrors: opportunityParsed.error,
      })

      opportunityResponse = await callLLM({
        messages: repairMessages,
        jsonMode: true,
        temperature: 0.1,
        maxTokens: 4_000,
      })

      opportunityParsed = safeParseLLMJson(
        opportunityResponse.text,
        OpportunityV3ArtifactContentSchema
      )

      if (!opportunityParsed.ok) {
        logger.error('Opportunity V3 validation failed after repair', {
          runId,
          projectId,
          error: opportunityParsed.error,
        })
        return {
          ok: false,
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Failed to generate valid opportunities after repair attempt.',
          },
          details: {
            validationError: opportunityParsed.error?.substring(0, 500),
          },
        }
      }
    }

    // Phase 6: Attaching evidence + citations (already in LLM output, but ensure IDs are stable)
    onProgress?.(
      makeProgressEvent(runId, 'opportunities_validate', 'Attaching evidence and citations', {
        status: 'progress',
        detail: 'Ensuring all opportunities have proper citations',
      })
    )

    // Ensure IDs are stable and compute deterministic scores
    const opportunitiesWithIds = opportunityParsed.data.opportunities.map((opp, index) => {
      // Generate stable ID
      const jtbdId = opp.dependencies.linked_jtbd_ids?.[0]
      const stableId = opp.id || generateOpportunityId(opp.title, projectId, jtbdId)

      // Compute recencyConfidence from citations
      const recencyConfidence = computeRecencyConfidence(opp.citations)

      // Update breakdown with computed recencyConfidence
      const updatedBreakdown = {
        ...opp.scoring.breakdown,
        recencyConfidence: recencyConfidence,
      }

      // Compute total score deterministically
      const totalScore = computeOpportunityV3TotalScore(
        updatedBreakdown,
        opp.scoring.weights
      )

      return {
        ...opp,
        id: stableId,
        scoring: {
          ...opp.scoring,
          breakdown: updatedBreakdown,
          total: totalScore,
        },
      }
    })

    // Phase 7: Saving results
    onProgress?.(
      makeProgressEvent(runId, 'save_artifacts', 'Saving results', {
        status: 'started',
        detail: 'Persisting opportunities to workspace',
      })
    )

    // Determine which inputs were used
    const inputsUsed = {
      jtbd: Boolean(jtbd),
      scorecard: Boolean(scoring),
      live_signals: evidenceSources.length > 0,
      profiles: true,
      pricing: sourceCounts.pricing_sources_count > 0,
      reviews: sourceCounts.review_sources_count > 0,
      jobs: sourceCounts.jobs_sources_count > 0,
      changelog: sourceCounts.changelog_sources_count > 0,
    }

    const opportunityV3Content: OpportunityV3ArtifactContent = {
      meta: {
        generated_at: generatedAt,
        run_id: runId,
        inputs_used: inputsUsed,
        signals_summary: sourceCounts,
      },
      opportunities: opportunitiesWithIds,
    }

    // createArtifact returns ArtifactRow; extract .id for the string ID
    const artifact = await createArtifact(supabase, {
      project_id: projectId,
      type: 'opportunities_v3',
      content_json: opportunityV3Content,
    })
    const artifactId: string = artifact.id

    onProgress?.(
      makeProgressEvent(runId, 'save_artifacts', 'Results saved', {
        status: 'completed',
        detail: `${opportunitiesWithIds.length} opportunities saved`,
        meta: { artifactId },
      })
    )

    logger.info('Opportunities V3 generated successfully', {
      runId,
      projectId,
      artifactId,
      opportunitiesCount: opportunitiesWithIds.length,
    })

    return {
      ok: true,
      runId,
      artifactId,
    }
  } catch (error) {
    logger.error('Failed to generate Opportunities V3', {
      runId,
      projectId,
      error: error instanceof Error ? error.message : String(error),
    })

    return {
      ok: false,
      error: {
        code: 'GENERATION_FAILED',
        message: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    }
  }
}


