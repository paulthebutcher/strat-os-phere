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
  
  // Extract metadata
  const runId = bestOpportunities.artifactRunId || null
  const generatedAt = bestOpportunities.content?.meta?.generated_at || null
  
  return {
    opportunities,
    runId,
    generatedAt,
  }
}

