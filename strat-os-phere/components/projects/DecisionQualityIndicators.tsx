'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Check, X, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import type { EvidenceCoverageLite } from '@/lib/evidence/coverageLite'
import { MIN_COMPETITORS } from '@/lib/evidence/coverageLite'

interface DecisionQualityIndicatorsProps {
  competitorCount: number
  coverage: EvidenceCoverageLite
  hasOpportunitiesArtifact: boolean
  projectId: string
  defaultCollapsed?: boolean
}

/**
 * Decision Quality Indicators - Collapsed by default
 * Renamed from Readiness Checklist to reflect decision quality focus
 */
export function DecisionQualityIndicators({
  competitorCount,
  coverage,
  hasOpportunitiesArtifact,
  projectId,
  defaultCollapsed = true,
}: DecisionQualityIndicatorsProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed)

  // Item A: Competitors added
  const hasEnoughCompetitors = competitorCount >= MIN_COMPETITORS
  const competitorsItem = {
    id: 'competitors',
    label: 'Competitors added',
    status: hasEnoughCompetitors ? ('complete' as const) : ('incomplete' as const),
    details: `${competitorCount}/${MIN_COMPETITORS} competitors added`,
    fixHref: hasEnoughCompetitors ? undefined : '/competitors',
  }

  // Item B: Evidence coverage sufficient
  const evidenceItem = {
    id: 'evidence',
    label: 'Evidence coverage sufficient',
    status: coverage.isEvidenceSufficient ? ('complete' as const) : ('incomplete' as const),
    details: coverage.isEvidenceSufficient
      ? `${coverage.evidenceTypesPresent.length} evidence types across ${coverage.competitorIdsWithEvidence.length} competitors`
      : coverage.reasonsMissing.slice(0, 2).join(' '), // Max 2 lines
    fixHref: coverage.isEvidenceSufficient ? undefined : '/evidence',
  }

  // Item C: Opportunities generated
  const opportunitiesItem = {
    id: 'opportunities',
    label: 'Opportunities generated',
    status: hasOpportunitiesArtifact
      ? ('complete' as const)
      : coverage.isEvidenceSufficient
      ? ('incomplete' as const)
      : ('incomplete' as const),
    details: hasOpportunitiesArtifact
      ? 'Ranked opportunities are available'
      : 'Generate ranked opportunities once evidence is sufficient.',
    fixHref: hasOpportunitiesArtifact
      ? undefined
      : coverage.isEvidenceSufficient
      ? '/opportunities'
      : undefined,
  }

  const items = [competitorsItem, evidenceItem, opportunitiesItem]
  const allComplete = items.every(item => item.status === 'complete')

  return (
    <div id="decision-quality-indicators" className="bg-card border border-border rounded-md">
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <h3 className="text-base font-semibold text-foreground">
            Decision Quality Indicators
          </h3>
          {allComplete && (
            <Badge variant="secondary" className="text-xs">
              Complete
            </Badge>
          )}
        </div>
        {isCollapsed ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronUp className="h-4 w-4 text-muted-foreground" />
        )}
      </button>

      {!isCollapsed && (
        <div className="px-4 pb-4">
          <ul className="space-y-3">
            {items.map((item) => {
              const isComplete = item.status === 'complete'
              const fixHref = item.fixHref
                ? item.fixHref.startsWith('/')
                  ? `/projects/${projectId}${item.fixHref}`
                  : item.fixHref
                : undefined

              // Use AlertCircle (⚠️) for incomplete evidence items that aren't errors
              const showWarningIcon = !isComplete && item.id === 'evidence'
              const showCheckIcon = isComplete
              const showXIcon = !isComplete && !showWarningIcon

              return (
                <li
                  key={item.id}
                  className={cn(
                    'flex items-start gap-3',
                    !isComplete && 'text-muted-foreground'
                  )}
                >
                  {/* Status icon */}
                  <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center">
                    {showCheckIcon ? (
                      <Check className="h-5 w-5 text-success" />
                    ) : showWarningIcon ? (
                      <AlertCircle className="h-5 w-5 text-muted-foreground" />
                    ) : (
                      <X className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p
                          className={cn(
                            'text-sm',
                            isComplete ? 'font-medium text-foreground' : 'text-muted-foreground'
                          )}
                        >
                          {item.label}
                        </p>
                        {item.details && (
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.details}
                          </p>
                        )}
                      </div>
                      {fixHref && !isComplete && (
                        <Link
                          href={fixHref}
                          className="text-xs font-medium text-primary underline-offset-4 hover:underline shrink-0"
                        >
                          Fix
                        </Link>
                      )}
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

