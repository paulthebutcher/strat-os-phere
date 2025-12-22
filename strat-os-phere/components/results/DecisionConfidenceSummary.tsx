'use client'

import { useState } from 'react'
import { Info, ChevronDown } from 'lucide-react'
import { DecisionConfidenceBadge } from './DecisionConfidenceBadge'
import { cn } from '@/lib/utils'
import type { DecisionConfidenceLevel } from '@/lib/ui/decisionConfidence'

interface DecisionConfidenceSummaryProps {
  overallLevel: DecisionConfidenceLevel
  totalEvidenceCount: number
  sourceTypes: Set<string>
  averageRecency: string | null
  className?: string
}

/**
 * Summary component showing overall confidence across all opportunities
 * Appears once above the Opportunities list
 */
export function DecisionConfidenceSummary({
  overallLevel,
  totalEvidenceCount,
  sourceTypes,
  averageRecency,
  className,
}: DecisionConfidenceSummaryProps) {
  const [showDetails, setShowDetails] = useState(false)

  const sourceTypeLabels = Array.from(sourceTypes)
    .map((st) => st.replace(/_/g, ' '))
    .join(', ')

  // Build executive-friendly description
  let evidenceDescription = 'Limited evidence available'
  if (totalEvidenceCount > 0 && sourceTypes.size > 0) {
    const parts: string[] = []
    parts.push(`${totalEvidenceCount} source${totalEvidenceCount !== 1 ? 's' : ''}`)
    if (sourceTypes.size > 0) {
      parts.push(`across ${sourceTypeLabels}`)
    }
    if (averageRecency) {
      parts.push(averageRecency.includes('last 90 days') ? 'in the last 90 days' : `most recent: ${averageRecency}`)
    }
    evidenceDescription = parts.join(', ')
  }

  return (
    <div className={cn('rounded-lg bg-muted/50 border border-border p-4 space-y-3', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-sm font-medium text-foreground">
              Overall confidence:
            </span>
            <DecisionConfidenceBadge level={overallLevel} />
          </div>
          <p className="text-sm text-muted-foreground">
            {evidenceDescription !== 'Limited evidence available'
              ? `Based on ${evidenceDescription}`
              : evidenceDescription}
          </p>
        </div>
      </div>

      {/* Expandable details */}
      <button
        type="button"
        onClick={() => setShowDetails(!showDetails)}
        className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
      >
        <ChevronDown
          className={cn(
            'h-3 w-3 transition-transform',
            showDetails && 'rotate-180'
          )}
        />
        <span>How this is calculated</span>
      </button>

      {showDetails && (
        <div className="pt-2 border-t border-border space-y-2 text-xs text-muted-foreground">
          <p>
            Confidence reflects evidence quality, source diversity, signal recency, and score breakdowns. Higher confidence indicates stronger external validation.
          </p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>
              <strong>High confidence:</strong> Strong external evidence with recent, diverse sources
            </li>
            <li>
              <strong>Moderate confidence:</strong> Good evidence base with some signals
            </li>
            <li>
              <strong>Exploratory:</strong> Early signal, worth validating
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}

