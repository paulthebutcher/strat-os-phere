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

export function StructureEmergingSection() {
  return (
    <MarketingSection tone="alt" density="normal">
      <MarketingContainer maxWidth="6xl">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Section headline - centered, compact */}
          <Reveal>
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
                Evidence creates structure
              </h2>
              <p className="text-sm sm:text-base text-text-secondary">
                The fog lifts. Fragments align. Signals group. Boundaries appear.
              </p>
            </div>
          </Reveal>
          
          {/* Structure Emerging Panel - narrative visual */}
          <Reveal delay={60}>
            <StructureEmergingPanel className="rounded-xl border border-border-subtle/40 lg:min-h-[500px] w-full" />
          </Reveal>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

