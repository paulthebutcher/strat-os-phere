'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionCard } from '@/components/results/SectionCard'
import { UpgradeQualityButton } from '@/components/results/UpgradeQualityButton'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import type { OpportunitiesV2Overlay } from '@/lib/schemas/opportunitiesV2Overlay'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import { FLAGS } from '@/lib/flags'

interface OpportunitiesSectionProps {
  opportunities: OpportunityV3ArtifactContent | OpportunitiesArtifactContent | null
  projectId?: string
  v2Overlay?: OpportunitiesV2Overlay | null
}

/**
 * Opportunities section for Results Memo
 * 
 * Shows top 5 opportunities by score (ranked list with compact details).
 * Clicking an opportunity opens a detail panel showing full information.
 * 
 * When FLAGS.resultsQualityPackV2 is enabled and v2Overlay is available,
 * prefers v2 overlay content for enhanced rendering.
 */
export function OpportunitiesSection({
  opportunities,
  projectId,
  v2Overlay,
}: OpportunitiesSectionProps) {
  const [selectedOppId, setSelectedOppId] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  // Use v2 overlay if flag is on and overlay is available
  const useV2Overlay = FLAGS.resultsQualityPackV2 && v2Overlay

  // Handle refresh after upgrade
  const handleUpgradeSuccess = () => {
    setRefreshKey((prev) => prev + 1)
    // Trigger page refresh to reload artifacts
    window.location.reload()
  }

  // Determine which opportunities to display
  const displayOpportunities = useV2Overlay
    ? v2Overlay.opportunities.map((opp) => ({
        id: opp.id,
        title: opp.title,
        one_liner: opp.one_liner,
        differentiation_mechanism: opp.differentiation_mechanism,
        why_competitors_wont_follow: opp.why_competitors_wont_follow,
        first_experiment: opp.first_experiment,
        confidence: opp.confidence,
        citations: opp.citations,
        score: opp.score,
      }))
    : opportunities && 'opportunities' in opportunities
    ? opportunities.opportunities
    : []

  if (!opportunities && !useV2Overlay) {
    return (
      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Opportunities</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Opportunities are inputs; bets are decisions.
          </p>
        </div>
        
        <SectionCard className="py-12">
          <div className="text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Opportunities will appear here after analysis is generated.
            </p>
          </div>
        </SectionCard>
      </section>
    )
  }
  
  // Sort by score descending
  const sortedOpps = [...displayOpportunities].sort((a, b) => {
    const scoreA = useV2Overlay
      ? ('score' in a ? (a.score ?? 0) : 0)
      : getOpportunityScore(a as any) ?? ('score' in a ? (a.score ?? 0) : 0)
    const scoreB = useV2Overlay
      ? ('score' in b ? (b.score ?? 0) : 0)
      : getOpportunityScore(b as any) ?? ('score' in b ? (b.score ?? 0) : 0)
    return scoreB - scoreA
  })
  
  // Show top 5 by default, expand to all if requested
  const displayOpps = showAll ? sortedOpps : sortedOpps.slice(0, 5)
  const hasMore = sortedOpps.length > 5
  
  const selectedOpp = selectedOppId
    ? sortedOpps.find((opp) => {
        const oppId = 'id' in opp ? opp.id : opp.title.toLowerCase().replace(/\s+/g, '-')
        return oppId === selectedOppId
      })
    : null
  
  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-foreground">Opportunities</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Opportunities are inputs; bets are decisions.
          </p>
        </div>
        {FLAGS.resultsQualityPackV2 && projectId && !useV2Overlay && (
          <UpgradeQualityButton
            projectId={projectId}
            onSuccess={handleUpgradeSuccess}
          />
        )}
      </div>
      
      <div className="space-y-3">
        {displayOpps.map((opp) => {
          const oppId = 'id' in opp ? opp.id : opp.title.toLowerCase().replace(/\s+/g, '-')
          const score = useV2Overlay
            ? ('score' in opp ? opp.score ?? null : null)
            : getOpportunityScore(opp as any) ?? ('score' in opp ? opp.score : null)
          const title = opp.title
          const description = useV2Overlay
            ? ('one_liner' in opp ? opp.one_liner : '')
            : 'one_liner' in opp
            ? opp.one_liner
            : ('who_it_serves' in opp ? opp.who_it_serves : '') ?? ''
          
          return (
            <div
              key={oppId}
              onClick={() => setSelectedOppId(selectedOppId === oppId ? null : oppId)}
              className="cursor-pointer"
            >
            <SectionCard className="hover:border-primary/50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-2">
                    <h3 className="text-base font-semibold text-foreground leading-tight">
                      {title}
                    </h3>
                    {score !== null && (
                      <Badge variant="primary" className="shrink-0">
                        {score}/100
                      </Badge>
                    )}
                  </div>
                  {description && (
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {description}
                    </p>
                  )}
                </div>
              </div>
              
              {/* Expanded detail view */}
              {selectedOppId === oppId && (
                <div className="mt-4 pt-4 border-t border-border space-y-4">
                  {/* V2 Overlay specific fields */}
                  {useV2Overlay && 'differentiation_mechanism' in opp && (
                    <>
                      {/* Differentiation mechanism */}
                      {opp.differentiation_mechanism && opp.differentiation_mechanism.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Differentiation mechanism
                          </h4>
                          <ul className="space-y-1">
                            {opp.differentiation_mechanism.map((item, idx) => (
                              <li key={idx} className="text-sm text-foreground leading-relaxed">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Why competitors won't follow */}
                      {opp.why_competitors_wont_follow && opp.why_competitors_wont_follow.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Why competitors won't follow
                          </h4>
                          <ul className="space-y-1">
                            {opp.why_competitors_wont_follow.map((item, idx) => (
                              <li key={idx} className="text-sm text-foreground leading-relaxed">
                                • {item}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* First experiment */}
                      {opp.first_experiment && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            First experiment ({opp.first_experiment.duration_days} days)
                          </h4>
                          <div className="space-y-2">
                            {opp.first_experiment.steps && opp.first_experiment.steps.length > 0 && (
                              <ul className="space-y-1">
                                {opp.first_experiment.steps.map((step, idx) => (
                                  <li key={idx} className="text-sm text-foreground leading-relaxed">
                                    {idx + 1}. {step}
                                  </li>
                                ))}
                              </ul>
                            )}
                            {opp.first_experiment.metric && (
                              <p className="text-sm text-muted-foreground italic">
                                Success metric: {opp.first_experiment.metric}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Confidence */}
                      {opp.confidence && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Confidence
                          </h4>
                          <Badge variant={opp.confidence === 'high' ? 'default' : opp.confidence === 'medium' ? 'secondary' : 'muted'}>
                            {opp.confidence}
                          </Badge>
                        </div>
                      )}

                      {/* Citations */}
                      {opp.citations && opp.citations.length > 0 && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Citations ({opp.citations.length})
                          </h4>
                          <ul className="space-y-1">
                            {opp.citations.slice(0, 3).map((citation, idx) => (
                              <li key={idx} className="text-sm text-muted-foreground">
                                <a
                                  href={citation.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {citation.source_type || 'Source'} {citation.extracted_at ? `(${new Date(citation.extracted_at).toLocaleDateString()})` : ''}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  {/* Legacy fields (for non-v2 overlays) */}
                  {!useV2Overlay && (
                    <>
                      {/* What it is */}
                      {'problem_today' in opp && (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            What it is
                          </h4>
                          <p className="text-sm text-foreground leading-relaxed">
                            {opp.problem_today}
                          </p>
                        </div>
                      )}
                      
                      {/* Why it matters */}
                      {'proposed_move' in opp ? (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Why it matters
                          </h4>
                          <p className="text-sm text-foreground leading-relaxed">
                            {opp.proposed_move}
                          </p>
                        </div>
                      ) : 'why_now' in opp && opp.why_now ? (
                        <div>
                          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                            Why it matters
                          </h4>
                          <p className="text-sm text-foreground leading-relaxed">
                            {opp.why_now}
                          </p>
                        </div>
                      ) : null}
                    </>
                  )}
                  
                  {/* Competitive gap evidence */}
                  {'proof_points' in opp && opp.proof_points && opp.proof_points.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Competitive gap evidence
                      </h4>
                      <ul className="space-y-2">
                        {opp.proof_points.slice(0, 3).map((proof, index) => (
                          <li key={index} className="text-sm text-foreground leading-relaxed">
                            • {proof.claim}
                            {proof.citations && proof.citations.length > 0 && (
                              <span className="text-muted-foreground ml-2">
                                ({proof.citations.length} citation{proof.citations.length !== 1 ? 's' : ''})
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {/* Score breakdown */}
                  {'scoring' in opp && opp.scoring && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Score breakdown
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {Object.entries(opp.scoring.breakdown || {}).slice(0, 4).map(([key, value]) => (
                          <div key={key}>
                            <div className="text-xs text-muted-foreground mb-1">
                              {key.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                            </div>
                            <div className="text-sm font-medium text-foreground">
                              {typeof value === 'number' ? value.toFixed(1) : 'N/A'}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Suggested bet alignment */}
                  {'title' in opp && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        Suggested bet alignment
                      </h4>
                      <p className="text-sm text-muted-foreground italic">
                        Review Strategic Bets section above to see which bets this opportunity supports.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </SectionCard>
            </div>
          )
        })}
      </div>
      
      {hasMore && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Show less' : `See all ${sortedOpps.length} opportunities`}
          </Button>
        </div>
      )}
      
      {/* Detail panel overlay (for larger screens, could be a drawer) */}
      {selectedOpp && selectedOppId && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 md:hidden">
          <SectionCard className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-semibold text-foreground">{selectedOpp.title}</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedOppId(null)}
              >
                Close
              </Button>
            </div>
            {/* Same detail content as expanded view above */}
          </SectionCard>
        </div>
      )}
    </section>
  )
}

