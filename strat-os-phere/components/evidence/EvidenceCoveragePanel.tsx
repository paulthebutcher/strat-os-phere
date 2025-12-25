'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight, ExternalLink, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EvidenceCoverageModel } from '@/lib/evidence'
import type { ReadinessEvaluation } from '@/lib/evidence/readiness'
import Link from 'next/link'
import { paths } from '@/lib/routes'

interface EvidenceCoveragePanelProps {
  coverage: EvidenceCoverageModel
  readiness: ReadinessEvaluation
  projectId: string
  className?: string
}

/**
 * Evidence Coverage Panel
 * Shows evidence coverage metrics and readiness status
 */
export function EvidenceCoveragePanel({
  coverage,
  readiness,
  projectId,
  className,
}: EvidenceCoveragePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedCompetitor, setExpandedCompetitor] = useState<string | null>(null)

  const {
    byCompetitor,
    totalsByType,
    competitorsWithAnyEvidence,
    typesCoveredCount,
    totalSources,
  } = coverage

  const { MIN_COMPETITORS_WITH_EVIDENCE, MIN_EVIDENCE_TYPES_COVERED } = {
    MIN_COMPETITORS_WITH_EVIDENCE: 3,
    MIN_EVIDENCE_TYPES_COVERED: 3,
  }

  // Get all evidence types for display
  const allTypes = [
    'marketing_site',
    'pricing',
    'docs',
    'changelog',
    'reviews',
    'jobs',
    'status',
  ] as const

  // Format type name for display
  const formatTypeName = (type: string): string => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  return (
    <div className={cn('panel p-6', className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            Evidence coverage
          </h3>
          <p className="text-sm text-muted-foreground">
            {readiness.isReady ? (
              <span className="text-success">Ready to generate analysis</span>
            ) : (
              <span>Evidence coverage is too thin to generate a credible analysis.</span>
            )}
          </p>
        </div>
        {!readiness.isReady && (
          <Button
            asChild
            variant="outline"
            size="sm"
            className="shrink-0"
          >
            <Link href={paths.competitors(projectId)}>
              Collect more evidence
            </Link>
          </Button>
        )}
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4 mb-4 pb-4 border-b border-border">
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Competitors with evidence
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-foreground">
              {competitorsWithAnyEvidence}
            </span>
            <span className="text-sm text-muted-foreground">
              / {MIN_COMPETITORS_WITH_EVIDENCE}
            </span>
            {competitorsWithAnyEvidence >= MIN_COMPETITORS_WITH_EVIDENCE ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Evidence types covered
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-semibold text-foreground">
              {typesCoveredCount}
            </span>
            <span className="text-sm text-muted-foreground">
              / {MIN_EVIDENCE_TYPES_COVERED}
            </span>
            {typesCoveredCount >= MIN_EVIDENCE_TYPES_COVERED ? (
              <Check className="h-4 w-4 text-success" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </div>
        <div>
          <div className="text-xs text-muted-foreground mb-1">
            Total sources
          </div>
          <div className="text-lg font-semibold text-foreground">
            {totalSources}
          </div>
        </div>
      </div>

      {/* Reasons if not ready */}
      {!readiness.isReady && readiness.reasons.length > 0 && (
        <div className="mb-4 p-3 bg-muted rounded-md">
          <div className="text-sm font-medium text-foreground mb-1">
            Missing requirements:
          </div>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            {readiness.reasons.map((reason, idx) => (
              <li key={idx}>{reason}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Expandable table */}
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          <span>View details by competitor</span>
        </button>

        {isExpanded && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-4 font-medium text-foreground">
                    Competitor
                  </th>
                  {allTypes.map((type) => (
                    <th
                      key={type}
                      className="text-center py-2 px-2 font-medium text-muted-foreground"
                    >
                      {formatTypeName(type)}
                    </th>
                  ))}
                  <th className="text-right py-2 pl-4 font-medium text-foreground">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {byCompetitor.length === 0 ? (
                  <tr>
                    <td
                      colSpan={allTypes.length + 2}
                      className="py-8 text-center text-muted-foreground"
                    >
                      No evidence sources found
                    </td>
                  </tr>
                ) : (
                  byCompetitor.map((competitor) => (
                    <tr
                      key={competitor.competitorId ?? 'null'}
                      className="border-b border-border last:border-0"
                    >
                      <td className="py-2 pr-4">
                        <div className="flex items-center gap-2">
                          {competitor.competitorId ? (
                            <button
                              onClick={() =>
                                setExpandedCompetitor(
                                  expandedCompetitor === competitor.competitorId
                                    ? null
                                    : competitor.competitorId!
                                )
                              }
                              className="flex items-center gap-1 text-foreground hover:text-primary"
                            >
                              {expandedCompetitor === competitor.competitorId ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                              <span>{competitor.competitorName ?? 'Unknown'}</span>
                            </button>
                          ) : (
                            <span className="text-muted-foreground">
                              Market-wide
                            </span>
                          )}
                        </div>
                      </td>
                      {allTypes.map((type) => {
                        const count = competitor.countsByType[type] ?? 0
                        return (
                          <td
                            key={type}
                            className="text-center py-2 px-2"
                          >
                            {count > 0 ? (
                              <Badge variant="success" className="text-xs">
                                {count}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="text-right py-2 pl-4 font-medium text-foreground">
                        {competitor.totalSources}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Evidence list for expanded competitor */}
      {expandedCompetitor && (
        <div className="mt-4 p-4 bg-muted rounded-md">
          <div className="text-sm font-medium text-foreground mb-2">
            Evidence sources
          </div>
          <div className="text-xs text-muted-foreground">
            Evidence detail view coming soon. Navigate to the Evidence tab to see
            all sources.
          </div>
        </div>
      )}
    </div>
  )
}

