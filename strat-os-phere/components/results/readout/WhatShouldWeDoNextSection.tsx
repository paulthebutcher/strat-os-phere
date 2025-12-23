'use client'

import { SectionCard } from '@/components/results/SectionCard'

interface WhatShouldWeDoNextSectionProps {
  decision: string | null
  next3Moves: string[]
  whatToSayNoTo: string[]
  hasStrategicBets: boolean
}

/**
 * What Should We Do Next Section - Action plan box
 */
export function WhatShouldWeDoNextSection({
  decision,
  next3Moves,
  whatToSayNoTo,
  hasStrategicBets,
}: WhatShouldWeDoNextSectionProps) {
  const hasContent = decision || next3Moves.length > 0 || whatToSayNoTo.length > 0

  if (!hasContent) {
    return (
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">What should we do next?</h2>
        <SectionCard className="bg-muted/30 border-2 border-border">
          <div className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {hasStrategicBets
                ? 'Action plan will appear here after strategic bets are generated.'
                : 'Generate Strategic Bets to add tradeoffs and action plans.'}
            </p>
          </div>
        </SectionCard>
      </section>
    )
  }

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-2xl font-semibold text-foreground">What should we do next?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          What you should do next (this week)
        </p>
      </div>
      <SectionCard className="bg-muted/30 border-2 border-border">
        <div className="space-y-6">
          {/* Decision to make */}
          {decision && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Decision to make
              </h3>
              <p className="text-base text-foreground leading-relaxed">{decision}</p>
            </div>
          )}

          {/* Next 3 moves */}
          {next3Moves.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                Next 3 moves this week
              </h3>
              <ul className="space-y-2">
                {next3Moves.map((move, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-primary mt-1 shrink-0 font-semibold">
                      {index + 1}.
                    </span>
                    <p className="text-base text-foreground leading-relaxed flex-1">{move}</p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* What to say no to */}
          {whatToSayNoTo.length > 0 ? (
            <div className="pt-4 border-t border-border">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-3">
                What to say no to
              </h3>
              <ul className="space-y-2">
                {whatToSayNoTo.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-muted-foreground mt-1 shrink-0">•</span>
                    <p className="text-sm text-foreground leading-relaxed flex-1">{item}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : !hasStrategicBets && (
            <div className="pt-4 border-t border-border">
              <p className="text-xs text-muted-foreground italic">
                Generate Strategic Bets to add tradeoffs and "what to say no to" recommendations.
              </p>
            </div>
          )}
        </div>
      </SectionCard>
    </section>
  )
}

