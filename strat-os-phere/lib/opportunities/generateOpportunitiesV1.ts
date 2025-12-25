/**
 * Generate Opportunities V1 - Strict JSON generation with fail-closed gating
 * 
 * This generator produces OpportunityV1 artifacts that:
 * - Must pass strict Zod validation
 * - Must meet evidence quality gates (≥3 citations, ≥2 types)
 * - Must have deterministic, explainable scores
 * - Must fail closed (return [] if evidence insufficient)
 */

// Generate UUID - use crypto.randomUUID if available, otherwise fallback
function generateUUID(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  // Fallback for environments without crypto.randomUUID
  return `opp-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}
import type { TypedSupabaseClient } from '@/lib/supabase/types'
import type { NormalizedEvidenceBundle, NormalizedEvidenceItem } from '@/lib/evidence/types'
import {
  OpportunityV1Schema,
  OpportunitiesArtifactV1Schema,
  type OpportunityV1,
  type OpportunitiesArtifactV1,
  type Citation,
  OPPORTUNITY_V1_SCHEMA_VERSION,
} from './opportunityV1'
import {
  hasMinimumEvidenceForOpportunity,
  deriveConfidenceFromEvidence,
} from './evidenceGating'
import {
  computeOpportunityScores,
  type ScoringContext,
} from './scoring'

/**
 * Input parameters for generating opportunities
 */
export type GenerateOpportunitiesV1Params = {
  projectRunId: string
  pipelineVersion: string
  inputVersion: number
  evidenceBundle: NormalizedEvidenceBundle | null
  projectContext?: {
    projectId: string
    projectName?: string
    market?: string
    targetCustomer?: string
    competitors?: Array<{ name: string; url?: string }>
  }
}

/**
 * Result of opportunity generation
 */
export type GenerateOpportunitiesV1Result = {
  artifact: OpportunitiesArtifactV1
  validationErrors?: string[]
}

/**
 * Map evidence item to Citation schema
 */
function mapEvidenceItemToCitation(
  item: NormalizedEvidenceItem,
  index: number
): Citation {
  // Generate stable evidenceId if not present
  const evidenceId = item.id || `ev-${index}-${Date.now()}`

  // Map NormalizedEvidenceType to Citation sourceType
  const sourceTypeMap: Record<string, Citation['sourceType']> = {
    pricing: 'pricing',
    docs: 'docs',
    reviews: 'reviews',
    jobs: 'jobs',
    changelog: 'changelog',
    community: 'community',
    security: 'security',
    blog: 'other', // blog maps to 'other' for now
    other: 'other',
  }

  const sourceType = sourceTypeMap[item.type] || 'other'

  // Use snippet as excerpt, ensure minimum length
  const excerpt = item.snippet && item.snippet.length >= 20
    ? item.snippet
    : item.title || item.url

  return {
    evidenceId,
    url: item.url,
    sourceType,
    excerpt: excerpt.length >= 20 ? excerpt : `${excerpt}...`, // Ensure min length
    retrievedAt: item.retrievedAt || undefined,
  }
}

/**
 * Generate candidate opportunities from evidence
 * 
 * NOTE: This is a placeholder implementation. Actual generation logic should:
 * - Use LLM to synthesize opportunities from evidence
 * - Or use rule-based extraction from evidence patterns
 * - Must produce structured candidate objects that can be validated
 * 
 * For now, this returns an empty array (fail-closed) since we don't have
 * the generation logic yet. This is valid - the generator fails closed when
 * it cannot produce valid opportunities.
 * 
 * @param evidenceItems - Evidence items to synthesize from
 * @param projectContext - Project context for generating relevant opportunities
 * @returns Array of candidate opportunity objects (before gating/scoring)
 */
async function generateCandidateOpportunities(
  evidenceItems: NormalizedEvidenceItem[],
  projectContext?: GenerateOpportunitiesV1Params['projectContext']
): Promise<Array<{
  title: string
  jtbd: { job: string; context: string; constraints?: string }
  forWhom: string
  whyCompetitorsMissIt: string
  recommendation: {
    whatToDo: string
    whyNow: string
    expectedImpact: string
    risks: string[]
  }
  citations: Citation[]
  assumptions: string[]
}>> {
  // TODO: Implement actual opportunity generation logic
  // This could:
  // 1. Call LLM with evidence bundle and prompt for opportunities
  // 2. Use rule-based extraction from evidence patterns
  // 3. Synthesize from existing artifacts (profiles, synthesis, etc.)
  
  // For now, return empty array (fail-closed)
  // This ensures we don't generate invalid opportunities
  return []
}

/**
 * Validate and process a candidate opportunity into OpportunityV1
 * 
 * This function:
 * 1. Validates citations meet evidence gates
 * 2. Computes scores
 * 3. Derives confidence
 * 4. Validates with Zod schema
 * 
 * @param candidate - Candidate opportunity
 * @param index - Index for ID generation
 * @returns Validated OpportunityV1 or null if validation fails
 */
function processCandidateOpportunity(
  candidate: Awaited<ReturnType<typeof generateCandidateOpportunities>>[0],
  index: number
): OpportunityV1 | null {
  // Step 1: Validate citations meet evidence gates
  const gatingResult = hasMinimumEvidenceForOpportunity(candidate.citations)
  if (!gatingResult.ok) {
    // Fail closed - candidate doesn't meet evidence requirements
    return null
  }

  // Step 2: Derive confidence from evidence
  const confidence = deriveConfidenceFromEvidence(candidate.citations)

  // Step 3: Compute scores
  const scoringContext: ScoringContext = {
    citations: candidate.citations,
    opportunityTitle: candidate.title,
    jtbd: candidate.jtbd,
    whyCompetitorsMissIt: candidate.whyCompetitorsMissIt,
    recommendation: candidate.recommendation,
  }

  const { scores, whyThisRanks } = computeOpportunityScores(scoringContext)

  // Step 4: Build evidence summary
  const evidenceTypesPresent = Array.from(
    new Set(candidate.citations.map((c) => c.sourceType))
  )

  // Step 5: Build complete opportunity object
  const opportunity = {
    id: generateUUID(),
    title: candidate.title,
    jtbd: candidate.jtbd,
    forWhom: candidate.forWhom,
    whyCompetitorsMissIt: candidate.whyCompetitorsMissIt,
    recommendation: candidate.recommendation,
    citations: candidate.citations,
    evidenceSummary: {
      totalCitations: candidate.citations.length,
      evidenceTypesPresent,
    },
    scores,
    whyThisRanks,
    assumptions: candidate.assumptions,
    confidence,
    schema_version: OPPORTUNITY_V1_SCHEMA_VERSION,
  }

  // Step 6: Validate with Zod schema
  const validationResult = OpportunityV1Schema.safeParse(opportunity)
  if (!validationResult.success) {
    // Fail closed - schema validation failed
    return null
  }

  return validationResult.data
}

/**
 * Generate Opportunities V1 artifact
 * 
 * This function:
 * 1. Converts evidence bundle to citations
 * 2. Generates candidate opportunities
 * 3. Filters candidates through evidence gating
 * 4. Computes scores and validates
 * 5. Returns artifact (may be empty if none pass)
 * 
 * @param params - Generation parameters
 * @returns Opportunities artifact with generation notes
 */
export async function generateOpportunitiesV1(
  params: GenerateOpportunitiesV1Params
): Promise<GenerateOpportunitiesV1Result> {
  const {
    projectRunId,
    pipelineVersion,
    inputVersion,
    evidenceBundle,
    projectContext,
  } = params

  const generatedAt = new Date().toISOString()
  const validationErrors: string[] = []

  try {
    // Step 1: Convert evidence bundle to citations
    const evidenceItems = evidenceBundle?.items || []
    
    if (evidenceItems.length === 0) {
      return {
        artifact: {
          schema_version: OPPORTUNITY_V1_SCHEMA_VERSION,
          project_run_id: projectRunId,
          pipeline_version: pipelineVersion,
          input_version: inputVersion,
          generated_at: generatedAt,
          opportunities: [],
          generation_notes: {
            failed_closed: true,
            reasons: ['No evidence items available'],
            evidence_stats: {
              totalEvidenceItems: 0,
              evidenceTypesPresent: [],
            },
          },
        },
      }
    }

    // Step 2: Generate candidate opportunities
    const candidates = await generateCandidateOpportunities(
      evidenceItems,
      projectContext
    )

    if (candidates.length === 0) {
      // Fail closed - no candidates generated
      const evidenceTypesPresent = Array.from(
        new Set(evidenceItems.map((item) => item.type))
      )
      
      return {
        artifact: {
          schema_version: OPPORTUNITY_V1_SCHEMA_VERSION,
          project_run_id: projectRunId,
          pipeline_version: pipelineVersion,
          input_version: inputVersion,
          generated_at: generatedAt,
          opportunities: [],
          generation_notes: {
            failed_closed: true,
            reasons: [
              'No candidate opportunities generated',
              'Opportunity generation logic not yet implemented',
            ],
            evidence_stats: {
              totalEvidenceItems: evidenceItems.length,
              evidenceTypesPresent,
              competitorCount: projectContext?.competitors?.length,
            },
          },
        },
      }
    }

    // Step 3: Process candidates through gating and scoring
    const validOpportunities: OpportunityV1[] = []
    const droppedReasons: string[] = []

    for (const candidate of candidates) {
      const processed = processCandidateOpportunity(candidate, validOpportunities.length)
      
      if (processed) {
        validOpportunities.push(processed)
      } else {
        droppedReasons.push(`Candidate "${candidate.title}" failed validation`)
      }
    }

      // Step 4: Build final artifact
      const evidenceTypesPresent = Array.from(
        new Set(evidenceItems.map((item) => item.type))
      ).map((t) => String(t))

    const artifact: OpportunitiesArtifactV1 = {
      schema_version: OPPORTUNITY_V1_SCHEMA_VERSION,
      project_run_id: projectRunId,
      pipeline_version: pipelineVersion,
      input_version: inputVersion,
      generated_at: generatedAt,
      opportunities: validOpportunities,
      generation_notes:
        validOpportunities.length === 0
          ? {
              failed_closed: true,
              reasons: droppedReasons.length > 0
                ? droppedReasons
                : [
                    'Insufficient evidence coverage for any opportunity',
                    'Citations did not span 2 evidence types',
                  ],
              evidence_stats: {
                totalEvidenceItems: evidenceItems.length,
                evidenceTypesPresent,
                competitorCount: projectContext?.competitors?.length,
              },
            }
          : {
              failed_closed: false,
              evidence_stats: {
                totalEvidenceItems: evidenceItems.length,
                evidenceTypesPresent,
                competitorCount: projectContext?.competitors?.length,
              },
            },
    }

    // Step 5: Validate artifact schema
    const artifactValidation = OpportunitiesArtifactV1Schema.safeParse(artifact)
    if (!artifactValidation.success) {
      const errors = artifactValidation.error.issues.map(
        (issue) => `${issue.path.join('.')}: ${issue.message}`
      )
      validationErrors.push(...errors)
      
      // Still return artifact for debugging, but mark as invalid
      return {
        artifact,
        validationErrors,
      }
    }

    return {
      artifact: artifactValidation.data,
    }
  } catch (error) {
    // Catch any uncaught errors and fail closed
    const errorMessage = error instanceof Error ? error.message : String(error)
    validationErrors.push(`Uncaught error: ${errorMessage}`)

    const evidenceItems = evidenceBundle?.items || []
    const evidenceTypesPresent = evidenceItems.length > 0
      ? Array.from(new Set(evidenceItems.map((item) => item.type))).map((t) => String(t))
      : []

    return {
      artifact: {
        schema_version: OPPORTUNITY_V1_SCHEMA_VERSION,
        project_run_id: projectRunId,
        pipeline_version: pipelineVersion,
        input_version: inputVersion,
        generated_at: generatedAt,
        opportunities: [],
        generation_notes: {
          failed_closed: true,
          reasons: [`Generation failed: ${errorMessage}`],
          evidence_stats: {
            totalEvidenceItems: evidenceItems.length,
            evidenceTypesPresent,
          },
        },
      },
      validationErrors,
    }
  }
}

