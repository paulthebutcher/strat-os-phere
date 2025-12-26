/**
 * What You Walk Into The Room With
 * 
 * Outcome-focused two-part layout:
 * - Left (20-30%): Compact input card with question and market context
 * - Right (70-80%): Plinth readout as the visual and narrative center
 * 
 * No arrows, no process labels, no "Plinth does". 
 * This section is about the outcome: what you walk into the room with.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { DecisionCard } from "./DecisionCard"
import { sampleAnalysis } from "./sampleReadoutData"

// Compact Input Card - lightweight context on the left
function InputCard() {
  return (
    <div className="p-4 rounded-lg bg-white/60 border border-border-subtle/40 shadow-sm space-y-2">
      <div className="space-y-1.5">
        <h4 className="text-sm font-medium text-text-secondary">
          {sampleAnalysis.decisionQuestion}
        </h4>
        <p className="text-xs text-text-muted">
          {sampleAnalysis.market}
        </p>
      </div>
    </div>
  )
}

export function TheFlowSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              What you walk into the room with
            </h2>
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
              A single recommendation, supported by real evidence and explicit confidence.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr] gap-6 lg:gap-8 items-start">
            {/* Left: Compact input card (lightweight context) */}
            <div className="lg:pt-2">
              <InputCard />
            </div>

            {/* Right: Plinth readout (dominant, 70-80% visual weight) */}
            <div className="relative">
              {/* Enhanced spotlight/glow behind the card */}
              <div 
                className="absolute -inset-6 opacity-80 rounded-2xl pointer-events-none -z-10"
                style={{
                  background: 'radial-gradient(circle at center, hsl(230 65% 50% / 0.15), hsl(230 65% 50% / 0.08), transparent)'
                }}
              />
              <DecisionCard className="relative shadow-2xl border-accent-primary/30" />
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
