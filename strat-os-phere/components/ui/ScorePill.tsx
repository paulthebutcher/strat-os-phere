'use client'

import { Badge } from '@/components/ui/badge'
import type { ComputedScore } from '@/lib/scoring/types'
import { cn } from '@/lib/utils'
import { gateScore, type DirectionalSignal } from '@/lib/scoring/evidenceGating'
import type { CitationInput } from '@/lib/scoring/extractEvidenceFromArtifacts'
import { microcopy } from '@/lib/copy/microcopy'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info } from 'lucide-react'

interface ScorePillProps {
  score: ComputedScore
  citations?: CitationInput[]
  className?: string
  showTooltip?: boolean
}

/**
 * Maps directional signal to badge variant
 */
function getDirectionalVariant(directional: DirectionalSignal): 'default' | 'secondary' {
  switch (directional) {
    case 'strong':
      return 'default'
    case 'mixed':
      return 'secondary'
    case 'weak':
      return 'secondary'
    case 'unclear':
      return 'secondary'
  }
}

/**
 * Gets display label for directional signal
 */
function getDirectionalLabel(directional: DirectionalSignal): string {
  switch (directional) {
    case 'strong':
      return 'Strong'
    case 'mixed':
      return 'Mixed'
    case 'weak':
      return 'Weak'
    case 'unclear':
      return 'Unclear'
  }
}

/**
 * Gets coverage message for tooltip
 */
function getCoverageMessage(coverage: 'complete' | 'partial' | 'insufficient'): string {
  switch (coverage) {
    case 'complete':
      return 'Good evidence coverage'
    case 'partial':
      return 'Partial evidence'
    case 'insufficient':
      return 'Low evidence'
  }
}

/**
 * ScorePill component for displaying scores with proper states
 * 
 * Now respects evidence gating:
 * - Shows numeric scores (X.X/10) only when coverage is complete AND confidence is moderate/high
 * - Otherwise shows directional labels (Strong/Mixed/Weak/Unclear) with evidence caveat
 */
export function ScorePill({ score, citations = [], className, showTooltip = false }: ScorePillProps) {
  // If no citations provided, try to construct from ComputedScore metadata
  // This maintains backward compatibility
  const citationInputs: CitationInput[] = citations.length > 0
    ? citations
    : score.evidenceCount > 0
    ? Array.from({ length: score.evidenceCount }, (_, i) => ({
        url: `placeholder-${i}`, // Placeholder since we don't have actual URLs
        sourceType: score.sourceTypes[i % score.sourceTypes.length] || 'other',
        date: score.newestEvidenceAt || undefined,
      }))
    : []

  // Gate the score
  const gated = gateScore(score.value, citationInputs)

  // If unscored or no value, show N/A
  if (score.status === 'unscored' || (score.value === null && !gated.showNumeric)) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <Badge variant="secondary" className="text-xs">
          N/A
        </Badge>
        {showTooltip && (
          <span className="text-xs text-muted-foreground">
            {microcopy.emptyStates.notEnoughEvidenceYet}
          </span>
        )}
      </div>
    )
  }

  // If we should show numeric score
  if (gated.showNumeric && gated.score !== null) {
    const value = gated.score
    let variant: 'default' | 'secondary' = 'secondary'
    let tooltipText = ''

    if (value >= 8) {
      variant = 'default' // High score - use primary/default variant
      tooltipText = `High score (${value.toFixed(1)}/10) based on ${score.evidenceCount} evidence source${score.evidenceCount !== 1 ? 's' : ''}. Strong confidence in this assessment.`
    } else if (value >= 5) {
      variant = 'secondary' // Medium score - use secondary variant
      tooltipText = `Moderate score (${value.toFixed(1)}/10) based on ${score.evidenceCount} evidence source${score.evidenceCount !== 1 ? 's' : ''}. Directional signal requiring validation.`
    } else {
      variant = 'secondary' // Low score - use secondary variant
      tooltipText = `Lower score (${value.toFixed(1)}/10) based on ${score.evidenceCount} evidence source${score.evidenceCount !== 1 ? 's' : ''}. Needs more evidence to validate.`
    }

    const badgeContent = (
      <Badge variant={variant} className="text-xs">
        {value.toFixed(1)}/10
      </Badge>
    )

    if (showTooltip) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={cn('flex items-center gap-2 cursor-help', className)}>
                {badgeContent}
                <Info className="h-3 w-3 text-muted-foreground" />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs max-w-xs">{tooltipText}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )
    }

    return (
      <div className={cn('flex items-center gap-2', className)}>
        {badgeContent}
        {score.evidenceCount > 0 && (
          <span className="text-xs text-muted-foreground">
            {score.evidenceCount} citation{score.evidenceCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    )
  }

  // Otherwise show directional label
  const directionalVariant = getDirectionalVariant(gated.directional)
  const directionalLabel = getDirectionalLabel(gated.directional)
  const coverageMessage = getCoverageMessage(gated.coverage)

  const tooltipText = `${directionalLabel} signal. ${coverageMessage}. ${score.evidenceCount > 0 ? `Based on ${score.evidenceCount} evidence source${score.evidenceCount !== 1 ? 's' : ''}.` : 'More evidence needed for numeric scoring.'}`

  const badgeContent = (
    <Badge variant={directionalVariant} className="text-xs">
      {directionalLabel}
    </Badge>
  )

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn('flex items-center gap-2 cursor-help', className)}>
              {badgeContent}
              <Info className="h-3 w-3 text-muted-foreground" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="text-xs max-w-xs">{tooltipText}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      {badgeContent}
      <span className="text-xs text-muted-foreground">
        {coverageMessage}
      </span>
    </div>
  )
}

