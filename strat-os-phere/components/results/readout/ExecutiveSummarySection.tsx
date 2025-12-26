'use client'

import { SectionCard } from '@/components/results/SectionCard'
import { EditorialReveal } from '@/components/ui/EditorialReveal'
import { PlinthIconDirect } from '@/components/ui/PlinthIcon'

interface ExecutiveSummarySectionProps {
  bullets: string[]
}

/**
 * Executive Summary Section - 5-7 bullet executive summary
 */
export function ExecutiveSummarySection({
  bullets,
}: ExecutiveSummarySectionProps) {
  if (bullets.length === 0) {
    return (
      <section className="space-y-4">
        <h2 className="readout-h1">Executive Summary</h2>
        <SectionCard className="py-12">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Executive summary will appear here after analysis is generated.
            </p>
          </div>
        </SectionCard>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="readout-h1 flex items-center gap-2">
          <PlinthIconDirect name="readout" size={22} className="text-foreground/70" />
          Executive Summary
        </h2>
        <p className="mt-2 readout-label">
          Key insights from the competitive analysis
        </p>
      </div>
      <EditorialReveal>
        <SectionCard>
        <ul className="space-y-3">
          {bullets.map((bullet, index) => (
            <li key={index} className="flex items-start gap-3">
              <span className="text-primary mt-1.5 shrink-0">•</span>
              <p className="readout-body flex-1">{bullet}</p>
            </li>
          ))}
        </ul>
      </SectionCard>
      </EditorialReveal>
    </section>
  )
}

