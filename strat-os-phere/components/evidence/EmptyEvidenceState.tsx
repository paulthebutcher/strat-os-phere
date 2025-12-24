'use client'

import { SectionCard } from '@/components/results/SectionCard'
import { microcopy } from '@/lib/copy/microcopy'

interface EmptyEvidenceStateProps {
  className?: string
}

export function EmptyEvidenceState({ className }: EmptyEvidenceStateProps) {
  return (
    <SectionCard className={className}>
      <div className="text-center py-8">
        <h3 className="text-base font-semibold text-foreground mb-2">
          {microcopy.emptyStates.noEvidenceCaptured.title}
        </h3>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          {microcopy.emptyStates.noEvidenceCaptured.description}
        </p>
      </div>
    </SectionCard>
  )
}

