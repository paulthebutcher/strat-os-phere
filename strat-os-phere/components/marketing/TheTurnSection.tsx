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
import { StakesDossierPanel } from "./StakesDossierPanel"
import { PaperSection } from "./layout/PaperSection"
import { OffsetDivider } from "./layout/OffsetDivider"
import { SignatureMark } from "./SignatureMark"
import { cn } from "@/lib/utils"

export function TheTurnSection() {
  return (
    <PaperSection tone="paper" className="my-10 sm:my-20 md:my-24">
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
              <SignatureMark variant="tick" delay={100} />
              <span className="ml-2">Being wrong is expensive</span>
              <SignatureMark variant="underline" delay={200} />
            </h2>
            <p className="editorial-body mx-auto text-base sm:text-lg leading-relaxed sm:leading-normal">
              Every week of indecision compounds. Resources allocated elsewhere while the decision remains unresolved.
            </p>
          </div>
        </Reveal>
        
        {/* Offset divider with label - hidden on mobile */}
        <div className="hidden sm:block">
          <OffsetDivider label="Stakes" align="left" />
        </div>
        
        <Reveal delay={60}>
          <StakesDossierPanel className="rounded-xl lg:min-h-[600px] w-full" />
        </Reveal>
      </MarketingContainer>
    </PaperSection>
  )
}

