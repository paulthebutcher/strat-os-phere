/**
 * The Turn — Why This Is Different
 * 
 * Side-by-side:
 * - Left: messy inputs (opinions, dashboards, docs)
 * - Right: the same hero readout
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { HeroMoment } from "./HeroMoment"
import { ProblemEvidenceCollage } from "./ProblemEvidenceCollage"
import { cn } from "@/lib/utils"

export function TheTurnSection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Same question. Different outcome.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-2xl mx-auto">
              Most strategy debates fail because evidence never makes it to the table.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {/* Left: Messy inputs */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider">
                Without Plinth
              </h3>
              <div className="rounded-lg border border-border-subtle overflow-hidden shadow-lg">
                <ProblemEvidenceCollage className="aspect-[4/3] rounded-lg" />
              </div>
            </div>

            {/* Right: Hero readout */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                With Plinth
              </h3>
              <div className="shadow-xl rounded-lg overflow-hidden">
                <HeroMoment variant="full" />
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

