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
        <div className="flex flex-col gap-8 sm:gap-12">
          {/* Context: Text content above - centered, constrained width */}
          <Reveal>
            <div className="text-center space-y-3 sm:space-y-4 max-w-3xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-4xl font-semibold tracking-tight text-text-primary leading-tight">
                Too many opinions. Not enough proof.
              </h2>
              <p className="text-sm sm:text-base text-text-secondary">
                Most strategy debates fail before they start. Not because ideas are bad. Because evidence is thin.
              </p>
            </div>
          </Reveal>
          
          {/* Visual: Full-width visual below - the primary explanation */}
          <Reveal delay={60}>
            <SignalChaosPanel className="rounded-xl border border-border-subtle/40 lg:min-h-[500px] w-full" />
          </Reveal>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}
