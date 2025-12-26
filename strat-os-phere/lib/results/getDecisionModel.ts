/**
 * Canonical Decision Model Assembler
 * 
 * This is the ONLY place allowed to:
 * - Select artifacts
 * - Handle artifact versions
 * - Normalize content
 * 
 * All UI components should consume DecisionModel - never raw artifacts.
 * 
 * Server-safe: no React imports, can be used in server components and API routes.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listArtifacts } from '@/lib/data/artifacts'
import { getLatestSuccessfulArtifact } from '@/lib/artifacts/getLatestSuccessfulArtifact'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import { extractCitationsFromAllArtifacts, summarizeEvidence } from '@/lib/results/evidence'
import type { Opportunity } from '@/lib/contracts/domain'
import { OpportunitySchema } from '@/lib/contracts/domain'
import type { DecisionModel } from '@/lib/decision/decisionModel'
import { DecisionModelSchema } from '@/lib/decision/decisionModel'
import type { Artifact } from '@/lib/supabase/types'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

/**
 * Extended DecisionModel that includes raw artifact content for backward compatibility
 * with components that haven't been migrated yet
 */
export interface DecisionModelWithRaw extends DecisionModel {
  // Raw artifact content for backward compatibility (components that haven't migrated)
  _rawOpportunitiesV3?: OpportunityV3ArtifactContent | null
  _rawOpportunitiesV2?: OpportunitiesArtifactContent | null
}

/**
 * Select the best opportunities artifact
 * Strategy: Prefer v3 over v2, then newest by created_at
 * If runId is provided, filters artifacts to that run first
 */
async function selectBestOpportunitiesArtifact(
  supabase: TypedSupabaseClient,
  projectId: string,
  runId?: string
): Promise<{ artifact: Artifact | null; normalized: any }> {
  // Load all artifacts
  let artifacts = await listArtifacts(supabase, { projectId })

  // If runId is provided, try to get latest successful artifact for that run first
  if (runId) {
    // Try v3 first
    const v3Artifact = await getLatestSuccessfulArtifact(supabase, {
      projectId,
      runId,
      type: 'opportunities_v3',
    })
    if (v3Artifact) {
      const normalized = normalizeResultsArtifacts([v3Artifact], projectId)
      return { artifact: v3Artifact, normalized }
    }

    // Fall back to v2
    const v2Artifact = await getLatestSuccessfulArtifact(supabase, {
      projectId,
      runId,
      type: 'opportunities_v2',
    })
    if (v2Artifact) {
      const normalized = normalizeResultsArtifacts([v2Artifact], projectId)
      return { artifact: v2Artifact, normalized }
    }

    // If runId provided but no artifact found for that run, filter artifacts by runId
    artifacts = artifacts.filter((a) => {
      const artifactContent = a.content_json as any
      const artifactRunId =
        artifactContent?.meta?.run_id ||
        artifactContent?.meta?.runId ||
        artifactContent?.run_id ||
        null
      return artifactRunId === runId
    })
  }

  // Use normalizeResultsArtifacts to pick best (prefers v3 over v2, then newest)
  const normalized = normalizeResultsArtifacts(artifacts, projectId)
  const best = normalized.opportunities.best

  if (!best) {
    return { artifact: null, normalized }
  }

  // Find the artifact row that matches the normalized artifact
  // Match by type and created_at timestamp
  const matchingArtifact =
    artifacts.find(
      (a) =>
        a.type === best.type &&
        new Date(a.created_at).getTime() === new Date(best.artifactCreatedAt).getTime()
    ) || null

  return { artifact: matchingArtifact, normalized }
}

/**
 * Normalize opportunities from artifact to canonical Opportunity[]
 */
function normalizeOpportunities(artifact: Artifact): Opportunity[] {
  const content = artifact.content_json as any
  const opportunities: Opportunity[] = []

  if (artifact.type === 'opportunities_v3' && content?.opportunities) {
    for (const opp of content.opportunities) {
      const canonical: Opportunity = {
        id: opp.id,
        title: opp.title,
        oneLiner: opp.one_liner,
        one_liner: opp.one_liner,
        whyNow: opp.why_now,
        why_now: opp.why_now,
        citations: opp.citations || [],
        proof_points: opp.proof_points || [],
        scoring: opp.scoring,
        tradeoffs: opp.tradeoffs,
        experiments: opp.experiments || [],
        confidence: opp.scoring
          ? {
              coverage_score: opp.scoring.total,
              evidence_strength: opp.scoring.total,
            }
          : undefined,
        score: opp.scoring?.total,
        assumptions: opp.tradeoffs?.what_we_say_no_to || [],
        risks: opp.tradeoffs?.capability_forced || [],
        tags: [],
      }

      const result = OpportunitySchema.safeParse(canonical)
      if (result.success) {
        opportunities.push(result.data)
      } else {
        console.warn('[getDecisionModel] Opportunity validation warning', {
          id: canonical.id,
          errors: result.error.errors,
        })
        opportunities.push(canonical)
      }
    }
  } else if (artifact.type === 'opportunities_v2' && content?.opportunities) {
    for (const opp of content.opportunities) {
      const canonical: Opportunity = {
        id: opp.title.toLowerCase().replace(/\s+/g, '-'),
        title: opp.title,
        whyNow: opp.why_now,
        why_now: opp.why_now,
        confidence: {
          coverage_score: opp.score,
          evidence_strength: opp.score,
        },
        score: opp.score,
        risks: opp.risks || [],
        assumptions: [],
        tags: [opp.type, opp.effort, opp.impact, opp.confidence].filter(Boolean) as string[],
      }

      const result = OpportunitySchema.safeParse(canonical)
      if (result.success) {
        opportunities.push(result.data)
      } else {
        console.warn('[getDecisionModel] Opportunity validation warning', {
          id: canonical.id,
          errors: result.error.errors,
        })
        opportunities.push(canonical)
      }
    }
  }

  return opportunities
}

/**
 * Extract competitors from profiles artifact
 */
async function extractCompetitors(
  supabase: TypedSupabaseClient,
  projectId: string,
  runId?: string
): Promise<CompetitorSnapshot[]> {
  let artifact: Artifact | null = null

  if (runId) {
    artifact = await getLatestSuccessfulArtifact(supabase, {
      projectId,
      runId,
      type: 'profiles',
    })
  }

  if (!artifact) {
    const artifacts = await listArtifacts(supabase, { projectId })
    artifact = artifacts.find((a) => a.type === 'profiles') || null
  }

  if (!artifact) return []

  const content = artifact.content_json as any
  const snapshots = content?.snapshots || content || []

  // Validate snapshots
  const validSnapshots: CompetitorSnapshot[] = []
  for (const snapshot of Array.isArray(snapshots) ? snapshots : []) {
    // Basic validation - full schema validation happens in normalizeArtifacts
    if (snapshot && typeof snapshot === 'object' && snapshot.competitor_name) {
      validSnapshots.push(snapshot as CompetitorSnapshot)
    }
  }

  return validSnapshots
}

/**
 * Extract scorecard from scoring_matrix artifact
 */
async function extractScorecard(
  supabase: TypedSupabaseClient,
  projectId: string,
  runId?: string
): Promise<any[] | null> {
  let artifact: Artifact | null = null

  if (runId) {
    artifact = await getLatestSuccessfulArtifact(supabase, {
      projectId,
      runId,
      type: 'scoring_matrix',
    })
  }

  if (!artifact) {
    const artifacts = await listArtifacts(supabase, { projectId })
    artifact = artifacts.find((a) => a.type === 'scoring_matrix') || null
  }

  if (!artifact) return null

  const content = artifact.content_json as any
  // Scorecard structure varies - return raw for now
  return content?.scorecard || content?.entries || null
}

/**
 * Extract metadata from artifact (drift-safe across versions)
 */
function extractMetadata(artifact: Artifact): {
  runId: string | null
  generatedAt: string | null
  artifactVersion: string
} {
  const content = artifact.content_json as any
  const meta = content?.meta || {}

  // Extract run_id from content_json (not from artifact row - artifacts table doesn't have run_id column)
  const runId =
    meta.run_id ||
    meta.runId ||
    content?.run_id ||
    meta.artifactRunId ||
    meta.generated_by_run_id ||
    null

  const generatedAt =
    meta.generated_at || meta.generatedAt || artifact.created_at || null

  const artifactVersion =
    meta.schema_version?.toString() ||
    (artifact.type === 'opportunities_v3' ? '3' : artifact.type === 'opportunities_v2' ? '2' : '1')

  return {
    runId: typeof runId === 'string' && runId.length > 0 ? runId : null,
    generatedAt: typeof generatedAt === 'string' ? generatedAt : null,
    artifactVersion,
  }
}

/**
 * Get canonical DecisionModel for a project
 * 
 * This is the single source of truth for assembling the decision view.
 * All version logic, normalization, and selection happens here.
 * 
 * @param supabase - TypedSupabaseClient instance
 * @param args.projectId - Required project ID
 * @param args.runId - Optional run ID (if provided, selects artifacts from that run)
 * @returns DecisionModel - canonical decision model
 */
export async function getDecisionModel(
  supabase: TypedSupabaseClient,
  args: {
    projectId: string
    runId?: string
  }
): Promise<DecisionModelWithRaw> {
  const { projectId, runId } = args

  // 1. Select the best opportunities artifact
  const { artifact: opportunitiesArtifact, normalized: normalizedResults } =
    await selectBestOpportunitiesArtifact(supabase, projectId, runId)

  if (!opportunitiesArtifact) {
    // Return empty model if no artifact exists
    const result = DecisionModelSchema.safeParse({
      projectId,
      runId: null,
      generatedAt: null,
      summary: {},
      opportunities: [],
      metadata: {
        artifactVersion: '0',
        artifactId: '00000000-0000-0000-0000-000000000000',
      },
    })

    if (!result.success) {
      throw new Error(`Failed to create empty DecisionModel: ${result.error.message}`)
    }

    return result.data
  }

  // 2. Normalize opportunities
  const opportunities = normalizeOpportunities(opportunitiesArtifact)

  // 3. Extract metadata
  const metadata = extractMetadata(opportunitiesArtifact)
  const actualRunId = runId || metadata.runId

  // 4. Load supporting data (competitors, scorecard, evidence)
  const [competitors, scorecard] = await Promise.all([
    extractCompetitors(supabase, projectId, actualRunId || undefined),
    extractScorecard(supabase, projectId, actualRunId || undefined),
  ])

  // 5. Build evidence summary from citations (use normalized results if available)
  const allArtifacts = await listArtifacts(supabase, { projectId })
  const citations = extractCitationsFromAllArtifacts(
    opportunitiesArtifact.content_json,
    ...allArtifacts
      .filter((a) => a.type === 'profiles' || a.type === 'strategic_bets')
      .map((a) => a.content_json)
  )
  // Use evidenceSummary from normalized results if available, otherwise compute
  const evidenceSummary =
    normalizedResults.evidenceSummary ||
    (citations.length > 0 ? summarizeEvidence(citations) : null)

  // 6. Extract summary (headline/narrative) from opportunities artifact
  const artifactContent = opportunitiesArtifact.content_json as any
  const summary = {
    headline: artifactContent?.summary?.headline || artifactContent?.headline || undefined,
    narrative: artifactContent?.summary?.narrative || artifactContent?.narrative || undefined,
  }

  // 7. Assemble DecisionModel
  const decisionModel: DecisionModel = {
    projectId,
    runId: actualRunId,
    generatedAt: metadata.generatedAt,
    summary,
    opportunities,
    competitors: competitors.length > 0 ? competitors : undefined,
    scorecard: scorecard || undefined,
    evidenceSummary: evidenceSummary
      ? {
          total: evidenceSummary.total,
          byType: evidenceSummary.byType,
          mostRecent: evidenceSummary.mostRecent?.toISOString(),
          oldest: evidenceSummary.oldest?.toISOString(),
          medianAgeDays: evidenceSummary.medianAgeDays,
          recencyLabel: evidenceSummary.recencyLabel,
          confidence: evidenceSummary.confidence,
          confidenceRationale: evidenceSummary.confidenceRationale,
        }
      : undefined,
    metadata: {
      artifactVersion: metadata.artifactVersion,
      artifactId: opportunitiesArtifact.id,
      confidence: opportunities.length > 0 ? opportunities[0]?.score : undefined,
    },
  }

  // 8. Validate
  const result = DecisionModelSchema.safeParse(decisionModel)
  if (!result.success) {
    throw new Error(
      `Failed to validate DecisionModel: ${result.error.message}\n${JSON.stringify(result.error.errors, null, 2)}`
    )
  }

  // 9. Add raw artifact content for backward compatibility with existing components
  const rawContent = opportunitiesArtifact.content_json as any
  const withRaw: DecisionModelWithRaw = {
    ...result.data,
    _rawOpportunitiesV3:
      opportunitiesArtifact.type === 'opportunities_v3' ? (rawContent as OpportunityV3ArtifactContent) : null,
    _rawOpportunitiesV2:
      opportunitiesArtifact.type === 'opportunities_v2' ? (rawContent as OpportunitiesArtifactContent) : null,
  }

  return withRaw
}

