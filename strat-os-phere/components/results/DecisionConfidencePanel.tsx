import { Clock } from 'lucide-react'
import { DecisionConfidenceBadge } from './DecisionConfidenceBadge'
import type { DecisionConfidence } from '@/lib/ui/decisionConfidence'

interface DecisionConfidencePanelProps {
  confidence: DecisionConfidence
  className?: string
}

/**
 * Panel component showing detailed confidence information for a single opportunity
 * Displays confidence badge, reasons, and evidence recency
 */
export function DecisionConfidencePanel({
  confidence,
  className,
}: DecisionConfidencePanelProps) {
  return (
    <div className={`rounded-md bg-muted/30 border border-border p-4 space-y-3 ${className || ''}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Decision confidence
        </span>
        <DecisionConfidenceBadge level={confidence.level} />
      </div>

      {/* Confidence reasons */}
      {confidence.reasons.length > 0 && (
        <div className="space-y-1.5">
          {confidence.reasons.slice(0, 4).map((reason, index) => (
            <div
              key={index}
              className="flex items-start gap-2 text-sm text-muted-foreground"
            >
              <span className="text-primary mt-0.5">·</span>
              <span>{reason}</span>
            </div>
          ))}
        </div>
      )}

      {/* Evidence recency */}
      {confidence.evidenceRecency && (
        <div className="flex items-center gap-2 pt-2 border-t border-border text-xs text-muted-foreground">
          <Clock className="h-3 w-3 shrink-0" />
          <span>Most recent signal: {confidence.evidenceRecency}</span>
        </div>
      )}
    </div>
  )
}

