/**
 * Zoom In: Why This Screenshot Matters
 * 
 * Same screenshot, but with 3 subtle callouts (not tooltips, just highlights):
 * - Source links
 * - Confidence label
 * - "What would change this" section
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { HeroMoment } from "./HeroMoment"
import { cn } from "@/lib/utils"

export function ZoomInSection() {
  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              Built for skeptical rooms.
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-text-secondary max-w-2xl mx-auto">
              Every claim is sourced. Confidence is explicit. Unknowns are visible.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="max-w-5xl mx-auto">
            <div className="shadow-2xl rounded-xl overflow-hidden">
              <HeroMoment variant="full" showCallouts={true} />
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}


