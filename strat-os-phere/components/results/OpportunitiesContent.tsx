'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { GenerateResultsV2Button } from '@/components/results/GenerateResultsV2Button'
import { EvidenceConfidencePanel } from '@/components/results/EvidenceConfidencePanel'
import { EvidenceCoveragePanel } from '@/components/results/EvidenceCoveragePanel'
import { extractCitationsFromArtifact } from '@/lib/results/evidence'
import { isFlagEnabled } from '@/lib/flags'
import { compressOpportunities } from '@/lib/results/opportunityCompression'
import { getOpportunityScore, getWhyNowSignals } from '@/lib/results/opportunityUx'
import { computeAggregateConfidence } from '@/lib/ui/decisionConfidence'
import { SectionCard } from '@/components/results/SectionCard'
import { ProgressiveRevealWrapper } from '@/components/results/ProgressiveRevealWrapper'
import { DecisionConfidenceSummary } from '@/components/results/DecisionConfidenceSummary'
import { DecisionConfidencePanel } from '@/components/results/DecisionConfidencePanel'
import { HardToCopyCallout } from '@/components/results/HardToCopyCallout'
import { CopySectionButton } from '@/components/results/CopySectionButton'
import { LineageLink } from '@/components/results/LineageLink'
import { Badge } from '@/components/ui/badge'
import { Collapsible } from '@/components/ui/collapsible'
import { WhyNowChip } from '@/components/results/WhyNowChip'
import { ConfidenceEcho } from '@/components/shared/ConfidenceEcho'
import { AssumptionBadge } from '@/components/shared/AssumptionBadge'
import { ExpertNote } from '@/components/shared/ExpertNote'
import { MergeBadge } from '@/components/results/MergeBadge'
import { CounterfactualCallout } from '@/components/results/CounterfactualCallout'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import { formatOpportunitiesV3ToMarkdown, formatOpportunitiesV2ToMarkdown } from '@/lib/results/normalizeArtifacts'

interface OpportunitiesContentProps {
  projectId: string
  opportunitiesV3: OpportunityV3ArtifactContent | null | undefined
  opportunitiesV2: OpportunitiesArtifactContent | null | undefined
}

export function OpportunitiesContent({
  projectId,
  opportunitiesV3,
  opportunitiesV2,
}: OpportunitiesContentProps) {
  // Prefer v3, fallback to v2
  const opportunities = opportunitiesV3 ?? opportunitiesV2 ?? null
  const isV3 = Boolean(opportunitiesV3)
  
  // Extract citations
  const citations = extractCitationsFromArtifact(opportunities)
  
  // Feature flag check
  const qualityPackEnabled = isFlagEnabled('resultsQualityPackV1')
  
  if (!opportunities || (isV3 ? !opportunitiesV3?.opportunities?.length : !opportunitiesV2?.opportunities?.length)) {
    const copyContent = opportunitiesV3 
      ? formatOpportunitiesV3ToMarkdown(opportunitiesV3)
      : opportunitiesV2
      ? formatOpportunitiesV2ToMarkdown(opportunitiesV2)
      : ''
    
    return (
      <section className="space-y-6">
        {/* Evidence panel - show even when no opportunities yet */}
        <EvidenceConfidencePanel citations={citations} />
        
        {/* Evidence Coverage Panel (feature-flagged) */}
        {qualityPackEnabled && opportunities && (
          <EvidenceCoveragePanel artifact={opportunities} />
        )}
        
        <SectionCard className="py-16">
          <div className="w-full max-w-md space-y-6 text-center mx-auto">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">
                No opportunities generated yet
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Once inputs are confirmed, Plinth will surface defensible opportunities ranked by impact and confidence.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <GenerateResultsV2Button
                projectId={projectId}
                label="Generate Analysis"
              />
              <Button asChild variant="outline" type="button">
                <Link href={`/projects/${projectId}/competitors`}>
                  Review inputs
                </Link>
              </Button>
            </div>
          </div>
        </SectionCard>
      </section>
    )
  }

  // Handle v3 opportunities
  if (isV3 && opportunitiesV3) {
    return <OpportunitiesV3Content projectId={projectId} opportunities={opportunitiesV3} />
  }

  // Handle v2 opportunities
  if (opportunitiesV2) {
    return <OpportunitiesV2Content projectId={projectId} opportunities={opportunitiesV2} />
  }

  return null
}

function OpportunitiesV3Content({
  projectId,
  opportunities,
}: {
  projectId: string
  opportunities: OpportunityV3ArtifactContent
}) {
  const citations = extractCitationsFromArtifact(opportunities)
  const qualityPackEnabled = isFlagEnabled('resultsQualityPackV1')
  
  // Apply compression if feature flag is enabled
  let opportunitiesToRender = opportunities.opportunities
  let compressionStats: { original: number; merged: number } | null = null
  
  if (qualityPackEnabled) {
    const compressed = compressOpportunities(opportunities.opportunities)
    opportunitiesToRender = compressed.items as unknown as typeof opportunities.opportunities
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
  const copyContent = formatOpportunitiesV3ToMarkdown(opportunities)

  return (
    <section className="space-y-6">
      {/* Evidence & Confidence Panel */}
      <EvidenceConfidencePanel citations={citations} />
      
      {qualityPackEnabled && (
        <EvidenceCoveragePanel artifact={opportunities} />
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
            Start with the top opportunity. Everything else supports why it's worth betting on.
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
                <Badge variant="primary" className="text-sm">
                  {topScore}/100
                </Badge>
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
          const score = getOpportunityScore(opp)
          const whyNowSignals = getWhyNowSignals(opp)
          const isTop3 = index < 3

          return (
            <SectionCard key={index} className="p-6">
              <header className="mb-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-2">
                      <h3 className="text-base font-semibold text-foreground leading-snug">{opp.title}</h3>
                      {qualityPackEnabled && 'mergedCount' in opp && typeof opp.mergedCount === 'number' && opp.mergedCount > 1 && (
                        <MergeBadge
                          mergedCount={opp.mergedCount}
                          mergedTitles={('mergedTitles' in opp && Array.isArray(opp.mergedTitles)) ? (opp.mergedTitles as string[]) : []}
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {score !== null && (
                      <Badge variant="primary">
                        {score}/100
                      </Badge>
                    )}
                  </div>
                </div>
                <p className="text-sm text-foreground leading-relaxed">{opp.one_liner}</p>
              </header>

              <div className="space-y-5 text-sm">
                {opp.why_now && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Why now
                    </h4>
                    <p className="text-foreground leading-relaxed">{opp.why_now}</p>
                    {whyNowSignals.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {whyNowSignals.map((signal, signalIndex) => (
                          <WhyNowChip key={signalIndex} signal={signal} />
                        ))}
                      </div>
                    )}
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
                          <p className="text-foreground font-medium">{exp.hypothesis || exp.smallest_test}</p>
                          {exp.success_metric && (
                            <p className="text-muted-foreground text-xs">Success metric: {exp.success_metric}</p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {opp.proof_points && opp.proof_points.length > 0 && (
                  <div>
                    <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                      Proof points
                    </h4>
                    <ul className="space-y-2">
                      {opp.proof_points.map((proof, proofIndex) => (
                        <li key={proofIndex} className="text-foreground leading-relaxed">
                          {proof.claim && (
                            <span>{proof.claim}</span>
                          )}
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

                {isTop3 && (
                  <CounterfactualCallout opportunity={opp} />
                )}
              </div>
            </SectionCard>
          )
        })}
      </div>
    </section>
  )
}

function OpportunitiesV2Content({
  projectId,
  opportunities,
}: {
  projectId: string
  opportunities: OpportunitiesArtifactContent
}) {
  const citations = extractCitationsFromArtifact(opportunities)
  const qualityPackEnabled = isFlagEnabled('resultsQualityPackV1')
  
  if (!opportunities.opportunities?.length) {
    return (
      <section className="space-y-6">
        <EvidenceConfidencePanel citations={citations} />
        {qualityPackEnabled && (
          <EvidenceCoveragePanel artifact={opportunities} />
        )}
        <SectionCard className="py-16">
          <div className="w-full max-w-md space-y-6 text-center mx-auto">
            <h2 className="text-xl font-semibold text-foreground">
              No opportunities generated yet
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Once inputs are confirmed, Plinth will surface defensible opportunities ranked by impact and confidence.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <GenerateResultsV2Button
                projectId={projectId}
                label="Generate Analysis"
              />
              <Button asChild variant="outline" type="button">
                <Link href={`/projects/${projectId}/competitors`}>
                  Review inputs
                </Link>
              </Button>
            </div>
          </div>
        </SectionCard>
      </section>
    )
  }

  const copyContent = formatOpportunitiesV2ToMarkdown(opportunities)
  
  // Apply compression if feature flag is enabled
  let opportunitiesToUse = opportunities
  let compressionStats: { original: number; merged: number } | null = null
  
  if (qualityPackEnabled) {
    const compressed = compressOpportunities(opportunities.opportunities)
    compressionStats = compressed.stats
    opportunitiesToUse = {
      ...opportunities,
      opportunities: compressed.items as unknown as typeof opportunities.opportunities,
    }
  }

  // Sort by score
  const sortedOpportunities = [...opportunitiesToUse.opportunities].sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  return (
    <section className="space-y-6">
      <EvidenceConfidencePanel citations={citations} />
      
      {qualityPackEnabled && (
        <EvidenceCoveragePanel artifact={opportunities} />
      )}
      
      {qualityPackEnabled && compressionStats && compressionStats.merged > 0 && (
        <div className="text-sm text-muted-foreground">
          Merged {compressionStats.merged} duplicate{compressionStats.merged !== 1 ? 's' : ''}
        </div>
      )}
      
      <div className="rounded-lg bg-muted/50 border border-border p-4">
        <h3 className="text-sm font-semibold text-foreground mb-1">Opportunities</h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          A defensible way to win that forces competitors to react. Ranked by score (impact, effort, confidence, and linked job importance).
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
                <Badge variant="primary">
                  {opp.score}/100
                </Badge>
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

