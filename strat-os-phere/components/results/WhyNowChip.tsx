'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import type { WhyNowSignal } from '@/lib/results/opportunityUx'

interface WhyNowChipProps {
  signal: WhyNowSignal
}

export function WhyNowChip({ signal }: WhyNowChipProps) {
  const [showCitations, setShowCitations] = React.useState(false)

  if (!signal.citations || signal.citations.length === 0) {
    return (
      <Badge variant="secondary" className="text-xs">
        {signal.label}
      </Badge>
    )
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setShowCitations(!showCitations)}
        className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        aria-expanded={showCitations}
        aria-label={`${signal.label} - View sources`}
      >
        <Badge variant="secondary" className="text-xs cursor-pointer hover:bg-secondary/80">
          {signal.label}
        </Badge>
      </button>
      {showCitations && (
        <div className="absolute z-10 mt-2 p-3 bg-popover border border-border rounded-lg shadow-lg min-w-[200px] max-w-[300px]">
          <p className="text-xs font-semibold text-foreground mb-2">Sources:</p>
          <ul className="space-y-1">
            {signal.citations.slice(0, 3).map((citation, index) => {
              let displayText = citation.title || citation.hostname
              if (!displayText && citation.url) {
                try {
                  displayText = new URL(citation.url).hostname
                } catch {
                  displayText = citation.url
                }
              }
              return (
                <li key={index} className="text-xs">
                  <a
                    href={citation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
                  >
                    {displayText || 'View source'}
                  </a>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

