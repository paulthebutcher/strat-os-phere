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
import { SignatureMark } from "./SignatureMark"
import { cn } from "@/lib/utils"

export function StructureEmergingSection() {
  return (
    <MarketingSection tone="alt" density="normal">
      <MarketingContainer maxWidth="6xl">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Section headline - centered, compact with color moment */}
          <Reveal>
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <h2 className={cn(
                "text-2xl sm:text-3xl md:text-4xl lg:text-4xl",
                "font-semibold tracking-tight text-text-primary leading-tight",
                "relative inline-block",
                "whitespace-nowrap lg:whitespace-nowrap",
                "max-w-full"
              )}>
                <SignatureMark variant="tick" delay={100} />
                <span className="ml-2">
                  Evidence creates <span className="color-moment-highlight">structure</span>
                </span>
                <SignatureMark variant="underline" delay={200} />
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

