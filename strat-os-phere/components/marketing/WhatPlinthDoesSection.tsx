/**
 * What Plinth Does — and Doesn't Do
 * 
 * Explicit guardrails section that increases enterprise trust by
 * naming limits, showing restraint, and avoiding over-promising.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"

export function WhatPlinthDoesSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="space-y-8 sm:space-y-12">
            {/* Section header */}
            <div className="text-center space-y-3 sm:space-y-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
                What Plinth does and doesn't do
              </h2>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 md:gap-16">
              {/* Column 1: Plinth does */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-text-primary">
                  Plinth does
                </h3>
                <ul className="space-y-3 text-sm sm:text-base text-text-secondary leading-relaxed">
                  <li className="flex items-start">
                    <span className="mr-2 text-text-muted">•</span>
                    <span>Aggregates public competitive signals</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-text-muted">•</span>
                    <span>Makes assumptions explicit</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-text-muted">•</span>
                    <span>Shows confidence and uncertainty side-by-side</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-text-muted">•</span>
                    <span>Produces shareable, inspectable readouts</span>
                  </li>
                </ul>
              </div>

              {/* Column 2: Plinth doesn't */}
              <div className="space-y-4">
                <h3 className="text-base sm:text-lg font-semibold text-text-primary">
                  Plinth doesn't
                </h3>
                <ul className="space-y-3 text-sm sm:text-base text-text-secondary leading-relaxed">
                  <li className="flex items-start">
                    <span className="mr-2 text-text-muted">•</span>
                    <span>Replace strategic judgment</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-text-muted">•</span>
                    <span>Hide uncertainty behind scores</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-text-muted">•</span>
                    <span>Optimize for dashboards or vanity metrics</span>
                  </li>
                  <li className="flex items-start">
                    <span className="mr-2 text-text-muted">•</span>
                    <span>Claim certainty where none exists</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

