/**
 * What You Get (No Dashboards Section)
 * 
 * 2-column layout:
 * - Left: narrative + bullet proof points (supporting)
 * - Right: After-first showcase (dominant)
 *   - Top: Large After readout hero (primary)
 *   - Middle: Smaller After "What would change" card (secondary)
 *   - Bottom: Small muted Before strip (supporting)
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { HeroMoment } from "./HeroMoment"
import { ProblemEvidenceCollage } from "./ProblemEvidenceCollage"
import { cn } from "@/lib/utils"

export function OutcomeExampleSection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Section headline */}
            <div className="text-center space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
                No dashboards. No rabbit holes.
              </h2>
              <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
                Just the part that creates leverage.
              </p>
            </div>

            {/* 2-column layout: Story + Proof */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left: Narrative + Bullets (4 cols on desktop, supporting) */}
              <div className="lg:col-span-4 space-y-6 order-2 lg:order-1">
                <div className="space-y-4">
                  <ul className="space-y-4">
                    <li className="space-y-1">
                      <h3 className="text-sm font-semibold text-text-primary">
                        One clear point of view
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Not a list of ideas. The one that matters.
                      </p>
                    </li>
                    <li className="space-y-1">
                      <h3 className="text-sm font-semibold text-text-primary">
                        Proof you can open
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Every claim ties back to a real source.
                      </p>
                    </li>
                    <li className="space-y-1">
                      <h3 className="text-sm font-semibold text-text-primary">
                        Confidence you can explain
                      </h3>
                      <p className="text-xs text-text-secondary">
                        What's solid. What's directional. What's missing.
                      </p>
                    </li>
                    <li className="space-y-1">
                      <h3 className="text-sm font-semibold text-text-primary">
                        What would change the call
                      </h3>
                      <p className="text-xs text-text-secondary">
                        The signals that would erase your edge—or strengthen it.
                      </p>
                    </li>
                  </ul>
                </div>
              </div>

              {/* Right: After-first showcase (8 cols on desktop, dominant) */}
              <div className="lg:col-span-8 space-y-4 order-1 lg:order-2">
                {/* 1. After: Decision Readout (large, crisp, primary hero) */}
                <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-border-subtle bg-white">
                  {/* After callout pills */}
                  <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-2">
                    <div className="bg-accent-primary text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-lg">
                      One recommendation
                    </div>
                    <div className="bg-accent-primary text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-lg">
                      Evidence attached
                    </div>
                  </div>
                  <div className="absolute top-3 right-3 z-10">
                    <div className="bg-accent-primary text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-lg">
                      Confidence shown
                    </div>
                  </div>
                  
                  <HeroMoment variant="full" className="min-h-[500px]" />
                  
                  {/* Subtle glow effect */}
                  <div className="absolute inset-0 rounded-xl ring-2 ring-accent-primary/20 pointer-events-none" />
                </div>

                {/* 2. After: "What would change this call" (smaller, crisp, secondary) */}
                <div className="relative rounded-lg overflow-hidden shadow-lg border border-border-subtle bg-white">
                  <div className="absolute top-2 right-2 z-10">
                    <div className="bg-accent-primary text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-md">
                      What would change the call
                    </div>
                  </div>
                  <HeroMoment variant="cropped-guardrails" className="min-h-[180px]" />
                </div>

                {/* 3. Before: chaos thumbnail strip (small, muted, supporting) */}
                <div className="relative rounded-lg overflow-hidden border border-border-subtle/60 shadow-sm opacity-60 blur-[1px]">
                  <div className="absolute top-2 left-2 z-10 bg-amber-50 border border-amber-200 rounded-md px-2 py-1">
                    <span className="text-[10px] font-semibold text-amber-900 uppercase tracking-wide">
                      Before
                    </span>
                  </div>
                  <ProblemEvidenceCollage className="aspect-[16/4] scale-90 origin-center" />
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
