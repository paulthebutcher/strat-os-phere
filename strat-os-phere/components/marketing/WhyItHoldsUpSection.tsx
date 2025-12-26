/**
 * "Why It Holds Up" Section
 * 
 * Credibility without chest-thumping. Shows source links, confidence labels, "What would change this" section.
 * Headline: "Built for skeptical rooms."
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { HeroReadoutReveal } from "./HeroReadoutReveal"

export function WhyItHoldsUpSection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              This holds up in skeptical rooms.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-2xl mx-auto">
              If you can't explain it, cite it, or defend it, it doesn't belong here.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="max-w-5xl mx-auto">
            <div className="rounded-xl border-2 border-border-subtle/80 shadow-2xl overflow-hidden bg-white">
              <HeroReadoutReveal 
                variant="full" 
                showCallouts={true}
                className="rounded-none"
              />
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

