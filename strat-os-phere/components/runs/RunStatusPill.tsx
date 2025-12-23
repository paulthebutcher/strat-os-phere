'use client'

import { cn } from '@/lib/utils'

export type RunStatus = 'idle' | 'queued' | 'running' | 'succeeded' | 'failed' | 'unknown'

interface RunStatusPillProps {
  status: RunStatus
  lastUpdatedAt?: string
  className?: string
}

const STATUS_CONFIG: Record<
  RunStatus,
  { label: string; className: string }
> = {
  idle: {
    label: 'Idle',
    className: 'bg-muted text-muted-foreground',
  },
  queued: {
    label: 'Queued',
    className: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  },
  running: {
    label: 'Running',
    className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  },
  succeeded: {
    label: 'Complete',
    className: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  },
  failed: {
    label: 'Failed',
    className: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  },
  unknown: {
    label: 'Unknown',
    className: 'bg-muted text-muted-foreground',
  },
}

export function RunStatusPill({
  status,
  lastUpdatedAt,
  className,
}: RunStatusPillProps) {
  const config = STATUS_CONFIG[status]

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
          config.className
        )}
      >
        {config.label}
      </span>
      {lastUpdatedAt && (
        <span className="text-xs text-muted-foreground">
          {new Date(lastUpdatedAt).toLocaleTimeString()}
        </span>
      )}
    </div>
  )
}

