'use client'

import { cn } from '@/lib/utils'

interface InlineStatusPanelProps {
  phase: 'starting' | 'analyzing' | 'synthesizing' | 'finalizing'
  currentCompetitor?: number
  totalCompetitors?: number
  onCancel?: () => void
  className?: string
}

export function InlineStatusPanel({
  phase,
  currentCompetitor,
  totalCompetitors,
  onCancel,
  className,
}: InlineStatusPanelProps) {
  const getPhaseMessage = () => {
    switch (phase) {
      case 'starting':
        return 'Starting analysis...'
      case 'analyzing':
        if (currentCompetitor && totalCompetitors) {
          return `Analyzing competitor ${currentCompetitor}/${totalCompetitors}...`
        }
        return 'Analyzing competitors...'
      case 'synthesizing':
        return 'Synthesizing market themes...'
      case 'finalizing':
        return 'Saving results...'
      default:
        return 'Processing...'
    }
  }

  return (
    <div
      className={cn(
        'panel flex items-center gap-3 px-4 py-3 text-sm',
        className
      )}
    >
      <div className="flex-shrink-0">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
      <div className="flex-1">
        <p className="text-foreground">{getPhaseMessage()}</p>
      </div>
      {onCancel && (
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-text-secondary underline-offset-4 hover:underline"
        >
          Cancel
        </button>
      )}
    </div>
  )
}

