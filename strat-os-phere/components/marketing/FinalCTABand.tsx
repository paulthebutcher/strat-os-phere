/**
 * Final CTA Band
 * 
 * Clean, high-contrast (but restrained) CTA section.
 * One sentence value prop + primary CTA + optional secondary link.
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
                Make the call with your eyes open.
              </h2>
              <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-prose mx-auto">
                Get to an evidence-bound point of view faster — without pretending uncertainty doesn't exist.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-2">
                <Link href="/new">
                  <Button 
                    size="lg" 
                    className={cn(
                      "w-full sm:w-auto shadow-lg",
                      HoverLift.className
                    )}
                  >
                    Get started
                  </Button>
                </Link>
                <Link href="#how">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className={cn(
                      "w-full sm:w-auto border-2 hover:bg-accent-primary/5",
                      HoverLift.subtle
                    )}
                  >
                    See how it works
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

