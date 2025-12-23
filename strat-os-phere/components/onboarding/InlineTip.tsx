'use client'

import { CheckCircle2, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

interface InlineTipProps {
  isComplete: boolean
  message: string
  completedMessage?: string
  className?: string
}

/**
 * Inline tip that appears beneath form fields and disappears when condition is met.
 * Provides subtle, encouraging guidance without being loud or judgmental.
 */
export function InlineTip({
  isComplete,
  message,
  completedMessage,
  className,
}: InlineTipProps) {
  // Don't render if complete and no completed message
  if (isComplete && !completedMessage) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-start gap-2 text-xs transition-all duration-200',
        isComplete
          ? 'text-green-600 dark:text-green-400'
          : 'text-muted-foreground',
        className
      )}
    >
      {isComplete ? (
        <CheckCircle2 className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      ) : (
        <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0" />
      )}
      <span>{isComplete && completedMessage ? completedMessage : message}</span>
    </div>
  )
}

