import * as React from 'react'
import { cn } from '@/lib/utils'

export interface InlineCalloutProps {
  children: React.ReactNode
  className?: string
}

/**
 * InlineCallout - Small, non-blocking callout for contextual information
 * 
 * Used for thin evidence warnings, subtle hints, etc.
 * Should be calm and informational, not alarming.
 */
export function InlineCallout({
  children,
  className,
}: InlineCalloutProps) {
  return (
    <div
      className={cn(
        'rounded-lg bg-muted/30 border border-border p-3',
        className
      )}
    >
      <p className="text-sm text-muted-foreground leading-relaxed">
        {children}
      </p>
    </div>
  )
}

