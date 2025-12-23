'use client'

import { SectionCard } from '@/components/results/SectionCard'
import { EvidenceCoverageSummary } from './EvidenceCoverageSummary'
import { EvidenceLedger } from './EvidenceLedger'
import { EvidenceEmptyState } from './EvidenceEmptyState'
import type { EvidenceLedgerModel } from '@/lib/evidence/ledger'

interface EvidenceLedgerSectionProps {
  model: EvidenceLedgerModel | null
  className?: string
}

/**
 * Evidence Ledger Section
 * Main component that combines coverage summary and ledger
 */
export function EvidenceLedgerSection({
  model,
  className,
}: EvidenceLedgerSectionProps) {
  if (!model || model.groups.length === 0) {
    return <EvidenceEmptyState className={className} />
  }

  return (
    <SectionCard className={className}>
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Evidence
          </h2>
          <p className="text-sm text-muted-foreground">
            Sources collected across pricing, docs, changelogs, and reviews.
            Click any item to verify.
          </p>
        </div>

        <EvidenceCoverageSummary model={model} />
        <EvidenceLedger model={model} />
      </div>
    </SectionCard>
  )
}

