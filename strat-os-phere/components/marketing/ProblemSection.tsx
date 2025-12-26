/**
 * Act 1: The Mess — What decision-making looks like today
 * 
 * Tight narrative with visual contrast.
 * Left: Chaos Grid (Before)
 * Right: Decision Card + Confidence Boundary Bar (After)
 * 
 * No screenshots. Pure contrast.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { ChaosGrid } from "./ChaosGrid"
import { DecisionCard } from "./DecisionCard"
import { ConfidenceBoundaryBar } from "./ConfidenceBoundaryBar"

export function ProblemSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
              Too many opinions. Not enough proof.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary">
              Most strategy debates fail before they start. Not because ideas are bad. Because evidence is thin.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-12 items-start">
            {/* Left: Before - Chaos Grid */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Before
              </div>
              <ChaosGrid className="min-h-[200px]" />
            </div>

            {/* Right: After - Decision Card + Confidence Bar */}
            <div className="space-y-4">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                After
              </div>
              <DecisionCard />
              <ConfidenceBoundaryBar />
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
