/**
 * ACT III — The Shift: Evidence Creates Structure
 * 
 * Visually communicate the transition from noise to form.
 * 
 * Visual treatment:
 * - Fragments from earlier acts begin to align
 * - Loose elements snap into rows and columns
 * - Signals become grouped
 * - Clear boundaries appear
 * 
 * This is not the app yet.
 * It's the concept of structure.
 * 
 * Think: "The fog is lifting."
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { StructureEmergingPanel } from "./StructureEmergingPanel"

export function TheFlowSection() {
  return (
    <MarketingSection tone="alt" density="normal">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 mb-8 max-w-[65ch] mx-auto">
            <h2 className="editorial-section-headline mx-auto">
              Evidence creates <span className="editorial-gradient-text">structure</span>
            </h2>
            <p className="editorial-body mx-auto">
              The fog is lifting. Fragments align. Signals group. Boundaries appear.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <StructureEmergingPanel className="rounded-xl lg:min-h-[500px] w-full" />
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
