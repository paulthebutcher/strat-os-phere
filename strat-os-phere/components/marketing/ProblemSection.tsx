/**
 * ACT I — The Problem: Decisions Without Shape
 * 
 * Make the reader feel the ambiguity and friction of real decision-making.
 * 
 * Visual treatment:
 * - No UI
 * - Large, assertive headlines
 * - Fragmented visual elements: conflicting numbers, partial tables,
 *   disconnected quotes, incomplete charts
 * - Elements overlap slightly or misalign on purpose
 * 
 * Tone: Unsettled, unresolved, familiar.
 * Rule: If a visual looks like a dashboard, remove it.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { SignalChaosPanel } from "./SignalChaosPanel"

export function ProblemSection() {
  return (
    <MarketingSection tone="alt" density="tight">
      <MarketingContainer maxWidth="6xl">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Context: Text content above - centered, constrained width */}
          <Reveal>
            <div className="text-center space-y-4 max-w-[65ch] mx-auto">
              <h2 className="editorial-section-headline mx-auto">
                Decisions without shape
              </h2>
              <p className="editorial-body mx-auto">
                Too many opinions. Not enough proof. Most strategy debates fail before they start—not because ideas are bad, but because evidence never makes it to the table.
              </p>
            </div>
          </Reveal>
          
          {/* Visual: Full-width fragmented visual - narrative chaos, not UI */}
          <Reveal delay={60}>
            <SignalChaosPanel className="rounded-xl border border-border-subtle/40 lg:min-h-[500px] w-full" />
          </Reveal>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}
