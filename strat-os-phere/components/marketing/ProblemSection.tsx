/**
 * "This Is the Problem" Section
 * 
 * Image-led, minimal text. Shows the chaos of opinions without proof.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { ProblemEvidenceCollage } from "./ProblemEvidenceCollage"

export function ProblemSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 sm:space-y-6">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Too many opinions. Not enough proof.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-2xl mx-auto">
              Most strategy debates fail before they start. Not because ideas are bad. Because evidence is thin.
            </p>
          </div>
        </Reveal>
        
        {/* Visual collage showing the noise of strategy work */}
        <Reveal delay={60}>
          <div className="mt-8 sm:mt-12">
            <ProblemEvidenceCollage />
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

