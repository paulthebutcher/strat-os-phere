import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { paths } from '@/lib/routes'
import { Badge } from '@/components/ui/badge'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

interface ExecutiveSummaryProps {
  projectId: string
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
  hasArtifacts: boolean
  competitorCount: number
  effectiveCompetitorCount?: number
  generatedAt?: string | null
}

export function ExecutiveSummary({
  projectId,
  opportunitiesV3,
  opportunitiesV2,
  hasArtifacts,
  competitorCount,
  effectiveCompetitorCount,
  generatedAt,
}: ExecutiveSummaryProps) {
  // Extract top 3 opportunities, preferring V3 over V2
  const topOpportunities: Array<{
    title: string
    description: string
    score: number | null
    href: string
  }> = []

  if (opportunitiesV3?.opportunities) {
    const sorted = [...opportunitiesV3.opportunities]
      .sort((a, b) => {
        const scoreA = getOpportunityScore(a) ?? 0
        const scoreB = getOpportunityScore(b) ?? 0
        return scoreB - scoreA
      })
      .slice(0, 3)

    topOpportunities.push(
      ...sorted.map((opp) => ({
        title: opp.title,
        description: opp.one_liner || opp.proposed_move || '',
        score: getOpportunityScore(opp),
        href: `/projects/${projectId}/opportunities#${opp.id || opp.title.toLowerCase().replace(/\s+/g, '-')}`,
      }))
    )
  } else if (opportunitiesV2?.opportunities) {
    const sorted = [...opportunitiesV2.opportunities]
      .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
      .slice(0, 3)

    topOpportunities.push(
      ...sorted.map((opp) => ({
        title: opp.title,
        description: opp.who_it_serves || '',
        score: opp.score ?? null,
        href: `/projects/${projectId}/opportunities#${opp.title.toLowerCase().replace(/\s+/g, '-')}`,
      }))
    )
  }

  const formattedGeneratedAt = generatedAt
    ? new Date(generatedAt).toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : null

  return (
    <div className="flex min-h-[calc(100vh-57px)] items-start justify-center px-4">
      <main className="flex w-full max-w-5xl flex-col gap-8 py-12">
        <header className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between md:pb-8 border-b border-border">
          <div className="space-y-3">
            <div className="space-y-1">
              <h1 className="readout-h1">
                Executive Summary
              </h1>
              <p className="readout-label">
                High-level overview of key insights and strategic opportunities
              </p>
            </div>
            {formattedGeneratedAt && (
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>
                  Generated <span className="font-medium text-foreground">{formattedGeneratedAt}</span>
                </span>
                <span>
                  <span className="font-medium text-foreground">{effectiveCompetitorCount ?? competitorCount}</span> competitors analyzed
                </span>
              </div>
            )}
          </div>
        </header>

        {!hasArtifacts ? (
          <section className="flex flex-col items-center justify-center py-16 px-6">
            <div className="w-full max-w-md space-y-4 text-center">
              <h2 className="text-xl font-semibold text-foreground">
                Analysis not yet generated
              </h2>
              <p className="text-sm text-muted-foreground">
                Generate your first analysis to view competitive insights and strategic opportunities.
              </p>
            </div>
          </section>
        ) : (
          <section className="space-y-8">
            {/* Top Opportunities */}
            {topOpportunities.length > 0 ? (
              <div className="space-y-6">
                <div>
                  <h2 className="readout-h2 mb-2">
                    Top Opportunities
                  </h2>
                  <p className="readout-label">
                    Highest-scoring strategic opportunities to prioritize
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  {topOpportunities.map((opp, index) => (
                    <Link
                      key={index}
                      href={opp.href}
                      className="panel p-5 card-hover block"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <h3 className="text-base font-semibold text-foreground leading-tight">
                          {opp.title}
                        </h3>
                        {opp.score !== null && (
                          <Badge variant="primary" className="shrink-0">
                            {opp.score}/100
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3">
                        {opp.description}
                      </p>
                    </Link>
                  ))}
                </div>
                <div className="flex justify-center">
                  <Button asChild variant="outline">
                    <Link href={paths.opportunities(projectId)}>
                      View all opportunities
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="panel p-6">
                <p className="text-sm text-muted-foreground text-center">
                  No opportunities available. Generate analysis to see strategic opportunities.
                </p>
              </div>
            )}

            {/* Quick Links */}
            <div className="space-y-4">
              <h2 className="readout-h2">Quick Links</h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Link
                  href={paths.opportunities(projectId)}
                  className="panel p-4 card-hover block"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Opportunities
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    View all strategic opportunities
                  </p>
                </Link>
                <Link
                  href={`/projects/${projectId}/jobs`}
                  className="panel p-4 card-hover block"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Jobs
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Jobs to be done analysis
                  </p>
                </Link>
                <Link
                  href={paths.scorecard(projectId)}
                  className="panel p-4 card-hover block"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Scorecard
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Competitive scoring matrix
                  </p>
                </Link>
                <Link
                  href={paths.competitors(projectId)}
                  className="panel p-4 card-hover block"
                >
                  <h3 className="text-sm font-semibold text-foreground mb-1">
                    Competitors
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Detailed competitor profiles
                  </p>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  )
}

