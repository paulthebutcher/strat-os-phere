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
import { cn } from "@/lib/utils"

export function ProblemSection() {
  return (
    <MarketingSection tone="alt" density="tight">
      <MarketingContainer maxWidth="6xl">
        <div className="flex flex-col gap-6 sm:gap-8">
          {/* Context: Text content above - centered, constrained width - PRIMARY READING PATH */}
          <Reveal>
            <div className="text-center space-y-4 max-w-[55ch] mx-auto">
              <h2 className={cn(
                "editorial-section-headline mx-auto relative inline-block",
                "whitespace-nowrap lg:whitespace-nowrap",
                "text-2xl sm:text-3xl md:text-4xl lg:text-4xl",
                "max-w-full"
              )}>
                Decisions without shape
              </h2>
              <p className="editorial-body mx-auto">
                Too many opinions. Not enough proof. Most strategy debates fail before they start—not because ideas are bad, but because <span className="color-moment-accent font-medium">evidence never makes it to the table</span>.
              </p>
            </div>
          </Reveal>
          
          {/* Visual: Full-width fragmented visual - narrative chaos, not UI - SECONDARY CONTENT */}
          <Reveal delay={60}>
            <div className="w-full max-w-5xl mx-auto">
              <SignalChaosPanel className="rounded-xl border border-border-subtle/40 lg:min-h-[500px] w-full" />
            </div>
          </Reveal>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}
