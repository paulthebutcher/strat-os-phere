/**
 * Act 2: The Turning Point — What Plinth changes
 * 
 * Weighted layout: Before (smaller, muted) vs After (dominant, full opacity, explicit labels)
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
      <MarketingContainer maxWidth="5xl">
        <Reveal>
          <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
              Same question. Different outcome.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Most strategy debates fail because evidence never makes it to the table.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="grid grid-cols-1 lg:grid-cols-[0.35fr_0.65fr] gap-6 sm:gap-8">
            {/* Left: Before - muted, cropped, no structure */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-text-secondary/70 uppercase tracking-wider">
                Before
              </h3>
              <div className="rounded-lg border border-border-subtle/60 overflow-hidden shadow-sm opacity-60 blur-[1px]">
                <ProblemEvidenceCollage className="aspect-[4/3] rounded-lg scale-95 origin-center" />
              </div>
            </div>

            {/* Right: After - dominant, full opacity */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider">
                After (Plinth)
              </h3>
              <div className="relative shadow-2xl rounded-lg overflow-hidden border-2 border-accent-primary/20 bg-white">
                <HeroMoment variant="full" />
                {/* Subtle glow */}
                <div className="absolute inset-0 rounded-lg ring-2 ring-accent-primary/20 pointer-events-none" />
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

