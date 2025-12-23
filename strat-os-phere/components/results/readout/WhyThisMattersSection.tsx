'use client'

import { SectionCard } from '@/components/results/SectionCard'

interface WhyThisMattersSectionProps {
  marketTension: string | null
  whyNow: string | null
  whyDefensible: string | null
}

/**
 * Why This Matters Section - 3 short paragraphs connecting market tension, opportunity, and defensibility
 */
export function WhyThisMattersSection({
  marketTension,
  whyNow,
  whyDefensible,
}: WhyThisMattersSectionProps) {
  const hasContent = marketTension || whyNow || whyDefensible

  if (!hasContent) {
    return null
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">Why this matters</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Market context, timing, and defensibility
        </p>
      </div>
      <SectionCard className="bg-muted/30">
        <div className="space-y-4">
          {marketTension && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Market tension</h3>
              <p className="text-base text-foreground leading-relaxed">{marketTension}</p>
            </div>
          )}

          {whyNow && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Why now</h3>
              <p className="text-base text-foreground leading-relaxed">{whyNow}</p>
            </div>
          )}

          {whyDefensible && (
            <div>
              <h3 className="text-sm font-semibold text-foreground mb-2">Why it's defensible</h3>
              <p className="text-base text-foreground leading-relaxed">{whyDefensible}</p>
            </div>
          )}
        </div>
      </SectionCard>
    </section>
  )
}

