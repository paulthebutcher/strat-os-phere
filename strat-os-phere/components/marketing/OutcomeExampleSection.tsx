/**
 * ACT IV — The Outcome: A Defensible Call
 * 
 * Present the result of using Plinth, not the interface.
 * 
 * Visual treatment:
 * - A single, strong Decision Artifact
 * - Document-like, printable, composed
 * - Contains: Recommendation, Confidence band, Evidence count,
 *   Explicit assumptions or change conditions
 * 
 * This artifact should feel:
 * - Final
 * - Shareable
 * - Credible in executive settings
 * 
 * Still not a UI screenshot — this is a narrative artifact.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, ArtifactSettle } from "./motion"
import { OutcomeArtifact } from "./OutcomeArtifact"
import { SignatureMark } from "./SignatureMark"
import { cn } from "@/lib/utils"

export function OutcomeExampleSection() {
  return (
    <MarketingSection tone="alt" density="normal">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="flex flex-col gap-6 sm:gap-8">
            {/* Section headline - centered, compact */}
            <div className="text-center space-y-4 max-w-[65ch] mx-auto">
              <h2 className={cn(
                "editorial-section-headline mx-auto relative inline-block",
                "whitespace-nowrap lg:whitespace-nowrap",
                "text-2xl sm:text-3xl md:text-4xl lg:text-4xl",
                "max-w-full"
              )}>
                <SignatureMark variant="tick" delay={100} />
                <span className="ml-2">
                  A <span className="editorial-gradient-text">defensible call</span>
                </span>
                <SignatureMark variant="underline" delay={200} />
              </h2>
              <p className="editorial-body mx-auto">
                The recommendation. The confidence. The evidence. The conditions that would change it.
              </p>
            </div>

            {/* Hero Outcome Artifact - centered, heroic with settling motion */}
            <Reveal delay={60}>
              <ArtifactSettle delay={100}>
                <div className="flex justify-center">
                  <OutcomeArtifact className="w-full max-w-5xl" />
                </div>
              </ArtifactSettle>
            </Reveal>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}
