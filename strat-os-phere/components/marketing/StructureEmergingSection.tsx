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
import { cn } from "@/lib/utils"

export function StructureEmergingSection() {
  return (
    <MarketingSection tone="alt" density="dense">
      <div className="bg-gradient-to-b from-muted/30 to-background">
        <MarketingContainer maxWidth="6xl" className="py-16 sm:py-24">
          <div className="flex flex-col gap-4 sm:gap-5">
            {/* Section headline - centered, compact with color moment - PRIMARY READING PATH */}
            <Reveal>
              <div className="text-center space-y-3 max-w-[55ch] mx-auto">
                <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
                  Evidence base
                </p>
                <h2 className={cn(
                  "text-2xl sm:text-3xl md:text-4xl lg:text-4xl",
                  "font-semibold tracking-tight text-text-primary",
                  "leading-[1.08] pb-[0.08em]",
                  "relative inline-block",
                  "whitespace-nowrap lg:whitespace-nowrap",
                  "max-w-full"
                )}>
                  Evidence creates <span className="color-moment-highlight font-medium">structure</span>
                </h2>
                <p className="text-sm sm:text-base text-text-secondary leading-snug">
                  The fog lifts. Fragments align. Signals group. Boundaries appear.
                </p>
              </div>
            </Reveal>
            
            {/* Structure Emerging Panel - narrative visual with enhanced card frame */}
            <Reveal delay={60}>
              <div className="mt-10 rounded-2xl border border-border-strong bg-background/60 shadow-sm overflow-hidden">
                <StructureEmergingPanel className="lg:min-h-[500px] w-full !border-0 !shadow-none" />
              </div>
            </Reveal>
          </div>
        </MarketingContainer>
      </div>
    </MarketingSection>
  )
}

