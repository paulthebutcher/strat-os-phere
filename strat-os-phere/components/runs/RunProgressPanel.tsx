'use client'

import { Button } from '@/components/ui/button'
import { RunStatusPill, type RunStatus } from './RunStatusPill'
import { RefreshCw, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Step {
  label: string
  completed: boolean
}

interface RunProgressPanelProps {
  status: RunStatus
  message?: string
  steps?: Step[]
  onRetry?: () => void
  onViewDetails?: () => void
  className?: string
}

const STATUS_MESSAGES: Record<RunStatus, string> = {
  idle: 'Ready to start',
  queued: 'Analysis queued',
  running: 'Analysis running',
  succeeded: 'Analysis complete',
  failed: 'Analysis failed',
  unknown: 'Status unknown',
}

export function RunProgressPanel({
  status,
  message,
  steps,
  onRetry,
  onViewDetails,
  className,
}: RunProgressPanelProps) {
  const displayMessage = message || STATUS_MESSAGES[status]
  const isComplete = status === 'succeeded'
  const isFailed = status === 'failed'
  const isActive = status === 'queued' || status === 'running'

  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-background p-4 shadow-sm',
        className
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h3 className="text-sm font-semibold text-foreground">
              {status === 'running' || status === 'queued'
                ? 'Analysis in progress'
                : status === 'succeeded'
                  ? 'Analysis complete'
                  : status === 'failed'
                    ? 'Analysis failed'
                    : 'Analysis status'}
            </h3>
            <RunStatusPill status={status} />
          </div>
          {displayMessage && (
            <p className="text-sm text-muted-foreground">{displayMessage}</p>
          )}
        </div>
      </div>

      {steps && steps.length > 0 && (
        <div className="mb-4 space-y-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex items-center gap-2 text-sm"
            >
              <div
                className={cn(
                  'h-1.5 w-1.5 rounded-full',
                  step.completed
                    ? 'bg-green-600'
                    : isActive
                      ? 'bg-yellow-500'
                      : 'bg-muted'
                )}
              />
              <span
                className={cn(
                  step.completed
                    ? 'text-foreground'
                    : isActive
                      ? 'text-muted-foreground'
                      : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {(isFailed || isComplete) && (
        <div className="flex items-center gap-2">
          {isFailed && onRetry && (
            <Button
              variant="default"
              size="sm"
              onClick={onRetry}
            >
              <RefreshCw className="h-3 w-3 mr-1.5" />
              Retry
            </Button>
          )}
          {onViewDetails && (
            <Button
              variant="outline"
              size="sm"
              onClick={onViewDetails}
            >
              {isComplete ? (
                <>
                  View results
                  <ExternalLink className="h-3 w-3 ml-1.5" />
                </>
              ) : (
                'View details'
              )}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

