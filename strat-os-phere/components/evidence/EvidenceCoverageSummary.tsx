'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { EvidenceLedgerModel } from '@/lib/evidence/ledger'

interface EvidenceCoverageSummaryProps {
  model: EvidenceLedgerModel
  className?: string
}

/**
 * Evidence Coverage Summary
 * Shows which evidence types were found vs missing
 */
export function EvidenceCoverageSummary({
  model,
  className,
}: EvidenceCoverageSummaryProps) {
  return (
    <div className={cn('space-y-3', className)}>
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          Coverage
        </h3>
      </div>

      <div className="flex flex-wrap gap-2">
        {model.coverage.found.map((type) => (
          <Badge
            key={type}
            variant="success"
            className="text-xs font-medium"
          >
            {type} ({model.totals.byType[type]})
          </Badge>
        ))}
        {model.coverage.missing.map((type) => (
          <Badge
            key={type}
            variant="muted"
            className="text-xs font-medium opacity-60"
          >
            {type}
          </Badge>
        ))}
      </div>
    </div>
  )
}

