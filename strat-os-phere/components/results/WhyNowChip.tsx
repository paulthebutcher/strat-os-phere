'use client'

import * as React from 'react'
import { Badge } from '@/components/ui/badge'
import type { WhyNowSignal } from '@/lib/results/opportunityUx'
import { CitationList } from '@/components/citations/CitationList'

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
          <CitationList citations={signal.citations} variant="compact" max={3} />
        </div>
      )}
    </div>
  )
}
