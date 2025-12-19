'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface InlineErrorProps {
  message: string
  details?: Record<string, unknown>
  className?: string
}

export function InlineError({ message, details, className }: InlineErrorProps) {
  const [showDetails, setShowDetails] = useState(false)

  const hasDetails = details && Object.keys(details).length > 0

  return (
    <div
      className={cn(
        'panel border-destructive/20 bg-destructive/5 px-4 py-3 text-sm',
        className
      )}
      role="alert"
    >
      <p className="text-destructive">{message}</p>
      {hasDetails && (
        <div className="mt-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-text-secondary underline-offset-4 hover:underline"
          >
            {showDetails ? 'Hide' : 'Show'} debug details
          </button>
          {showDetails && (
            <pre className="mt-2 overflow-auto rounded border border-border-subtlebg-background p-2 text-xs text-text-secondary">
              {JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}

