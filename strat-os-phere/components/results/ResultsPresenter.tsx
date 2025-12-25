'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GenerateResultsV2Button } from '@/components/results/GenerateResultsV2Button'
import { EvidenceConfidencePanel } from '@/components/results/EvidenceConfidencePanel'
import { EvidenceCoveragePanel } from '@/components/results/EvidenceCoveragePanel'
import { isFlagEnabled } from '@/lib/flags'
import { compressOpportunities } from '@/lib/results/opportunityCompression'
import { getOpportunityScore, getWhyNowSignals } from '@/lib/results/opportunityUx'
import { computeAggregateConfidence } from '@/lib/ui/decisionConfidence'
import { SectionCard } from '@/components/results/SectionCard'
import { ProgressiveRevealWrapper } from '@/components/results/ProgressiveRevealWrapper'
import { DecisionConfidenceSummary } from '@/components/results/DecisionConfidenceSummary'
import { CopySectionButton } from '@/components/results/CopySectionButton'
import { Badge } from '@/components/ui/badge'
import { WhyNowChip } from '@/components/results/WhyNowChip'
import { MergeBadge } from '@/components/results/MergeBadge'
import { CounterfactualCallout } from '@/components/results/CounterfactualCallout'
import { formatOpportunitiesV3ToMarkdown, formatOpportunitiesV2ToMarkdown } from '@/lib/results/normalizeArtifacts'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { NormalizedCitation } from '@/lib/results/evidence'
import { extractCitationsFromAllArtifacts } from '@/lib/results/evidence'
import { OpportunityPlaybook } from '@/components/results/OpportunityPlaybook'
import { OpportunityExperiments } from '@/components/results/OpportunityExperiments'
import { OpportunityCardV1 } from '@/components/opportunities/OpportunityCardV1'
import type { CompetitorSnapshot } from '@/lib/schemas/competitorSnapshot'
import { InlineCallout } from '@/components/ui/InlineCallout'
import { computeEvidenceStrength } from '@/lib/ux/evidenceStrength'

/**
 * Presenter input shape - simple DTO that doesn't depend on internal schemas
 */
export interface ResultsPresenterHeader {
  title: string
  subtitle?: string
  generatedAtISO?: string
  competitorCount?: number
  evidenceWindowDays?: number
}

export interface ResultsPresenterOpportunity {
  id: string
  title: string
  score: number
  confidence?: 'Low' | 'Medium' | 'High'
  whyItMatters?: string
  oneLiner?: string
  whyNow?: string
  proposedMove?: string
  problemToday?: string
  customer?: string
  experiments?: Array<{
    hypothesis?: string
    smallestTest?: string
    successMetric?: string
    expectedTimeframe?: string
    riskReduced?: string
  }>
  proofPoints?: Array<{
    claim: string
    citations?: Array<{
      sourceType: string
      title?: string | null
      url: string
      recencyDays?: number
    }>
  }>
  evidence?: Array<{
    sourceType: string
    title?: string
    url: string
    recencyDays?: number
  }>
  // V2 specific fields
  type?: string
  impact?: string
  effort?: string
  whoItServes?: string
  // V3 specific fields
  mergedCount?: number
  mergedTitles?: string[]
}

export interface ResultsPresenterProps {
  mode: 'project' | 'sample'
  projectId?: string // Required for project mode
  header: ResultsPresenterHeader
  opportunities: ResultsPresenterOpportunity[]
  citations: NormalizedCitation[]
  // For project mode - pass raw artifacts for advanced features
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
  profiles?: { snapshots: unknown[] } | null
  strategicBets?: unknown | null
  jtbd?: unknown | null
  // For sample mode
  cta?: {
    label: string
    href: string
  }
}

/**
 * ResultsPresenter - Pure presentation component
 * 
 * Renders opportunities UI without data fetching. Used by both:
 * - Real project results pages (mode: "project")
 * - Sample pages (mode: "sample")
 * 
 * This ensures UI changes automatically propagate to samples.
 */
export function ResultsPresenter({
  mode,
  projectId,
  header,
  opportunities,
  citations,
  opportunitiesV3,
  opportunitiesV2,
  profiles,
  strategicBets,
  jtbd,
  cta,
}: ResultsPresenterProps) {
  const qualityPackEnabled = isFlagEnabled('resultsQualityPackV1')
  const isV3 = Boolean(opportunitiesV3)
  
  // Extract citations from all artifacts if available (project mode)
  const allCitations = mode === 'project' && (opportunitiesV3 || opportunitiesV2 || profiles || strategicBets || jtbd)
    ? extractCitationsFromAllArtifacts(
        opportunitiesV3 || opportunitiesV2,
        profiles,
        strategicBets,
        jtbd
      )
    : citations

  // Check if we have raw artifacts (project mode) - these take precedence
  const hasRawArtifacts = Boolean(opportunitiesV3 || opportunitiesV2)
  const hasRawOpportunities = hasRawArtifacts && (
    (opportunitiesV3 && opportunitiesV3.opportunities?.length > 0) ||
    (opportunitiesV2 && opportunitiesV2.opportunities?.length > 0)
  )

  // Handle empty state - only show if no raw artifacts AND no opportunities array
  if (!hasRawOpportunities && opportunities.length === 0) {
    const copyContent = opportunitiesV3 
      ? formatOpportunitiesV3ToMarkdown(opportunitiesV3)
      : opportunitiesV2
      ? formatOpportunitiesV2ToMarkdown(opportunitiesV2)
      : ''
    
    return (
      <section className="space-y-6">
        {/* Evidence panel - show even when no opportunities yet */}
        <EvidenceConfidencePanel citations={allCitations} />
        
        {/* Evidence Coverage Panel (feature-flagged) */}
        {qualityPackEnabled && (opportunitiesV3 || opportunitiesV2) && (
          <EvidenceCoveragePanel artifact={opportunitiesV3 || opportunitiesV2 || null} />
        )}
        
        <SectionCard className="py-16">
          <div className="w-full max-w-md space-y-6 text-center mx-auto">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                No opportunities met the evidence bar yet
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Plinth only surfaces opportunities it can support with sufficient evidence. Add competitors or expand evidence coverage, then rerun.
              </p>
            </div>
            {mode === 'project' && projectId && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="default" type="button">
                  <Link href={`/projects/${projectId}/competitors`}>
                    Improve evidence
                  </Link>
                </Button>
                <Button asChild variant="outline" type="button">
                  <Link href={`/projects/${projectId}/overview`}>
                    Edit inputs
                  </Link>
                </Button>
              </div>
            )}
            {mode === 'sample' && cta && (
              <Button asChild variant="brand" type="button">
                <Link href={cta.href}>
                  {cta.label}
                </Link>
              </Button>
            )}
          </div>
        </SectionCard>
      </section>
    )
  }

  // Handle V3 opportunities (project mode with raw artifacts)
  if (isV3 && opportunitiesV3) {
    return (
      <OpportunitiesV3Presenter
        mode={mode}
        projectId={projectId}
        header={header}
        opportunities={opportunities}
        citations={allCitations}
        opportunitiesV3={opportunitiesV3}
        profiles={profiles}
        cta={cta}
      />
    )
  }

  // Handle V2 opportunities (project mode with raw artifacts)
  if (opportunitiesV2) {
    return (
      <OpportunitiesV2Presenter
        mode={mode}
        projectId={projectId}
        header={header}
        opportunities={opportunities}
        citations={allCitations}
        opportunitiesV2={opportunitiesV2}
        cta={cta}
      />
    )
  }

  // Fallback: render from presenter opportunities array (sample mode or when no raw artifacts)
  if (opportunities.length > 0) {
    return (
      <OpportunitiesFromPresenter
        mode={mode}
        projectId={projectId}
        header={header}
        opportunities={opportunities}
        citations={allCitations}
        cta={cta}
      />
    )
  }

  // Final fallback: empty state (should not reach here if logic is correct)
  return (
    <section className="space-y-6">
      <EvidenceConfidencePanel citations={allCitations} />
      <div className="rounded-lg border border-border bg-muted/30 p-8 text-center">
        <p className="text-sm text-muted-foreground">
          No opportunities available.
        </p>
      </div>
    </section>
  )
}

function OpportunitiesV3Presenter({
  mode,
  projectId,
  header,
  opportunities,
  citations,
  opportunitiesV3,
  profiles,
  cta,
}: {
  mode: 'project' | 'sample'
  projectId?: string
  header: ResultsPresenterHeader
  opportunities: ResultsPresenterOpportunity[]
  citations: NormalizedCitation[]
  opportunitiesV3: OpportunityV3ArtifactContent
  profiles?: { snapshots: unknown[] } | null
  cta?: ResultsPresenterProps['cta']
}) {
  const qualityPackEnabled = isFlagEnabled('resultsQualityPackV1')
  
  // Extract competitor names from profiles (with type safety)
  const competitors = (profiles?.snapshots || [])
    .filter((snapshot): snapshot is CompetitorSnapshot => {
      return (
        typeof snapshot === 'object' &&
        snapshot !== null &&
        'competitor_name' in snapshot &&
        typeof (snapshot as CompetitorSnapshot).competitor_name === 'string'
      )
    })
    .map((snapshot) => ({
      name: snapshot.competitor_name,
      signals: snapshot.proof_points?.map((pp) => pp.claim) || [],
    }))
  
  // Apply compression if feature flag is enabled
  let opportunitiesToRender = opportunitiesV3.opportunities
  let compressionStats: { original: number; merged: number } | null = null
  
  if (qualityPackEnabled) {
    const compressed = compressOpportunities(opportunitiesV3.opportunities)
    opportunitiesToRender = compressed.items as unknown as typeof opportunitiesV3.opportunities
    compressionStats = compressed.stats
  }

  // Sort by score descending
  const sortedOpportunities = [...opportunitiesToRender].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  // Compute aggregate confidence
  const aggregateConfidence = computeAggregateConfidence(sortedOpportunities)

  // Get top opportunity
  const topOpportunity = sortedOpportunities[0]
  const topScore = getOpportunityScore(topOpportunity)

  // Build panel content for copy
  const panelContentLines = [
    '# If you did only one thing in the next 90 days',
    '',
    'A single bet that maximizes learning and leverage.',
    '',
    `## ${topOpportunity.title}`,
    '',
    topOpportunity.one_liner,
    '',
  ]

  const rationale = topOpportunity.one_liner || topOpportunity.proposed_move || ''
  if (rationale) {
    panelContentLines.push('**Rationale:**', rationale, '')
  }

  if (topOpportunity.experiments && topOpportunity.experiments.length > 0) {
    panelContentLines.push('**First experiment:**', topOpportunity.experiments[0].hypothesis || topOpportunity.experiments[0].smallest_test || '')
  } else {
    panelContentLines.push('**First experiment:** Run a small validation test to confirm customer interest and feasibility.')
  }

  const panelContent = panelContentLines.join('\n')
  const copyContent = formatOpportunitiesV3ToMarkdown(opportunitiesV3)

  // Check if evidence is thin/limited across all opportunities
  const allCitationsForStrength = citations.map((c) => ({
    url: c.url,
    sourceType: c.sourceType || 'unknown',
    excerpt: c.url, // Use URL as excerpt since NormalizedCitation doesn't have excerpt
  }))
  const overallEvidenceStrength = computeEvidenceStrength(allCitationsForStrength as any)
  const isEvidenceThin = overallEvidenceStrength.strength === 'Limited' || overallEvidenceStrength.isWeak

  return (
    <section className="space-y-6">
      {/* Evidence & Confidence Panel */}
      <EvidenceConfidencePanel citations={citations} />
      
      {/* Thin evidence callout - show when opportunities exist but evidence is limited */}
      {sortedOpportunities.length > 0 && isEvidenceThin && (
        <InlineCallout>
          Evidence is limited. Treat these as directional. Add coverage to strengthen confidence boundaries.
        </InlineCallout>
      )}
      
      {qualityPackEnabled && (
        <EvidenceCoveragePanel artifact={opportunitiesV3} />
      )}
      
      {qualityPackEnabled && compressionStats && compressionStats.merged > 0 && (
        <div className="text-sm text-muted-foreground">
          Merged {compressionStats.merged} duplicate{compressionStats.merged !== 1 ? 's' : ''}
        </div>
      )}
      
      <ProgressiveRevealWrapper section="top" storageKey="opportunities-progressive-reveal">
        <div className="mb-4 rounded-lg bg-muted/30 border border-border p-4">
          <p className="text-sm text-foreground font-medium mb-1">Results are ready</p>
          <p className="text-sm text-muted-foreground">
            Start with the top opportunity. Each card shows what to do, why now, and what would increase confidence.
          </p>
        </div>
      </ProgressiveRevealWrapper>

      {/* "If you did only one thing" panel */}
      <ProgressiveRevealWrapper section="top" storageKey="opportunities-progressive-reveal">
        <SectionCard className="border-2 border-primary/20">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-foreground mb-1">
                If you did only one thing in the next 90 days
              </h2>
              <p className="text-sm text-muted-foreground">
                A single bet that maximizes learning and leverage.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {topScore !== null && (
                <div className="flex shrink-0 items-center gap-2 rounded-lg bg-[rgba(var(--plinth-accent)/0.1)] px-3 py-1.5">
                  <span className="text-lg font-bold text-[rgb(var(--plinth-accent))]">
                    {topScore.toFixed(1)}
                  </span>
                  <span className="text-xs text-[rgb(var(--plinth-muted))]">score</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-semibold text-foreground mb-2">{topOpportunity.title}</h3>
              <p className="text-sm text-foreground leading-relaxed">{topOpportunity.one_liner}</p>
            </div>
            {topOpportunity.experiments && topOpportunity.experiments.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  First experiment
                </h4>
                <p className="text-sm text-foreground leading-relaxed">
                  {topOpportunity.experiments[0].hypothesis || topOpportunity.experiments[0].smallest_test}
                </p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <CopySectionButton content={panelContent} label="Copy summary" />
          </div>
        </SectionCard>
      </ProgressiveRevealWrapper>

      {/* Aggregate confidence summary */}
      {sortedOpportunities.length > 0 && (
        <DecisionConfidenceSummary
          overallLevel={aggregateConfidence.overallLevel}
          totalEvidenceCount={aggregateConfidence.totalEvidenceCount}
          sourceTypes={aggregateConfidence.sourceTypes}
          averageRecency={aggregateConfidence.averageRecency}
        />
      )}

      {/* All opportunities */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">All opportunities</h2>
          <CopySectionButton content={copyContent} label="Copy all" />
        </div>
        
        {sortedOpportunities.map((opp, index) => {
          return (
            <OpportunityCardV1
              key={index}
              opportunity={opp}
              projectId={projectId}
            />
          )
        })}
      </div>
    </section>
  )
}

function OpportunitiesV2Presenter({
  mode,
  projectId,
  header,
  opportunities,
  citations,
  opportunitiesV2,
  cta,
}: {
  mode: 'project' | 'sample'
  projectId?: string
  header: ResultsPresenterHeader
  opportunities: ResultsPresenterOpportunity[]
  citations: NormalizedCitation[]
  opportunitiesV2: OpportunitiesArtifactContent
  cta?: ResultsPresenterProps['cta']
}) {
  const qualityPackEnabled = isFlagEnabled('resultsQualityPackV1')
  
  if (!opportunitiesV2.opportunities?.length) {
    return (
      <section className="space-y-6">
        <EvidenceConfidencePanel citations={citations} />
        {qualityPackEnabled && (
          <EvidenceCoveragePanel artifact={opportunitiesV2} />
        )}
        <SectionCard className="py-16">
          <div className="w-full max-w-md space-y-6 text-center mx-auto">
            <h2 className="text-xl font-semibold text-foreground">
              No opportunities met the evidence bar yet
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Plinth only surfaces opportunities it can support with sufficient evidence. Add competitors or expand evidence coverage, then rerun.
            </p>
            {mode === 'project' && projectId && (
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button asChild variant="default" type="button">
                  <Link href={`/projects/${projectId}/competitors`}>
                    Improve evidence
                  </Link>
                </Button>
                <Button asChild variant="outline" type="button">
                  <Link href={`/projects/${projectId}/overview`}>
                    Edit inputs
                  </Link>
                </Button>
              </div>
            )}
            {mode === 'sample' && cta && (
              <Button asChild variant="brand" type="button">
                <Link href={cta.href}>
                  {cta.label}
                </Link>
              </Button>
            )}
          </div>
        </SectionCard>
      </section>
    )
  }

  const copyContent = formatOpportunitiesV2ToMarkdown(opportunitiesV2)
  
  // Apply compression if feature flag is enabled
  let opportunitiesToUse = opportunitiesV2
  let compressionStats: { original: number; merged: number } | null = null
  
  if (qualityPackEnabled) {
    const compressed = compressOpportunities(opportunitiesV2.opportunities)
    compressionStats = compressed.stats
    opportunitiesToUse = {
      ...opportunitiesV2,
      opportunities: compressed.items as unknown as typeof opportunitiesV2.opportunities,
    }
  }

  // Sort by score
  const sortedOpportunities = [...opportunitiesToUse.opportunities].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  // Check if evidence is thin/limited across all opportunities
  const allCitationsForStrength = citations.map((c) => ({
    url: c.url,
    sourceType: c.sourceType || 'unknown',
    excerpt: c.url, // Use URL as excerpt since NormalizedCitation doesn't have excerpt
  }))
  const overallEvidenceStrength = computeEvidenceStrength(allCitationsForStrength as any)
  const isEvidenceThin = overallEvidenceStrength.strength === 'Limited' || overallEvidenceStrength.isWeak

  return (
    <section className="space-y-6">
      <EvidenceConfidencePanel citations={citations} />
      
      {/* Thin evidence callout - show when opportunities exist but evidence is limited */}
      {sortedOpportunities.length > 0 && isEvidenceThin && (
        <InlineCallout>
          Evidence is limited. Treat these as directional. Add coverage to strengthen confidence boundaries.
        </InlineCallout>
      )}
      
      {qualityPackEnabled && (
        <EvidenceCoveragePanel artifact={opportunitiesV2} />
      )}
      
      {qualityPackEnabled && compressionStats && compressionStats.merged > 0 && (
        <div className="text-sm text-muted-foreground">
          Merged {compressionStats.merged} duplicate{compressionStats.merged !== 1 ? 's' : ''}
        </div>
      )}
      
      <div className="rounded-lg bg-muted/50 border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Opportunities</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Decisions you can defend. Ranked by evidence, impact, and confidence.
        </p>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-foreground">All opportunities</h2>
        <CopySectionButton content={copyContent} label="Copy all" />
      </div>

      {sortedOpportunities.map((opp, index) => (
        <SectionCard key={index} className="p-6">
          <header className="mb-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-foreground leading-snug">{opp.title}</h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex shrink-0 items-center gap-2 rounded-lg bg-[rgba(var(--plinth-accent)/0.1)] px-3 py-1.5">
                  <span className="text-lg font-bold text-[rgb(var(--plinth-accent))]">
                    {opp.score.toFixed(1)}
                  </span>
                  <span className="text-xs text-[rgb(var(--plinth-muted))]">score</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">{opp.type.replace('_', ' ')}</Badge>
              <Badge variant={opp.impact === 'high' ? 'success' : opp.impact === 'med' ? 'warning' : 'default'} className="text-xs">
                Impact: {opp.impact}
              </Badge>
              <Badge variant={opp.effort === 'S' ? 'success' : opp.effort === 'M' ? 'warning' : 'default'} className="text-xs">
                Effort: {opp.effort}
              </Badge>
              <Badge variant={opp.confidence === 'high' ? 'success' : opp.confidence === 'med' ? 'warning' : 'default'} className="text-xs">
                Confidence: {opp.confidence}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Who it serves:</span> {opp.who_it_serves}
            </p>
          </header>

          <div className="space-y-5 text-sm">
            {opp.why_now && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Why now
                </h4>
                <p className="text-foreground leading-relaxed">{opp.why_now}</p>
              </div>
            )}

            {('experiments' in opp && Array.isArray(opp.experiments) && opp.experiments.length > 0) ? (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Experiments
                </h4>
                <ul className="space-y-3">
                  {(opp.experiments as any[]).map((exp: any, expIndex: number) => (
                    <li key={expIndex} className="space-y-2">
                      <p className="text-foreground font-medium">{exp.hypothesis || exp.smallest_test}</p>
                      {exp.success_metric && (
                        <p className="text-muted-foreground text-xs">Success metric: {exp.success_metric}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {('proof' in opp && Array.isArray(opp.proof) && opp.proof.length > 0) ? (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Proof points
                </h4>
                <ul className="space-y-2">
                  {(opp.proof as any[]).map((proof: any, proofIndex: number) => (
                    <li key={proofIndex} className="text-foreground leading-relaxed">
                      {proof.evidence_quote && (
                        <span className="italic">"{proof.evidence_quote}"</span>
                      )}
                      {proof.source && (
                        <span className="text-muted-foreground"> — {proof.source}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </SectionCard>
      ))}
    </section>
  )
}

// Fallback presenter for sample mode when we only have the presenter opportunities array
function OpportunitiesFromPresenter({
  mode,
  projectId,
  header,
  opportunities,
  citations,
  cta,
}: {
  mode: 'project' | 'sample'
  projectId?: string
  header: ResultsPresenterHeader
  opportunities: ResultsPresenterOpportunity[]
  citations: NormalizedCitation[]
  cta?: ResultsPresenterProps['cta']
}) {
  // Sort by score descending
  const sortedOpportunities = [...opportunities].sort((a, b) => b.score - a.score)

  return (
    <section className="space-y-6">
      <EvidenceConfidencePanel citations={citations} />
      
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">All opportunities</h2>
        </div>
        
        {sortedOpportunities.map((opp, index) => (
          <SectionCard key={opp.id || index} className="p-6">
            <header className="mb-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground leading-snug">{opp.title}</h3>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="flex shrink-0 items-center gap-2 rounded-lg bg-[rgba(var(--plinth-accent)/0.1)] px-3 py-1.5">
                    <span className="text-lg font-bold text-[rgb(var(--plinth-accent))]">
                      {opp.score.toFixed(1)}
                    </span>
                    <span className="text-xs text-[rgb(var(--plinth-muted))]">score</span>
                  </div>
                </div>
              </div>
              {opp.oneLiner && (
                <p className="text-sm text-foreground leading-relaxed">{opp.oneLiner}</p>
              )}
            </header>

            <div className="space-y-5 text-sm">
              {opp.whyNow && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Why now
                  </h4>
                  <p className="text-foreground leading-relaxed">{opp.whyNow}</p>
                </div>
              )}

              {opp.experiments && opp.experiments.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Experiments
                  </h4>
                  <ul className="space-y-3">
                    {opp.experiments.map((exp, expIndex) => (
                      <li key={expIndex} className="space-y-2">
                        <p className="text-foreground font-medium">{exp.hypothesis || exp.smallestTest}</p>
                        {exp.successMetric && (
                          <p className="text-muted-foreground text-xs">Success metric: {exp.successMetric}</p>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {opp.proofPoints && opp.proofPoints.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                    Proof points
                  </h4>
                  <ul className="space-y-2">
                    {opp.proofPoints.map((proof, proofIndex) => (
                      <li key={proofIndex} className="text-foreground leading-relaxed">
                        {proof.claim}
                        {proof.citations && proof.citations.length > 0 && (
                          <span className="text-muted-foreground text-xs ml-2">
                            ({proof.citations.length} source{proof.citations.length !== 1 ? 's' : ''})
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </SectionCard>
        ))}
      </div>
      
      {mode === 'sample' && cta && (
        <div className="pt-6 border-t border-border">
          <Button asChild variant="brand" className="w-full sm:w-auto">
            <Link href={cta.href}>
              {cta.label}
            </Link>
          </Button>
        </div>
      )}
    </section>
  )
}

