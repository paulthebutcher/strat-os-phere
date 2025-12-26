/**
 * ACT V — The Aftermath: What Changes When It Holds Up
 * 
 * Show downstream impact without feature lists.
 * 
 * Visual treatment:
 * - Symbolic representations
 * - Closed loops instead of endless cycles
 * - Clean timelines instead of branching debates
 * - Fewer artifacts, more resolution
 * - Calm, confident composition
 * 
 * Minimal text. Clear implication:
 * "This is what alignment looks like."
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { AftermathPanel } from "./AftermathPanel"

export function WhyItHoldsUpSection() {
  return (
    <MarketingSection tone="default" density="normal">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 mb-8 max-w-[65ch] mx-auto">
            <h2 className="editorial-section-headline mx-auto">
              What changes when it <span className="editorial-gradient-text">holds up</span>
            </h2>
            <p className="editorial-body mx-auto">
              Closed loops. Clean timelines. Fewer artifacts, more resolution.
            </p>
          </div>
        </Reveal>
        
        {/* Asymmetrical divider (reverse) */}
        <div className="divider-asymmetric-reverse mb-8" />
        
        <Reveal delay={60}>
          <AftermathPanel className="rounded-xl lg:min-h-[500px] w-full" />
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

