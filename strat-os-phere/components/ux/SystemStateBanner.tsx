'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export type SystemState = 'empty' | 'running' | 'partial' | 'complete' | 'failed'

interface SystemStateBannerProps {
  state: SystemState
  title?: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

/**
 * SystemStateBanner - Compact banner that communicates analysis system state
 * 
 * Shows one of: empty, running, partial, complete, failed
 * Calm, enterprise feel with subtle styling that doesn't dominate the page.
 */
export function SystemStateBanner({
  state,
  title,
  description,
  actions,
  className,
}: SystemStateBannerProps) {
  // Default copy for each state
  const defaultCopy = React.useMemo(() => {
    switch (state) {
      case 'empty':
        return {
          title: 'No analysis yet',
          description: 'Add competitors and run an analysis to generate evidence-bound opportunities.',
        }
      case 'running':
        return {
          title: 'Analysis running',
          description: "We're collecting public evidence and generating ranked opportunities.",
        }
      case 'partial':
        return {
          title: 'Partial results',
          description: 'Early signals are available, but evidence coverage is still expanding.',
        }
      case 'complete':
        return {
          title: 'Analysis complete',
          description: 'Opportunities are ranked with citations and confidence.',
        }
      case 'failed':
        return {
          title: 'Analysis failed safely',
          description: 'Your project data is safe. Retry the analysis or adjust inputs.',
        }
    }
  }, [state])

  const finalTitle = title ?? defaultCopy.title
  const finalDescription = description ?? defaultCopy.description

  // Determine styling based on state
  const stateStyles = React.useMemo(() => {
    switch (state) {
      case 'empty':
        return 'border-border bg-muted/30'
      case 'running':
        return 'border-primary/20 bg-primary/5'
      case 'partial':
        return 'border-warning/20 bg-warning/5'
      case 'complete':
        return 'border-success/20 bg-success/5'
      case 'failed':
        return 'border-destructive/20 bg-destructive/5'
    }
  }, [state])

  return (
    <div
      className={cn(
        'rounded-md border p-4',
        stateStyles,
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-1">
          <h3 className="text-sm font-semibold text-foreground">
            {finalTitle}
          </h3>
          {finalDescription && (
            <p className="text-sm text-muted-foreground leading-normal">
              {finalDescription}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex-shrink-0">
            {actions}
          </div>
        )}
      </div>
    </div>
  )
}

