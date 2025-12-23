'use client'

import { SectionCard } from '@/components/results/SectionCard'

interface EmptyEvidenceStateProps {
  className?: string
}

export function EmptyEvidenceState({ className }: EmptyEvidenceStateProps) {
  return (
    <SectionCard className={className}>
      <div className="text-center py-8">
        <h3 className="text-base font-semibold text-foreground mb-2">
          No evidence captured yet for this analysis.
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Re-run evidence collection to populate sources.
        </p>
      </div>
    </SectionCard>
  )
}

