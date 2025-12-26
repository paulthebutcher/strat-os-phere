/**
 * What You Walk Into The Room With
 * 
 * Asymmetric before/after comparison.
 * Left: Messy signal stack (compressed, faded, abstract)
 * Right: Clean outcome artifact (larger, structured, calm)
 * 
 * No "Before / After" labels needed - hierarchy does the persuasion.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { AsymmetricContrast } from "./AsymmetricContrast"

export function TheFlowSection() {
  return (
    <MarketingSection tone="alt" density="normal">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              What you walk into the room with
            </h2>
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
              A single recommendation, supported by real evidence and explicit confidence.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <AsymmetricContrast />
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
