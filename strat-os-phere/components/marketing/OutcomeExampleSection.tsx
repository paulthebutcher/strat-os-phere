/**
 * What You Get (No Dashboards Section)
 * 
 * 2-column layout:
 * - Left: narrative + bullet proof points
 * - Right: cohesive "Readout Proof Stack" visual
 *   - Top: Full readout crop (recommendation + score + sources)
 *   - Below: Two small callout crops (evidence list + risk/uncertainty)
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { HeroMoment } from "./HeroMoment"
import { cn } from "@/lib/utils"

export function OutcomeExampleSection() {
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
              <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
                Just the output you would actually share.
              </p>
            </div>

            {/* 2-column layout: Story + Proof */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
              {/* Left: Narrative + Bullets (5 cols on desktop) */}
              <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
                <div className="space-y-4">
                  <ul className="space-y-4">
                    <li className="space-y-1">
                      <h3 className="text-sm font-semibold text-text-primary">
                        One clear point of view
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Not 12 "insights." One recommendation you can explain.
                      </p>
                    </li>
                    <li className="space-y-1">
                      <h3 className="text-sm font-semibold text-text-primary">
                        Proof you can open
                      </h3>
                      <p className="text-xs text-text-secondary">
                        Every claim links to a real source. Easy to verify. Easy to share.
                      </p>
                    </li>
                    <li className="space-y-1">
                      <h3 className="text-sm font-semibold text-text-primary">
                        Confidence you can explain
                      </h3>
                      <p className="text-xs text-text-secondary">
                        See what's solid, what's directional, and what's missing.
                      </p>
                    </li>
                    <li className="space-y-1">
                      <h3 className="text-sm font-semibold text-text-primary">
                        What would change the call
                      </h3>
                      <p className="text-xs text-text-secondary">
                        The next evidence to gather. So you know exactly what to do next.
                      </p>
                    </li>
                  </ul>
                  <p className="text-xs text-text-muted italic pt-2">
                    This holds up in skeptical rooms. And fast-moving teams.
                  </p>
                </div>
              </div>

              {/* Right: Readout Proof Stack (7 cols on desktop) */}
              <div className="lg:col-span-7 space-y-4 order-1 lg:order-2">
                {/* Primary: Full readout crop */}
                <div className="rounded-lg overflow-hidden shadow-lg border border-border-subtle">
                  <HeroMoment variant="cropped-recommendation" className="min-h-[240px]" />
                </div>

                {/* Secondary row: Two small callout crops */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Sources you can open */}
                  <div className="rounded-lg overflow-hidden shadow-lg border border-border-subtle">
                    <HeroMoment variant="cropped-evidence" className="min-h-[160px]" />
                  </div>

                  {/* What would change the call */}
                  <div className="rounded-lg overflow-hidden shadow-lg border border-border-subtle">
                    <HeroMoment variant="cropped-guardrails" className="min-h-[160px]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
