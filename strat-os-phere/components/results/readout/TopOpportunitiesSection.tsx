'use client'

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { SectionCard } from '@/components/results/SectionCard'
import { pickInlineCitations } from '@/lib/results/citations'
import { CitationList } from '@/components/citations/CitationList'

interface TopOpportunity {
  title: string
  score: number | null
  oneLiner: string | null
  whyNow: string | null
  proposedMove: string | null
  whatItEnables: string[]
  whoItsFor: string | null
  firstExperiment: string | null
  raw: unknown
}

interface TopOpportunitiesSectionProps {
  opportunities: TopOpportunity[]
  projectId: string
}

/**
 * Top Opportunities Section - Shows top 3 opportunities with citations
 */
export function TopOpportunitiesSection({
  opportunities,
  projectId,
}: TopOpportunitiesSectionProps) {
  if (opportunities.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="readout-h1">Top Opportunities</h2>
        <SectionCard className="py-12">
          <div className="text-center">
            <p className="readout-label">
              Top opportunities will appear here after analysis is generated.
            </p>
          </div>
        </SectionCard>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="readout-h1">Top Opportunities</h2>
        <p className="mt-2 readout-label">
          The 3 bets most likely to differentiate — based on available evidence and competitor inputs.
        </p>
      </div>
      <div className="space-y-4">
        {opportunities.map((opp, index) => {
          const citations = pickInlineCitations(opp.raw, 2)
          const opportunityId = `opportunity-${index}`

          return (
            <div id={opportunityId}>
              <SectionCard
                className="hover:shadow-md transition-shadow"
              >
              <div className="space-y-4">
                {/* Header with title and score */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-2">
                      <h3 className="readout-h2">
                        {opp.title}
                      </h3>
                      {opp.score !== null && typeof opp.score === 'number' && (
                        <div className="flex shrink-0 items-center gap-2 rounded-lg bg-[rgba(var(--plinth-accent)/0.1)] px-3 py-1.5">
                          <span className="text-lg font-bold text-[rgb(var(--plinth-accent))]">
                            {opp.score.toFixed(1)}
                          </span>
                          <span className="text-xs text-[rgb(var(--plinth-muted))]">score</span>
                        </div>
                      )}
                    </div>
                    {opp.oneLiner && (
                      <p className="readout-body">
                        {opp.oneLiner}
                      </p>
                    )}
                  </div>
                </div>

                {/* Content bullets */}
                <div className="space-y-3 pt-2 border-t border-border">
                  {/* What it enables */}
                  {opp.whatItEnables.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                        What it enables
                      </h4>
                      <ul className="space-y-1.5">
                        {opp.whatItEnables.slice(0, 4).map((item, itemIndex) => (
                          <li key={itemIndex} className="text-sm text-foreground flex items-start gap-2">
                            <span className="text-muted-foreground mt-1">•</span>
                            <span className="flex-1">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Who it's for */}
                  {opp.whoItsFor && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        Who it's for
                      </h4>
                      <p className="text-sm text-foreground">{opp.whoItsFor}</p>
                    </div>
                  )}

                  {/* First experiment */}
                  {opp.firstExperiment && (
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                        First experiment
                      </h4>
                      <p className="text-sm text-foreground">{opp.firstExperiment}</p>
                    </div>
                  )}

                  {/* Inline citations */}
                  {citations.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-border">
                      <span className="text-xs text-muted-foreground">Sources:</span>
                      <CitationList citations={citations.map(c => ({ url: c.url, title: c.label }))} variant="inline" />
                    </div>
                  )}
                </div>

                {/* View details link */}
                <div className="pt-2 border-t border-border">
                  <Link
                    href={`/projects/${projectId}/results?tab=opportunities#${opportunityId}`}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    View details →
                  </Link>
                </div>
              </div>
            </SectionCard>
            </div>
          )
        })}
      </div>
    </section>
  )
}

