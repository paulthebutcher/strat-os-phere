/**
 * Canonical Decision Model
 * 
 * This function provides a single source of truth for reading decision/opportunities
 * data from artifacts. It returns a contracted shape that the UI can rely on.
 * 
 * Server-safe: no React imports, can be used in server components and API routes.
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { listArtifacts } from '@/lib/data/artifacts'
import { normalizeResultsArtifacts } from '@/lib/results/normalizeResults'
import type { Opportunity } from '@/lib/contracts/domain'
import { OpportunitySchema } from '@/lib/contracts/domain'

/**
 * Extract run ID from artifact (drift-safe across versions)
 * 
 * Strategy:
 * 1. Prefer artifactRow.run_id (if available - most authoritative)
 * 2. Fall back to normalized artifact's runId (already extracted from content.meta)
 * 3. Fall back to content.meta.* fields directly (best-effort across versions)
 * 
 * This helper isolates version quirks so PR 1.5 can standardize metadata cleanly.
 */
type MaybeRunId = string | null | undefined

function extractRunIdFromArtifact(args: {
  artifactRowRunId?: MaybeRunId
  normalizedRunId?: MaybeRunId
  artifactContent?: unknown
}): string | null {
  // 1) Prefer DB row metadata if present (most authoritative)
  if (args.artifactRowRunId) return args.artifactRowRunId

  // 2) Use normalized artifact's runId (already extracted from content.meta)
  if (args.normalizedRunId) return args.normalizedRunId

  // 3) Best-effort fallback to content.meta.* across versions
  const content = args.artifactContent as any
  const meta = content?.meta ?? content?.content?.meta ?? content?.content?.metadata ?? null

  const candidate =
    meta?.run_id ??
    meta?.runId ??
    meta?.artifactRunId ?? // keep as fallback for backwards compatibility
    meta?.generated_by_run_id ??
    null

  return typeof candidate === 'string' && candidate.length > 0 ? candidate : null
}

/**
 * Extract generated_at timestamp from artifact (drift-safe across versions)
 * 
 * Strategy:
 * 1. Use normalized artifact's generatedAt (already extracted)
 * 2. Fall back to content.meta.* fields directly (best-effort across versions)
 */
function extractGeneratedAt(args: {
  normalizedGeneratedAt?: MaybeRunId
  artifactContent?: unknown
}): string | null {
  // 1) Use normalized artifact's generatedAt (already extracted from content.meta)
  if (args.normalizedGeneratedAt) return args.normalizedGeneratedAt

  // 2) Best-effort fallback to content.meta.* across versions
  const a = args.artifactContent as any
  const meta = a?.content?.meta ?? a?.meta ?? null
  const candidate = meta?.generated_at ?? meta?.generatedAt ?? null
  return typeof candidate === 'string' ? candidate : null
}

/**
 * Get canonical decision model (opportunities) for a project
 * 
 * Returns opportunities in the canonical contract shape.
 * If no opportunities exist, returns empty array.
 */
export async function getDecisionModel(
  supabase: TypedSupabaseClient,
  projectId: string
): Promise<{
  opportunities: Opportunity[]
  runId: string | null
  generatedAt: string | null
}> {
  // Load artifacts
  const artifacts = await listArtifacts(supabase, { projectId })
  
  // Normalize artifacts
  const normalized = normalizeResultsArtifacts(artifacts, projectId)
  
  // Extract opportunities from best artifact
  const bestOpportunities = normalized.opportunities.best
  
  if (!bestOpportunities) {
    return {
      opportunities: [],
      runId: null,
      generatedAt: null,
    }
  }
  
  // Map to canonical Opportunity shape
  // Handle both v3 and v2 formats
  const opportunities: Opportunity[] = []
  
  if (bestOpportunities.type === 'opportunities_v3' && bestOpportunities.content) {
    const v3Opportunities = bestOpportunities.content.opportunities || []
    for (const opp of v3Opportunities) {
      // Map v3 to canonical shape
      const canonical: Opportunity = {
        id: opp.id,
        title: opp.title,
        oneLiner: opp.one_liner,
        one_liner: opp.one_liner, // Support both
        whyNow: opp.why_now,
        why_now: opp.why_now, // Support both
        citations: opp.citations || [],
        proof_points: opp.proof_points || [],
        scoring: opp.scoring,
        tradeoffs: opp.tradeoffs,
        experiments: opp.experiments || [],
        confidence: opp.scoring
          ? {
              coverage_score: opp.scoring.total, // Use total score as coverage
              evidence_strength: opp.scoring.total, // Use total score as strength
            }
          : undefined,
        score: opp.scoring?.total,
        // Extract assumptions/risks from tradeoffs if available
        assumptions: opp.tradeoffs?.what_we_say_no_to || [],
        risks: opp.tradeoffs?.capability_forced || [],
        tags: [], // v3 doesn't have tags, but include for backward compat
      }
      
      // Validate against schema (lenient - allow extra fields)
      const result = OpportunitySchema.safeParse(canonical)
      if (result.success) {
        opportunities.push(result.data)
      } else {
        // Log but include anyway (backward compat)
        console.warn('[getDecisionModel] Opportunity validation warning', {
          id: canonical.id,
          errors: result.error.errors,
        })
        opportunities.push(canonical)
      }
    }
  } else if (bestOpportunities.type === 'opportunities_v2' && bestOpportunities.content) {
    const v2Opportunities = bestOpportunities.content.opportunities || []
    for (const opp of v2Opportunities) {
      // Map v2 to canonical shape
      const canonical: Opportunity = {
        id: opp.title.toLowerCase().replace(/\s+/g, '-'), // Generate ID from title
        title: opp.title,
        whyNow: opp.why_now,
        why_now: opp.why_now, // Support both
        confidence: {
          coverage_score: opp.score,
          evidence_strength: opp.score,
        },
        score: opp.score,
        risks: opp.risks || [],
        assumptions: [], // v2 doesn't have assumptions field
        tags: [opp.type, opp.effort, opp.impact, opp.confidence].filter(Boolean) as string[],
      }
      
      // Validate against schema (lenient)
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
  
  // Extract metadata (drift-safe: use normalized fields + fallbacks)
  const runId = extractRunIdFromArtifact({
    normalizedRunId: bestOpportunities.runId,
    artifactContent: bestOpportunities,
  })
  const generatedAt = extractGeneratedAt({
    normalizedGeneratedAt: bestOpportunities.generatedAt,
    artifactContent: bestOpportunities,
  })
  
  return {
    opportunities,
    runId,
    generatedAt,
  }
}

