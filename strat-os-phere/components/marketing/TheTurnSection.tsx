/**
 * ACT II — The Stakes: Being Wrong Is Expensive
 * 
 * Introduce gravity before introducing the solution.
 * 
 * Visual treatment:
 * - Documentary / dossier feel
 * - Redacted memo blocks
 * - "Decision pending" stamps
 * - Branching timelines
 * - Highlighted risk notes
 * - Sparse color
 * - Strong framing
 * 
 * No product. No UI.
 * This section should feel heavier than the one above it.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { StakesDossierPanel } from "./StakesDossierPanel"

export function TheTurnSection() {
  return (
    <MarketingSection tone="default" density="tight">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 mb-8 max-w-[65ch] mx-auto">
            <h2 className="editorial-section-headline mx-auto">
              Being wrong is expensive
            </h2>
            <p className="editorial-body mx-auto">
              Every week of indecision compounds. Resources allocated elsewhere while the decision remains unresolved.
            </p>
          </div>
        </Reveal>
        
        {/* Asymmetrical divider for visual interest */}
        <div className="divider-asymmetric mb-8" />
        
        <Reveal delay={60}>
          <StakesDossierPanel className="rounded-xl lg:min-h-[600px] w-full" />
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

