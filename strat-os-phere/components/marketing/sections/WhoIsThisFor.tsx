/**
 * Who Is This For Section
 * 
 * Single inclusive block that answers "Who is this for?" without segmenting.
 * No audience labels. No titles. Just the moment.
 */
"use client"

import { MarketingSection } from "../MarketingSection"
import { MarketingContainer } from "../MarketingContainer"
import { Reveal } from "../motion"

export function WhoIsThisFor() {
  return (
    <MarketingSection variant="default" id="who">
      <MarketingContainer maxWidth="4xl">
        <Reveal>
          <div className="text-center space-y-4">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary">
              Built for the moment you're deciding what to bet on
            </h2>
            <div className="space-y-3 max-w-2xl mx-auto text-left sm:text-center">
              <p className="text-base sm:text-lg text-text-secondary">
                If you're exploring an idea: get clarity on what's real, what's missing, and what to test next.
              </p>
              <p className="text-base sm:text-lg text-text-secondary">
                If you're making an investment: get evidence, assumptions, and confidence—on one page.
              </p>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

