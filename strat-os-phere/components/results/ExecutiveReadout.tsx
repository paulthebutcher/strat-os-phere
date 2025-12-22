/**
 * Executive Readout - Compact executive summary for VP skim (30 seconds)
 * 
 * Displays:
 * - Top 3 Opportunities (title + one-line "why now" + score)
 * - Biggest Risk (derived from lowest-confidence top item or weak evidence coverage)
 * - Cost of Doing Nothing (one sentence derived from market pressure / competitor momentum)
 * - One Bold Recommendation (select the #1 opportunity and produce a crisp action statement)
 */

import { Badge } from '@/components/ui/badge'
import { CopySectionButton } from './CopySectionButton'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'

interface ExecutiveReadoutProps {
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
  generatedAt?: string | null
  projectName?: string
}

/**
 * Format priority label from score
 */
function getPriorityLabel(score: number | null): string {
  if (score === null) return 'Exploratory'
  if (score >= 70) return 'High'
  if (score >= 50) return 'Medium'
  return 'Exploratory'
}

/**
 * Format readout as markdown for export
 */
function formatReadoutToMarkdown(props: ExecutiveReadoutProps): string {
  const { opportunitiesV3, opportunitiesV2, generatedAt, projectName } = props
  
  const opportunities = opportunitiesV3?.opportunities ?? opportunitiesV2?.opportunities ?? []
  const sorted = [...opportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  const top3 = sorted.slice(0, 3)
  const top1 = sorted[0]
  
  const lines: string[] = []
  lines.push('# Executive Readout')
  if (projectName) lines.push(`**Project:** ${projectName}`)
  if (generatedAt) {
    const date = new Date(generatedAt).toLocaleString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
    lines.push(`**Generated:** ${date}`)
  }
  lines.push('')

  // Top 3 Opportunities
  if (top3.length > 0) {
    lines.push('## Top 3 Opportunities')
    lines.push('')
    top3.forEach((opp, idx) => {
      const score = getOpportunityScore(opp)
      const title = 'title' in opp ? opp.title : 'Untitled Opportunity'
      const whyNow = 'why_now' in opp ? opp.why_now : 'No timing context available'
      const priority = getPriorityLabel(score)
      
      lines.push(`${idx + 1}. **${title}** (${priority} Priority${score !== null ? `, Score: ${score}/100` : ''})`)
      lines.push(`   - Why now: ${whyNow}`)
      lines.push('')
    })
  }

  // Biggest Risk
  const lowestConfidence = sorted.find(opp => {
    const score = getOpportunityScore(opp)
    const citationsCount = 'citations' in opp && Array.isArray(opp.citations) 
      ? opp.citations.length 
      : ('proof_points' in opp && Array.isArray(opp.proof_points))
        ? opp.proof_points.reduce((sum, pp) => sum + (Array.isArray(pp.citations) ? pp.citations.length : 0), 0)
        : 0
    return score !== null && score >= 50 && citationsCount < 3
  })

  if (lowestConfidence) {
    const title = 'title' in lowestConfidence ? lowestConfidence.title : 'Top opportunity'
    lines.push('## Biggest Risk')
    lines.push('')
    lines.push(`${title} has high potential but limited evidence. Additional validation recommended before committing significant resources.`)
    lines.push('')
  }

  // Cost of Doing Nothing
  const totalCitations = sorted.reduce((sum, opp) => {
    const citations = 'citations' in opp && Array.isArray(opp.citations) 
      ? opp.citations.length 
      : ('proof_points' in opp && Array.isArray(opp.proof_points))
        ? opp.proof_points.reduce((sum, pp) => sum + (Array.isArray(pp.citations) ? pp.citations.length : 0), 0)
        : 0
    return sum + citations
  }, 0)

  lines.push('## Cost of Doing Nothing')
  lines.push('')
  if (totalCitations >= 10) {
    lines.push('Market signals and competitive activity suggest that delaying action on these opportunities risks ceding ground to competitors and missing a window of market opportunity.')
  } else {
    lines.push('While evidence is still developing, market dynamics suggest that inaction may allow competitors to establish stronger positions in key areas.')
  }
  lines.push('')

  // Bold Recommendation
  if (top1) {
    const title = 'title' in top1 ? top1.title : 'the top opportunity'
    const proposed = 'proposed_move' in top1 ? top1.proposed_move : 'pursue this opportunity'
    lines.push('## Bold Recommendation')
    lines.push('')
    lines.push(`**Prioritize ${title}.** ${proposed}. This represents the highest-scoring opportunity with the strongest evidence base.`)
    lines.push('')
  }

  return lines.join('\n')
}

export function ExecutiveReadout({
  opportunitiesV3,
  opportunitiesV2,
  generatedAt,
  projectName,
}: ExecutiveReadoutProps) {
  const opportunities = opportunitiesV3?.opportunities ?? opportunitiesV2?.opportunities ?? []
  
  if (opportunities.length === 0) {
    return (
      <div className="panel p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Executive Readout</h2>
        </div>
        <p className="text-sm text-muted-foreground">
          Generate analysis to view executive summary.
        </p>
      </div>
    )
  }

  // Sort opportunities by score
  const sorted = [...opportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  const top3 = sorted.slice(0, 3)
  const top1 = sorted[0]

  // Find biggest risk (lowest confidence top item)
  const biggestRisk = sorted.find(opp => {
    const score = getOpportunityScore(opp)
    const citationsCount = 'citations' in opp && Array.isArray(opp.citations) 
      ? opp.citations.length 
      : ('proof_points' in opp && Array.isArray(opp.proof_points))
        ? opp.proof_points.reduce((sum, pp) => sum + (Array.isArray(pp.citations) ? pp.citations.length : 0), 0)
        : 0
    return score !== null && score >= 50 && citationsCount < 3
  })

  // Calculate cost of doing nothing
  const totalCitations = sorted.reduce((sum, opp) => {
    const citations = 'citations' in opp && Array.isArray(opp.citations) 
      ? opp.citations.length 
      : ('proof_points' in opp && Array.isArray(opp.proof_points))
        ? opp.proof_points.reduce((sum, pp) => sum + (Array.isArray(pp.citations) ? pp.citations.length : 0), 0)
        : 0
    return sum + citations
  }, 0)

  const costOfDoingNothing = totalCitations >= 10
    ? 'Market signals and competitive activity suggest that delaying action on these opportunities risks ceding ground to competitors and missing a window of market opportunity.'
    : 'While evidence is still developing, market dynamics suggest that inaction may allow competitors to establish stronger positions in key areas.'

  // Bold recommendation
  const recommendation = top1
    ? (() => {
        const title = 'title' in top1 ? top1.title : 'the top opportunity'
        const proposed = 'proposed_move' in top1 ? top1.proposed_move : 'pursue this opportunity'
        return `Prioritize ${title}. ${proposed}. This represents the highest-scoring opportunity with the strongest evidence base.`
      })()
    : 'Review top opportunities and select the highest-priority initiative based on strategic fit and evidence strength.'

  const markdownContent = formatReadoutToMarkdown({
    opportunitiesV3,
    opportunitiesV2,
    generatedAt,
    projectName,
  })

  return (
    <div className="panel p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-1">Executive Readout</h2>
          <p className="text-xs text-muted-foreground">
            {generatedAt 
              ? `Last generated ${new Date(generatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
              : 'Quick summary for executive review'}
          </p>
        </div>
        <CopySectionButton content={markdownContent} label="Export" />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left column */}
        <div className="space-y-6">
          {/* Top 3 Opportunities */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Top 3 Opportunities</h3>
            <div className="space-y-3">
              {top3.map((opp, idx) => {
                const score = getOpportunityScore(opp)
                const title = 'title' in opp ? opp.title : 'Untitled Opportunity'
                const whyNow = 'why_now' in opp ? opp.why_now : 'No timing context available'
                const priority = getPriorityLabel(score)
                
                return (
                  <div key={idx} className="border-l-2 border-primary/20 pl-3 py-1">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="text-sm font-medium text-foreground">{title}</h4>
                      <Badge variant={score !== null && score >= 70 ? 'primary' : 'muted'} className="shrink-0 text-xs">
                        {priority}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">{whyNow}</p>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Biggest Risk */}
          {biggestRisk && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Biggest Risk</h3>
              <div className="panel-muted p-3">
                <p className="text-xs text-foreground">
                  <span className="font-medium">{'title' in biggestRisk ? biggestRisk.title : 'Top opportunity'}</span> has high potential but limited evidence. Additional validation recommended before committing significant resources.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Cost of Doing Nothing */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Cost of Doing Nothing</h3>
            <div className="panel-muted p-3">
              <p className="text-xs text-foreground">{costOfDoingNothing}</p>
            </div>
          </div>

          {/* Bold Recommendation */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-2">Bold Recommendation</h3>
            <div className="panel-muted p-3 border-l-2 border-primary">
              <p className="text-xs text-foreground font-medium">{recommendation}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

