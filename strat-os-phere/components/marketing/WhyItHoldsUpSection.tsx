/**
 * Act 4: The Advantage — Why this compounds over time
 * 
 * Repeated exposure to the Plinth readout. Shows it's defensible, citable, shareable.
 * Enterprise buyers see something they could defend internally.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { HeroReadoutReveal } from "./HeroReadoutReveal"

export function WhyItHoldsUpSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="5xl">
        <Reveal>
          <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
              Evidence you can open and defend
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Every claim links to its source. Confidence levels are explicit. You can cite this, not just present it.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="max-w-4xl mx-auto">
            <div className="relative rounded-xl border-2 border-accent-primary/20 shadow-2xl overflow-hidden bg-white">
              <HeroReadoutReveal 
                variant="full" 
                className="rounded-none"
              />
              {/* Stronger glow */}
              <div className="absolute inset-0 rounded-xl ring-2 ring-accent-primary/30 pointer-events-none" />
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

