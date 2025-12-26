/**
 * Act 3: The Receipt — What you actually get out
 * 
 * Hero object: The Plinth readout is treated like a document you'd bring into a meeting.
 * Larger scale, "Plinth Readout" label, repeated exposure.
 * Copy is declarative and placed next to visuals.
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
      <MarketingContainer maxWidth="5xl">
        <Reveal>
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Section headline - tighter */}
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
                No dashboards. No rabbit holes.
              </h2>
              <p className="text-sm sm:text-base text-text-secondary">
                Just the part that creates leverage.
              </p>
            </div>

            {/* Hero Plinth Readout - larger */}
            <Reveal delay={60}>
              <div className="relative rounded-xl overflow-hidden shadow-2xl border-2 border-accent-primary/20 bg-white">
                <HeroMoment variant="full" className="min-h-[600px] md:min-h-[700px]" />
                
                {/* Stronger glow effect */}
                <div className="absolute inset-0 rounded-xl ring-2 ring-accent-primary/30 pointer-events-none" />
              </div>
            </Reveal>

            {/* Supporting points - placed below visual, declarative */}
            <Reveal delay={120}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-semibold text-text-primary">
                    One clear point of view
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Not a list. The one that matters.
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-semibold text-text-primary">
                    Proof you can open
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Every claim links to a source.
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-semibold text-text-primary">
                    Confidence you can explain
                  </h3>
                  <p className="text-xs text-text-secondary">
                    What's solid. What's directional.
                  </p>
                </div>
                <div className="text-center space-y-1">
                  <h3 className="text-sm font-semibold text-text-primary">
                    What would change this
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Signals that erase or strengthen your edge.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
