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

export function FinalCTABand() {
  return (
    <MarketingSection variant="gradient" className="relative overflow-hidden">
      <MarketingContainer maxWidth="4xl" className="relative z-10">
        <div className={cn(
          "relative overflow-hidden rounded-2xl border border-border-subtle",
          "bg-surface p-12 text-center shadow-lg md:p-16"
        )}>
          <div className="space-y-6">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
              Turn market signals into ranked opportunities.
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-prose mx-auto">
              Start with a company and your decision context. We'll gather evidence and deliver ranked, defensible strategic bets with citations.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-2">
              <Link href="/try">
                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow">
                  Start a new analysis
                </Button>
              </Link>
              <Link href="#how-it-works">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-accent-primary/5">
                  See how it works
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

