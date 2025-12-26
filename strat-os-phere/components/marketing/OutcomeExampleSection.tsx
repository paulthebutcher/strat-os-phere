/**
 * What You Get (No New Visuals)
 * 
 * Crop variations of the same hero screenshot:
 * - Recommendation area
 * - Evidence list
 * - Confidence indicators
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { HeroMoment } from "./HeroMoment"
import { cn } from "@/lib/utils"

interface WhatYouGetItemProps {
  label: string
}

function WhatYouGetItem({ label }: WhatYouGetItemProps) {
  return (
    <div className="space-y-1">
      <h3 className="text-xs sm:text-sm font-semibold text-text-primary">
        {label}
      </h3>
    </div>
  )
}

export function OutcomeExampleSection() {
  const items = [
    "One clear point of view",
    "Sources you can open",
    "Confidence that shows its work",
    "What would change the call"
  ]

  return (
    <MarketingSection variant="default">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Section headline */}
            <div className="text-center space-y-2 sm:space-y-3">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
                No dashboards. No rabbit holes.
              </h2>
            </div>

            {/* Crop variations grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Recommendation crop */}
              <div className="space-y-3">
                <div className="rounded-lg overflow-hidden shadow-lg border border-border-subtle">
                  <HeroMoment variant="cropped-recommendation" className="min-h-[200px]" />
                </div>
                <WhatYouGetItem label="One clear point of view" />
              </div>

              {/* Evidence crop */}
              <div className="space-y-3">
                <div className="rounded-lg overflow-hidden shadow-lg border border-border-subtle">
                  <HeroMoment variant="cropped-evidence" className="min-h-[200px]" />
                </div>
                <WhatYouGetItem label="Sources you can open" />
              </div>

              {/* Confidence crop */}
              <div className="space-y-3">
                <div className="rounded-lg overflow-hidden shadow-lg border border-border-subtle">
                  <HeroMoment variant="cropped-confidence" className="min-h-[200px]" />
                </div>
                <WhatYouGetItem label="Confidence that shows its work" />
              </div>
            </div>

            {/* What would change the call */}
            <div className="text-center pt-2">
              <WhatYouGetItem label="What would change the call" />
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

