/**
 * Act 2: The Turning Point — What Plinth changes
 * 
 * Process diagram showing evidence intake flow.
 * Makes Plinth feel like infrastructure, not a dashboard.
 * No product UI screenshots.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { EvidencePipeline } from "./EvidencePipeline"

export function TheTurnSection() {
  return (
    <MarketingSection tone="default" density="tight">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-2 sm:space-y-3 mb-6 sm:mb-8 max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
              Same question. Different outcome.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Most strategy debates fail because evidence never makes it to the table.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <EvidencePipeline />
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

