/**
 * Act 3: The Receipt — What you actually get out
 * 
 * Single large outcome artifact.
 * Heroic, exportable, feels like something you'd screenshot for leadership.
 * No full product UI previews.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { OutcomeArtifact } from "./OutcomeArtifact"

export function OutcomeExampleSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="5xl">
        <Reveal>
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Section headline - tighter */}
            <div className="text-center space-y-2 sm:space-y-3 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
                No dashboards. No rabbit holes.
              </h2>
              <p className="text-sm sm:text-base text-text-secondary">
                Just the part that creates leverage.
              </p>
            </div>

            {/* Hero Outcome Artifact */}
            <Reveal delay={60}>
              <OutcomeArtifact />
            </Reveal>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
