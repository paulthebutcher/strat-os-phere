/**
 * Act 4: The Advantage — Why this compounds over time
 * 
 * Structural proof blocks showing how Plinth thinks without showing UI.
 * Coverage, confidence boundaries, and invalidation conditions.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { ProofGrid } from "./ProofGrid"

export function WhyItHoldsUpSection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="7xl">
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
          <ProofGrid />
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

