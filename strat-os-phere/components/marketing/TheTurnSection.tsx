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

import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { StakesProofCards } from "./StakesProofCards"
import { PaperSection } from "./layout/PaperSection"
import { SignatureMark } from "./SignatureMark"
import { cn } from "@/lib/utils"

export function TheTurnSection() {
  return (
    <PaperSection tone="paper" className="my-8 sm:my-12 md:my-16">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          {/* PRIMARY READING PATH - Core claim */}
          <div className="text-center space-y-3 sm:space-y-4 mb-6 sm:mb-8 max-w-[55ch] mx-auto">
            <h2 className={cn(
              "editorial-section-headline mx-auto relative inline-block",
              "whitespace-nowrap lg:whitespace-nowrap",
              "text-2xl sm:text-3xl md:text-4xl lg:text-4xl",
              "max-w-full"
            )}>
              <span>Being wrong is expensive</span>
              <SignatureMark variant="underline" delay={200} />
            </h2>
            <p className="editorial-body mx-auto text-base sm:text-lg leading-relaxed sm:leading-normal">
              This usually takes a long time and costs a lot of money.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <StakesProofCards />
        </Reveal>
      </MarketingContainer>
    </PaperSection>
  )
}

