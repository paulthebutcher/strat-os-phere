/**
 * Act 1: The Mess — What decision-making looks like today
 * 
 * Tight narrative with visual contrast. Pulls visuals higher to reduce dead space.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { BeforeAfterContrast } from "./BeforeAfterContrast"

export function ProblemSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="5xl">
        <Reveal>
          <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
              Too many opinions. Not enough proof.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Most strategy debates fail before they start. Not because ideas are bad. Because evidence is thin.
            </p>
          </div>
        </Reveal>
        
        {/* Before/After contrast visual - pulled higher, less whitespace */}
        <Reveal delay={60}>
          <div className="mt-6 sm:mt-8 md:mt-10 -mb-4">
            <BeforeAfterContrast />
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

