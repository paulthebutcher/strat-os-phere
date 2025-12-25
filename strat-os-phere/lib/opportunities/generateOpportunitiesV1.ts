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
 * Extract domain from URL (deterministic helper)
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    // Fallback: extract domain-like string from URL
    const match = url.match(/https?:\/\/([^\/]+)/)
    return match ? match[1].replace(/^www\./, '') : 'unknown'
  }
}

/**
 * Select best citations from evidence items
 * 
 * Strategy:
 * - Prefer 3-6 citations across at least 2 types
 * - Prefer distinct domains if possible
 * - Ensure all citations have valid url and excerpt (min 20 chars)
 */
function selectBestCitations(
  evidenceItems: NormalizedEvidenceItem[]
): Citation[] {
  // Filter to items with valid url and sufficient excerpt
  const validItems = evidenceItems.filter((item) => {
    const hasUrl = item.url && item.url.trim().length > 0
    const excerpt = item.snippet || item.title || ''
    const hasExcerpt = excerpt.length >= 20
    return hasUrl && hasExcerpt
  })

  if (validItems.length < 3) {
    return []
  }

  // Group by sourceType
  const byType = new Map<string, NormalizedEvidenceItem[]>()
  for (const item of validItems) {
    const type = item.type
    if (!byType.has(type)) {
      byType.set(type, [])
    }
    byType.get(type)!.push(item)
  }

  // Need at least 2 types
  if (byType.size < 2) {
    return []
  }

  // Select citations: prefer diversity across types and domains
  const selected: Citation[] = []
  const usedDomains = new Set<string>()
  const usedTypes = new Set<string>()

  // First pass: select one from each type to ensure type diversity
  for (const [type, items] of byType.entries()) {
    if (selected.length >= 6) break
    
    // Prefer items from distinct domains
    const item = items.find((i) => {
      const domain = extractDomain(i.url)
      return !usedDomains.has(domain)
    }) || items[0]

    const citation = mapEvidenceItemToCitation(item, selected.length)
    selected.push(citation)
    usedTypes.add(type)
    usedDomains.add(extractDomain(item.url))
  }

  // Second pass: fill to 3-6 citations, maintaining diversity
  const remainingItems = validItems.filter((item) => {
    const domain = extractDomain(item.url)
    return !usedDomains.has(domain) || selected.length < 3
  })

  // Sort remaining by type diversity (prefer types we haven't used much)
  const typeCounts = new Map<string, number>()
  for (const citation of selected) {
    typeCounts.set(citation.sourceType, (typeCounts.get(citation.sourceType) || 0) + 1)
  }

  remainingItems.sort((a, b) => {
    const aCount = typeCounts.get(a.type) || 0
    const bCount = typeCounts.get(b.type) || 0
    if (aCount !== bCount) return aCount - bCount // Prefer less-used types
    
    const aDomain = extractDomain(a.url)
    const bDomain = extractDomain(b.url)
    const aDomainUsed = usedDomains.has(aDomain)
    const bDomainUsed = usedDomains.has(bDomain)
    if (aDomainUsed !== bDomainUsed) return aDomainUsed ? 1 : -1 // Prefer new domains
    
    return 0
  })

  // Add remaining items up to 6 total
  for (const item of remainingItems) {
    if (selected.length >= 6) break
    const citation = mapEvidenceItemToCitation(item, selected.length)
    selected.push(citation)
    usedDomains.add(extractDomain(item.url))
  }

  // Ensure we have at least 3 citations
  if (selected.length < 3) {
    return []
  }

  // Ensure we have at least 2 distinct types
  const selectedTypes = new Set(selected.map((c) => c.sourceType))
  if (selectedTypes.size < 2) {
    return []
  }

  return selected
}

/**
 * Generate candidate opportunities from evidence
 * 
 * Deterministic rule-based implementation:
 * - Groups evidence by sourceType and domain
 * - Selects best citations (3-6 across ≥2 types, prefer distinct domains)
 * - Creates up to 2 candidates using templates:
 *   - Candidate A: "Differentiation wedge" (competitive gap)
 *   - Candidate B: "Adoption / time-to-value" wedge
 * - Populates fields with conservative, evidence-tied language
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
  // Step 1: Select best citations
  const citations = selectBestCitations(evidenceItems)
  
  if (citations.length < 3) {
    // Fail closed: insufficient citations
    return []
  }

  // Step 2: Extract context for generation
  const decisionQuestion = projectContext?.market || 'competitive positioning'
  const targetUser = projectContext?.targetCustomer || 'product leaders'
  const market = projectContext?.market || 'the market'
  const competitorNames = projectContext?.competitors?.map((c) => c.name).join(', ') || 'competitors'

  // Step 3: Derive JTBD from context
  const jtbd = {
    job: `Evaluate ${decisionQuestion} opportunities`,
    context: `Product leaders evaluating ${market} need to identify strategic opportunities`,
    constraints: `Limited resources and competitive pressure require focused investment`,
  }

  // Step 4: Generate candidates using templates
  const candidates: Array<{
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
  }> = []

  // Candidate A: Differentiation wedge (competitive gap)
  const evidenceTypes = Array.from(new Set(citations.map((c) => c.sourceType)))
  const evidenceSummary = `${citations.length} evidence sources across ${evidenceTypes.length} types`
  
  candidates.push({
    title: `Differentiation opportunity in ${market}`,
    jtbd,
    forWhom: projectContext?.targetCustomer 
      ? `${projectContext.targetCustomer} evaluating ${decisionQuestion}`
      : `Product leaders evaluating ${decisionQuestion}`,
    whyCompetitorsMissIt: `${competitorNames} appear to have gaps in addressing specific customer needs, as evidenced by ${evidenceSummary}. This suggests an opportunity to differentiate through focused feature development or positioning.`,
    recommendation: {
      whatToDo: `Investigate the specific gaps identified in the evidence and develop a focused differentiation strategy that addresses unmet customer needs.`,
      whyNow: `Market conditions and competitive landscape suggest this is a timely opportunity to establish a differentiated position.`,
      expectedImpact: `Potential to capture market share by addressing gaps that competitors are not currently addressing effectively.`,
      risks: [
        `Competitors may respond quickly to close the gap`,
        `Market needs may evolve before implementation`,
        `Differentiation may require significant investment`,
      ],
    },
    citations,
    assumptions: [
      `Evidence accurately reflects current competitive landscape`,
      `Identified gaps represent genuine customer needs`,
      `Market conditions remain relatively stable`,
      `Sufficient resources available to pursue differentiation`,
    ],
  })

  // Candidate B: Adoption / time-to-value wedge (if we have enough evidence)
  if (citations.length >= 4 && evidenceTypes.length >= 2) {
    candidates.push({
      title: `Improve time-to-value for ${targetUser}`,
      jtbd: {
        job: `Reduce time-to-value for ${targetUser}`,
        context: `${targetUser} need faster adoption and value realization`,
        constraints: `Existing solutions may have complex onboarding or require significant setup time`,
      },
      forWhom: projectContext?.targetCustomer 
        ? `${projectContext.targetCustomer} seeking faster value realization`
        : `Product leaders seeking faster time-to-value`,
      whyCompetitorsMissIt: `Evidence from ${evidenceSummary} suggests that current solutions may have adoption friction or require significant time investment. This represents an opportunity to streamline onboarding and accelerate value delivery.`,
      recommendation: {
        whatToDo: `Design and implement streamlined onboarding processes, reduce setup complexity, and focus on delivering immediate value to users.`,
        whyNow: `Customer expectations for quick value delivery are increasing, and early movers in this area can gain competitive advantage.`,
        expectedImpact: `Faster adoption rates, improved customer satisfaction, and potential market share gains from users switching from slower solutions.`,
        risks: [
          `Simplifying too much may reduce feature depth`,
          `Competitors may quickly match improvements`,
          `Implementation may require significant product changes`,
        ],
      },
      citations,
      assumptions: [
        `Time-to-value is a significant factor in customer decision-making`,
        `Evidence reflects genuine adoption friction in current solutions`,
        `Streamlined approach can be implemented without sacrificing core value`,
        `Market values speed of value delivery`,
      ],
    })
  }

  return candidates
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

