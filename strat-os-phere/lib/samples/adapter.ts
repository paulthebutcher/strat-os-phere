/**
 * Samples adapter - maps sample JSON to ResultsPresenter input shape
 * 
 * This adapter allows sample pages to use the same ResultsPresenter component
 * as real project results, ensuring UI changes automatically propagate.
 */

import type { ResultsPresenterHeader, ResultsPresenterOpportunity } from '@/components/results/ResultsPresenter'
import type { NormalizedCitation } from '@/lib/results/evidence'
import { normalizeCitation } from '@/lib/results/evidence'

/**
 * Sample metadata structure
 */
export interface SampleMeta {
  slug: string
  title: string
  subtitle?: string
  generatedAtISO?: string
  competitorCount?: number
  evidenceWindowDays?: number
}

/**
 * Sample artifact structure (matches OpportunityV3 or V2 shape)
 */
export interface SampleArtifact {
  meta?: {
    generated_at?: string
    run_id?: string
    competitor_count?: number
  }
  opportunities?: Array<{
    id?: string
    title: string
    score?: number
    scoring?: {
      total: number
    }
    one_liner?: string
    why_now?: string
    proposed_move?: string
    problem_today?: string
    customer?: string
    experiments?: Array<{
      hypothesis?: string
      smallest_test?: string
      success_metric?: string
      expected_timeframe?: string
      risk_reduced?: string
    }>
    proof_points?: Array<{
      claim: string
      citations?: Array<{
        url: string
        source_type?: string
        title?: string | null
        domain?: string | null
        extracted_at?: string
      }>
    }>
    citations?: Array<{
      url: string
      source_type?: string
      title?: string | null
      domain?: string | null
      extracted_at?: string
    }>
    // V2 fields
    type?: string
    impact?: string
    effort?: string
    confidence?: string
    who_it_serves?: string
    proof?: Array<{
      evidence_quote?: string
      source?: string
    }>
  }>
}

/**
 * Sample registry - maps slugs to sample data
 * In a real implementation, this would load from static JSON files
 */
const SAMPLE_REGISTRY: Record<string, { meta: SampleMeta; artifact: SampleArtifact }> = {
  // Example sample - will be populated with actual sample data
  'example': {
    meta: {
      slug: 'example',
      title: 'Sample Analysis',
      subtitle: 'Example competitive analysis results',
      generatedAtISO: new Date().toISOString(),
      competitorCount: 5,
      evidenceWindowDays: 90,
    },
    artifact: {
      meta: {
        generated_at: new Date().toISOString(),
      },
      opportunities: [
        {
          id: '1',
          title: 'Pricing transparency gap',
          score: 82,
          one_liner: 'Competitors hide pricing behind contact forms, creating friction for self-service buyers.',
          why_now: 'Recent pricing changes and customer feedback indicate strong demand for transparent pricing.',
          experiments: [
            {
              hypothesis: 'Transparent pricing increases conversion',
              smallest_test: 'A/B test pricing page with visible pricing',
              success_metric: 'Conversion rate increase',
            },
          ],
          proof_points: [
            {
              claim: 'Competitor A requires contact form for pricing',
              citations: [
                {
                  url: 'https://example.com/competitor-a/pricing',
                  source_type: 'pricing',
                  title: 'Competitor A Pricing Page',
                },
              ],
            },
          ],
          citations: [
            {
              url: 'https://example.com/competitor-a/pricing',
              source_type: 'pricing',
              title: 'Competitor A Pricing Page',
            },
          ],
        },
      ],
    },
  },
}

/**
 * Get sample metadata by slug
 */
export function getSampleBySlug(slug: string): SampleMeta | null {
  const sample = SAMPLE_REGISTRY[slug]
  return sample?.meta || null
}

/**
 * Load sample artifact by slug
 */
export function loadSampleArtifact(slug: string): SampleArtifact | null {
  const sample = SAMPLE_REGISTRY[slug]
  return sample?.artifact || null
}

/**
 * Map sample data to ResultsPresenter header
 */
export function mapSampleToHeader(meta: SampleMeta): ResultsPresenterHeader {
  return {
    title: meta.title,
    subtitle: meta.subtitle,
    generatedAtISO: meta.generatedAtISO,
    competitorCount: meta.competitorCount,
    evidenceWindowDays: meta.evidenceWindowDays,
  }
}

/**
 * Map sample artifact to ResultsPresenter opportunities array
 */
export function mapSampleToOpportunities(artifact: SampleArtifact): ResultsPresenterOpportunity[] {
  if (!artifact.opportunities || artifact.opportunities.length === 0) {
    return []
  }

  return artifact.opportunities.map((opp) => {
    // Extract score from either score field or scoring.total
    const score = opp.score ?? opp.scoring?.total ?? 0

    // Map citations to evidence format
    const evidence: ResultsPresenterOpportunity['evidence'] = opp.citations?.map((cit) => {
      const normalized = normalizeCitation(cit)
      if (!normalized) return null
      
      // Calculate recency days if extracted_at is available
      let recencyDays: number | undefined
      if (cit.extracted_at) {
        const extractedDate = new Date(cit.extracted_at)
        if (!isNaN(extractedDate.getTime())) {
          const now = new Date()
          recencyDays = Math.floor((now.getTime() - extractedDate.getTime()) / (1000 * 60 * 60 * 24))
        }
      }

      return {
        sourceType: normalized.sourceType,
        title: cit.title || undefined,
        url: normalized.url,
        recencyDays,
      }
    }).filter((e): e is NonNullable<typeof e> => e !== null) || []

    // Map proof points
    const proofPoints: ResultsPresenterOpportunity['proofPoints'] = opp.proof_points?.map((proof) => ({
      claim: proof.claim,
      citations: proof.citations?.map((cit) => {
        const normalized = normalizeCitation(cit)
        if (!normalized) return null

        let recencyDays: number | undefined
        if (cit.extracted_at) {
          const extractedDate = new Date(cit.extracted_at)
          if (!isNaN(extractedDate.getTime())) {
            const now = new Date()
            recencyDays = Math.floor((now.getTime() - extractedDate.getTime()) / (1000 * 60 * 60 * 24))
          }
        }

        return {
          sourceType: normalized.sourceType,
          title: cit.title || undefined,
          url: normalized.url,
          recencyDays,
        }
      }).filter((c): c is NonNullable<typeof c> => c !== null) || [],
    })) || []

    return {
      id: opp.id || `opp-${opp.title.toLowerCase().replace(/\s+/g, '-')}`,
      title: opp.title,
      score,
      oneLiner: opp.one_liner,
      whyNow: opp.why_now,
      proposedMove: opp.proposed_move,
      problemToday: opp.problem_today,
      customer: opp.customer,
      experiments: opp.experiments?.map((exp) => ({
        hypothesis: exp.hypothesis,
        smallestTest: exp.smallest_test,
        successMetric: exp.success_metric,
        expectedTimeframe: exp.expected_timeframe,
        riskReduced: exp.risk_reduced,
      })),
      proofPoints,
      evidence,
      // V2 fields
      type: opp.type,
      impact: opp.impact,
      effort: opp.effort,
      whoItServes: opp.who_it_serves,
    }
  })
}

/**
 * Extract citations from sample artifact
 */
export function extractCitationsFromSample(artifact: SampleArtifact): NormalizedCitation[] {
  const citations: NormalizedCitation[] = []

  if (!artifact.opportunities) {
    return citations
  }

  for (const opp of artifact.opportunities) {
    // Extract from top-level citations
    if (opp.citations) {
      for (const cit of opp.citations) {
        const normalized = normalizeCitation(cit)
        if (normalized) {
          citations.push(normalized)
        }
      }
    }

    // Extract from proof_points citations
    if (opp.proof_points) {
      for (const proof of opp.proof_points) {
        if (proof.citations) {
          for (const cit of proof.citations) {
            const normalized = normalizeCitation(cit)
            if (normalized) {
              citations.push(normalized)
            }
          }
        }
      }
    }
  }

  // Deduplicate by URL
  const seen = new Set<string>()
  return citations.filter((cit) => {
    if (seen.has(cit.url)) {
      return false
    }
    seen.add(cit.url)
    return true
  })
}

/**
 * Get all available sample slugs
 */
export function getAllSampleSlugs(): string[] {
  return Object.keys(SAMPLE_REGISTRY)
}

