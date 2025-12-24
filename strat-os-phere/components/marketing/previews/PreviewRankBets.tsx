/**
 * PreviewRankBets
 * 
 * Static HTML screenshot showing the "Generate ranked bets" step.
 * Displays prioritized strategic opportunities with citations and confidence scores.
 */
import { TrendingUp, Target, FileText, Shield, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function PreviewRankBets() {
  const opportunities = [
    {
      rank: 1,
      title: 'Free tier expansion opportunity',
      description:
        '3 of 5 competitors offer free tiers with generous limits. Notion and Linear have seen 40%+ user growth after launching free tiers.',
      confidence: 92,
      defensibility: 'High',
      citations: 8,
      metrics: [
        { label: 'Market coverage', value: '60%' },
        { label: 'User impact', value: 'High' },
      ],
    },
    {
      rank: 2,
      title: 'API-first positioning gap',
      description:
        'Linear and Airtable emphasize API access in their positioning. Figma and Notion have limited API marketing, creating a positioning opportunity.',
      confidence: 85,
      defensibility: 'Medium',
      citations: 6,
      metrics: [
        { label: 'Market coverage', value: '40%' },
        { label: 'User impact', value: 'Medium' },
      ],
    },
    {
      rank: 3,
      title: 'Team collaboration features',
      description:
        'All competitors have strong team features, but reviews indicate gaps in real-time collaboration UX. Opportunity for differentiation.',
      confidence: 78,
      defensibility: 'Medium',
      citations: 12,
      metrics: [
        { label: 'Market coverage', value: '80%' },
        { label: 'User impact', value: 'High' },
      ],
    },
  ]

  const getConfidenceColor = (score: number) => {
    if (score >= 85) return 'text-green-700 bg-green-100'
    if (score >= 70) return 'text-yellow-700 bg-yellow-100'
    return 'text-orange-700 bg-orange-100'
  }

  const getDefensibilityColor = (level: string) => {
    if (level === 'High') return 'text-green-700 bg-green-100'
    if (level === 'Medium') return 'text-yellow-700 bg-yellow-100'
    return 'text-orange-700 bg-orange-100'
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border-subtle bg-surface-muted/30 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-primary mb-1">
              Ranked Strategic Bets
            </h2>
            <p className="text-sm text-text-secondary">
              Prioritized opportunities with citations and confidence scores
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <TrendingUp className="w-4 h-4" />
            <span>3 opportunities ranked</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="space-y-4">
          {opportunities.map((opp) => (
            <div
              key={opp.rank}
              className="rounded-lg border border-border-subtle bg-surface hover:border-accent-primary/30 transition-colors"
            >
              <div className="p-6">
                {/* Header row */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent-primary/10 border-2 border-accent-primary/20">
                      <span className="text-sm font-bold text-accent-primary">
                        {opp.rank}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-text-primary mb-1">
                        {opp.title}
                      </h3>
                      <p className="text-sm text-text-secondary leading-relaxed">
                        {opp.description}
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-text-muted flex-shrink-0" />
                </div>

                {/* Metrics and badges */}
                <div className="flex items-center gap-4 flex-wrap">
                  {/* Confidence score */}
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-text-muted" />
                    <span className="text-xs text-text-muted">Confidence:</span>
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-1 rounded',
                        getConfidenceColor(opp.confidence)
                      )}
                    >
                      {opp.confidence}%
                    </span>
                  </div>

                  {/* Defensibility */}
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-text-muted" />
                    <span className="text-xs text-text-muted">Defensibility:</span>
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-1 rounded',
                        getDefensibilityColor(opp.defensibility)
                      )}
                    >
                      {opp.defensibility}
                    </span>
                  </div>

                  {/* Citations */}
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-text-muted" />
                    <span className="text-xs text-text-muted">
                      {opp.citations} citations
                    </span>
                  </div>

                  {/* Metrics */}
                  {opp.metrics.map((metric, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <span className="text-xs text-text-muted">
                        {metric.label}:
                      </span>
                      <span className="text-xs font-semibold text-text-primary">
                        {metric.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Citations preview */}
              <div className="border-t border-border-subtle bg-surface-muted/30 px-6 py-3">
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <FileText className="w-3 h-3" />
                  <span>
                    Sources: notion.so/pricing, linear.app/docs, figma.com/blog,
                    airtable.com/pricing, coda.io/changelog...
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

