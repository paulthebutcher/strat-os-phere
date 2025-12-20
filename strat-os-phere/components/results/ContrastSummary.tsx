'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { ContrastSummary } from '@/lib/results/diffHelpers'
import { countTotalChanges } from '@/lib/results/diffHelpers'
import { cn } from '@/lib/utils'

interface ContrastSummaryProps {
  summary: ContrastSummary
  latestRunDate: string | null
  previousRunDate: string | null
}

export function ContrastSummary({
  summary,
  latestRunDate,
  previousRunDate,
}: ContrastSummaryProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const totalChanges = countTotalChanges(summary)

  if (!summary.hasChanges) {
    return null
  }

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return 'Unknown'
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="panel border-l-4 border-l-primary bg-muted/30 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-foreground">
              What changed since last run
            </h3>
            <Badge variant="primary" className="text-xs">
              {totalChanges} change{totalChanges !== 1 ? 's' : ''}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Comparing {formatDate(latestRunDate)} with {formatDate(previousRunDate)}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-8 px-2"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </Button>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-4 border-t border-border pt-4">
          {/* JTBD Changes */}
          {summary.jtbd &&
            (summary.jtbd.added.length > 0 ||
              summary.jtbd.removed.length > 0 ||
              summary.jtbd.rankChanges.length > 0) && (
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Jobs To Be Done
                </h4>
                <div className="space-y-2 text-sm">
                  {summary.jtbd.added.length > 0 && (
                    <div>
                      <span className="font-medium text-success">
                        +{summary.jtbd.added.length} job{summary.jtbd.added.length !== 1 ? 's' : ''} added:
                      </span>
                      <ul className="mt-1 ml-4 list-disc space-y-1 text-xs">
                        {summary.jtbd.added.map((job, idx) => (
                          <li key={idx} className="text-foreground">
                            {job.job_statement}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {summary.jtbd.removed.length > 0 && (
                    <div>
                      <span className="font-medium text-destructive">
                        -{summary.jtbd.removed.length} job{summary.jtbd.removed.length !== 1 ? 's' : ''} removed
                      </span>
                    </div>
                  )}
                  {summary.jtbd.rankChanges.length > 0 && (
                    <div>
                      <span className="font-medium text-muted-foreground">
                        {summary.jtbd.rankChanges.length} rank change{summary.jtbd.rankChanges.length !== 1 ? 's' : ''}:
                      </span>
                      <ul className="mt-1 ml-4 list-disc space-y-1 text-xs">
                        {summary.jtbd.rankChanges.map((change, idx) => (
                          <li key={idx} className="text-foreground">
                            {change.job.job_statement} (#{change.oldRank} → #{change.newRank})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

          {/* Opportunities Changes */}
          {summary.opportunities &&
            (summary.opportunities.added.length > 0 ||
              summary.opportunities.removed.length > 0 ||
              summary.opportunities.scoreChanges.length > 0) && (
              <section>
                <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Opportunities
                </h4>
                <div className="space-y-2 text-sm">
                  {summary.opportunities.added.length > 0 && (
                    <div>
                      <span className="font-medium text-success">
                        +{summary.opportunities.added.length} opportunit{summary.opportunities.added.length !== 1 ? 'ies' : 'y'} added:
                      </span>
                      <ul className="mt-1 ml-4 list-disc space-y-1 text-xs">
                        {summary.opportunities.added.map((opp, idx) => (
                          <li key={idx} className="text-foreground">
                            {opp.title} (Score: {opp.score}/100)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {summary.opportunities.removed.length > 0 && (
                    <div>
                      <span className="font-medium text-destructive">
                        -{summary.opportunities.removed.length} opportunit{summary.opportunities.removed.length !== 1 ? 'ies' : 'y'} removed
                      </span>
                    </div>
                  )}
                  {summary.opportunities.scoreChanges.length > 0 && (
                    <div>
                      <span className="font-medium text-muted-foreground">
                        {summary.opportunities.scoreChanges.length} score change{summary.opportunities.scoreChanges.length !== 1 ? 's' : ''} (±10+):
                      </span>
                      <ul className="mt-1 ml-4 list-disc space-y-1 text-xs">
                        {summary.opportunities.scoreChanges.map((change, idx) => (
                          <li key={idx} className="text-foreground">
                            {change.opportunity.title}: {change.oldScore} → {change.newScore} (
                            {change.delta > 0 ? '+' : ''}
                            {change.delta})
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </section>
            )}

          {/* Scorecard Changes */}
          {summary.scorecard && summary.scorecard.scoreChanges.length > 0 && (
            <section>
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Scorecard
              </h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium text-muted-foreground">
                    {summary.scorecard.scoreChanges.length} competitor score change{summary.scorecard.scoreChanges.length !== 1 ? 's' : ''} (±10+):
                  </span>
                  <ul className="mt-1 ml-4 list-disc space-y-1 text-xs">
                    {summary.scorecard.scoreChanges.map((change, idx) => (
                      <li key={idx} className="text-foreground">
                        {change.competitor}: {change.oldScore.toFixed(1)} → {change.newScore.toFixed(1)} (
                        {change.delta > 0 ? '+' : ''}
                        {change.delta.toFixed(1)})
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

