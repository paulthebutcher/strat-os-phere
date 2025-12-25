/**
 * Decision Brief - Primary post-run experience
 * 
 * Replaces Executive Readout with a compelling, actionable briefing format.
 * Shows: the call, the why, confidence boundaries, and next actions.
 */

import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { CopySectionButton } from './CopySectionButton'
import { ShareButton } from './ShareButton'
import { getOpportunityScore } from '@/lib/results/opportunityUx'
import type { OpportunityV3ArtifactContent } from '@/lib/schemas/opportunityV3'
import type { OpportunitiesArtifactContent } from '@/lib/schemas/opportunities'
import { cn } from '@/lib/utils'

interface DecisionBriefProps {
  projectId: string
  opportunitiesV3?: OpportunityV3ArtifactContent | null
  opportunitiesV2?: OpportunitiesArtifactContent | null
  generatedAt?: string | null
  projectName?: string
  competitorCount?: number
}

/**
 * Get confidence range label from score
 */
function getConfidenceRange(score: number | null): { label: string; variant: 'default' | 'secondary' | 'outline' } {
  if (score === null) return { label: 'Limited', variant: 'outline' }
  if (score >= 70) return { label: 'Strong', variant: 'default' }
  if (score >= 50) return { label: 'Medium–High', variant: 'default' }
  if (score >= 30) return { label: 'Limited–Medium', variant: 'secondary' }
  return { label: 'Limited', variant: 'outline' }
}

/**
 * Count total citations/evidence for an opportunity
 */
function countEvidence(opportunity: any): number {
  let count = 0
  
  // V3: citations array
  if ('citations' in opportunity && Array.isArray(opportunity.citations)) {
    count += opportunity.citations.length
  }
  
  // V3: proof_points with citations
  if ('proof_points' in opportunity && Array.isArray(opportunity.proof_points)) {
    for (const pp of opportunity.proof_points) {
      if (Array.isArray(pp.citations)) {
        count += pp.citations.length
      }
    }
  }
  
  // V2: proof_points with citations
  if ('proof_points' in opportunity && Array.isArray(opportunity.proof_points)) {
    for (const pp of opportunity.proof_points) {
      if (Array.isArray(pp.citations)) {
        count += pp.citations.length
      }
    }
  }
  
  return count
}

/**
 * Generate next steps based on opportunity
 */
function generateNextSteps(
  opportunity: any,
  projectId: string,
  evidenceCount: number
): Array<{ label: string; href: string }> {
  const steps: Array<{ label: string; href: string }> = []
  
  // Always include evidence link
  if (evidenceCount < 5) {
    steps.push({
      label: 'Fetch more evidence',
      href: `/projects/${projectId}/evidence`,
    })
  } else {
    steps.push({
      label: 'Review supporting evidence',
      href: `/projects/${projectId}/evidence`,
    })
  }
  
  // Add competitor validation
  steps.push({
    label: 'Validate with competitor analysis',
    href: `/projects/${projectId}/competitors`,
  })
  
  // Add opportunity-specific actions
  const title = 'title' in opportunity ? opportunity.title : ''
  if (title.toLowerCase().includes('pricing') || title.toLowerCase().includes('cost')) {
    steps.push({
      label: 'Run pricing page scan',
      href: `/projects/${projectId}/evidence?type=pricing`,
    })
  }
  
  if (title.toLowerCase().includes('review') || title.toLowerCase().includes('trust')) {
    steps.push({
      label: 'Check review sentiment',
      href: `/projects/${projectId}/evidence?type=reviews`,
    })
  }
  
  // Generic validation step
  if (steps.length < 4) {
    steps.push({
      label: 'Validate with 8 prospects',
      href: `/projects/${projectId}/opportunities`,
    })
  }
  
  return steps.slice(0, 5)
}

/**
 * Get what could change this decision
 */
function getWhatCouldChange(opportunity: any, score: number | null): string[] {
  const changes: string[] = []
  
  if (score !== null && score < 70) {
    changes.push('If competitor launches similar feature')
  }
  
  if (score !== null && score >= 50 && score < 70) {
    changes.push('If review sentiment shifts on trust factors')
  }
  
  // Check for low evidence
  const evidenceCount = countEvidence(opportunity)
  if (evidenceCount < 5) {
    changes.push('If new evidence reveals stronger alternatives')
  }
  
  // Generic change
  if (changes.length === 0) {
    changes.push('If market conditions shift significantly')
  }
  
  return changes.slice(0, 4)
}

/**
 * Format brief as markdown for export
 */
function formatBriefToMarkdown(props: DecisionBriefProps): string {
  const { opportunitiesV3, opportunitiesV2, generatedAt, projectName, competitorCount } = props
  
  const opportunities = opportunitiesV3?.opportunities ?? opportunitiesV2?.opportunities ?? []
  if (opportunities.length === 0) {
    return '# Decision Brief\n\nNo opportunities available.'
  }
  
  const sorted = [...opportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })
  
  const top1 = sorted[0]
  const score = getOpportunityScore(top1)
  const confidence = getConfidenceRange(score)
  const title = 'title' in top1 ? top1.title : 'Untitled Opportunity'
  const proposed = 'proposed_move' in top1 ? top1.proposed_move : 'pursue this opportunity'
  const whyNow = 'why_now' in top1 ? top1.why_now : 'Market signals indicate timing is favorable'
  
  const lines: string[] = []
  lines.push('# Decision Brief')
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
  if (competitorCount) {
    lines.push(`**Based on:** ${competitorCount} competitors`)
  }
  lines.push('')
  
  lines.push('## Recommended Move')
  lines.push('')
  lines.push(`**${title}**`)
  lines.push('')
  lines.push(`${proposed}`)
  lines.push('')
  
  lines.push('## Why This Matters Now')
  lines.push('')
  lines.push(whyNow)
  lines.push('')
  
  lines.push('## Confidence & Key Risks')
  lines.push('')
  lines.push(`**Confidence:** ${confidence.label}`)
  if (score !== null) {
    lines.push(`**Score:** ${score}/100`)
  }
  lines.push('')
  
  const whatCouldChange = getWhatCouldChange(top1, score)
  if (whatCouldChange.length > 0) {
    lines.push('**What could change this decision:**')
    whatCouldChange.forEach(change => {
      lines.push(`- ${change}`)
    })
    lines.push('')
  }
  
  lines.push('## Next Steps')
  lines.push('')
  const steps = generateNextSteps(top1, props.projectId, countEvidence(top1))
  steps.forEach((step, idx) => {
    lines.push(`${idx + 1}. ${step.label}`)
  })
  lines.push('')
  
  return lines.join('\n')
}

export function DecisionBrief({
  projectId,
  opportunitiesV3,
  opportunitiesV2,
  generatedAt,
  projectName,
  competitorCount = 0,
}: DecisionBriefProps) {
  const opportunities = opportunitiesV3?.opportunities ?? opportunitiesV2?.opportunities ?? []
  
  if (opportunities.length === 0) {
    return (
      <div className="panel p-6 md:p-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Decision Brief</h2>
            <p className="text-xs text-muted-foreground mt-1">
              Generate analysis to view decision brief.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Sort opportunities by score
  const sorted = [...opportunities].sort((a, b) => {
    const scoreA = getOpportunityScore(a) ?? 0
    const scoreB = getOpportunityScore(b) ?? 0
    return scoreB - scoreA
  })

  const top1 = sorted[0]
  const score = getOpportunityScore(top1)
  const confidence = getConfidenceRange(score)
  const evidenceCount = countEvidence(top1)
  
  const title = 'title' in top1 ? top1.title : 'Untitled Opportunity'
  const proposed = 'proposed_move' in top1 ? top1.proposed_move : 'pursue this opportunity'
  const whyNow = 'why_now' in top1 ? top1.why_now : 'Market signals indicate timing is favorable for this opportunity.'
  
  const whatCouldChange = getWhatCouldChange(top1, score)
  const nextSteps = generateNextSteps(top1, projectId, evidenceCount)
  
  // Calculate risk of waiting (renamed from "Cost of Doing Nothing")
  const totalCitations = sorted.reduce((sum, opp) => sum + countEvidence(opp), 0)
  const riskOfWaiting = totalCitations >= 10
    ? 'Delaying action risks ceding ground to competitors and missing a window of market opportunity.'
    : 'While evidence is still developing, market dynamics suggest that waiting may allow competitors to establish stronger positions.'

  const markdownContent = formatBriefToMarkdown({
    projectId,
    opportunitiesV3,
    opportunitiesV2,
    generatedAt,
    projectName,
    competitorCount,
  })

  // Format date
  const formattedDate = generatedAt
    ? new Date(generatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  return (
    <div className="panel p-6 md:p-8 bg-surface-muted/30 border-border">
      {/* Row 1: Header Bar */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b border-border">
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground mb-1">Decision Brief</h2>
          <p className="text-sm text-muted-foreground">
            Based on available public evidence across {competitorCount || 'multiple'} competitor{competitorCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex items-center gap-3 ml-4">
          <div className="text-right">
            <Badge variant={confidence.variant} className="mb-1">
              {confidence.label}
            </Badge>
            {formattedDate && (
              <p className="text-xs text-muted-foreground">Last updated {formattedDate}</p>
            )}
          </div>
          <ShareButton projectId={projectId} />
          <CopySectionButton content={markdownContent} label="Export" />
        </div>
      </div>

      {/* Row 2: Main Content - Two Columns */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column - The Call */}
        <div className="space-y-6">
          {/* A) Recommended Move */}
          <div className="panel p-4 bg-background border-l-4 border-primary">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">
              Recommended move
            </p>
            <h3 className="text-lg font-semibold text-foreground mb-2 leading-tight">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {proposed}
            </p>
          </div>

          {/* B) Why this matters now */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Why this matters now</h4>
            <p className="text-sm text-foreground leading-relaxed mb-2">
              {whyNow}
            </p>
            <Link
              href={`/projects/${projectId}/evidence`}
              className="text-sm font-medium text-primary underline-offset-4 hover:underline inline-flex items-center gap-1"
            >
              View supporting evidence →
            </Link>
          </div>

          {/* C) Next steps */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Next steps</h4>
            <ul className="space-y-2">
              {nextSteps.map((step, idx) => (
                <li key={idx} className="flex items-center justify-between gap-3">
                  <span className="text-sm text-foreground flex-1">{step.label}</span>
                  <Link
                    href={step.href}
                    className="text-sm font-medium text-primary underline-offset-4 hover:underline shrink-0"
                  >
                    Do this →
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Confidence */}
        <div className="space-y-6">
          {/* D) Confidence range */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-3">Confidence</h4>
            <div className="panel-muted p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-foreground">Confidence: {confidence.label}</span>
                {score !== null && (
                  <span className="text-xs text-muted-foreground">{score}/100</span>
                )}
              </div>
              {score !== null && (
                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${score}%` }}
                  />
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Bounded by current evidence coverage
              </p>
            </div>
          </div>

          {/* E) What could change this decision */}
          {whatCouldChange.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">What could change this decision</h4>
              <ul className="space-y-2">
                {whatCouldChange.map((change, idx) => (
                  <li key={idx} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-muted-foreground mt-1">•</span>
                    <span>{change}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* F) Risk of waiting (renamed from Cost of Doing Nothing) */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-2">Risk of waiting</h4>
            <div className="panel-muted p-3">
              <p className="text-sm text-foreground">{riskOfWaiting}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

