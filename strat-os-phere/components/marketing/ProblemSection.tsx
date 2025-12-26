/**
 * Act 1: The Mess — What decision-making looks like today
 * 
 * Abstract signal collage showing raw, unstructured inputs.
 * No product UI, no "before/after" labels.
 * Pure visual communication of ambiguity and overload.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { SignalChaosPanel } from "./SignalChaosPanel"

export function ProblemSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="7xl">
        <div className="grid grid-cols-1 lg:grid-cols-[0.45fr_0.55fr] gap-8 lg:gap-12 items-center">
          {/* Left: Text content - left-aligned for rhythm */}
          <Reveal>
            <div className="space-y-4 sm:space-y-5 text-left lg:pr-8">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
                Too many opinions. Not enough proof.
              </h2>
              <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                Most strategy debates fail before they start. Not because ideas are bad. Because evidence is thin.
              </p>
            </div>
          </Reveal>
          
          {/* Right: Visual - full width on mobile, constrained on desktop */}
          <Reveal delay={60}>
            <SignalChaosPanel className="rounded-xl border border-border-subtle/40 lg:min-h-[500px]" />
          </Reveal>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}
