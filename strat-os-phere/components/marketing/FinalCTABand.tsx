/**
 * Final CTA Band
 * 
 * Simple and welcoming final CTA section.
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { microcopy } from "@/lib/copy/microcopy"
import { Reveal, HoverLift } from "./motion"

export function FinalCTABand() {
  return (
    <MarketingSection variant="gradient" className="relative overflow-hidden">
      <MarketingContainer maxWidth="4xl" className="relative z-10">
        <Reveal>
          <div className={cn(
            "relative overflow-hidden rounded-2xl border border-border-subtle",
            "bg-surface p-12 text-center shadow-lg md:p-16"
          )}>
            <div className="space-y-6">
              <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
                Start with a rough idea.
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-prose mx-auto">
                Leave with a decision you can defend.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-2">
                <Link href="/new">
                  <Button 
                    size="lg" 
                    variant="brand"
                    className={cn(
                      "w-full sm:w-auto shadow-lg",
                      HoverLift.className
                    )}
                  >
                    Try it on your idea
                  </Button>
                </Link>
                <Link href="/example">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className={cn(
                      "w-full sm:w-auto border-2 hover:bg-accent-primary/5",
                      HoverLift.subtle
                    )}
                  >
                    See a sample decision
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

