/**
 * CTA Band Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 * Full-bleed gradient treatment for strong visual separation.
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { Backdrop } from "@/components/graphics"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

export function CTABand() {
  return (
    <MarketingSection variant="gradient" className="relative overflow-hidden">
      <Backdrop variant="section" density="medium" />
      <MarketingContainer maxWidth="4xl" className="relative z-10">
        <div className={cn(
          "relative overflow-hidden rounded-2xl border-2 border-accent-primary/30",
          "bg-gradient-to-br from-accent-primary/15 via-accent-primary/8 to-surface",
          "p-12 text-center shadow-xl md:p-16"
        )}>
          <div className="space-y-6">
            <h2 className="text-2xl md:text-4xl font-semibold tracking-tight text-text-primary">
              Ready to try it?
            </h2>
            <p className="text-base md:text-lg leading-relaxed text-text-secondary max-w-prose mx-auto">
              Turn competitor signals into decision-ready outputs in minutes. Get Jobs-to-be-Done, scorecards, opportunities, and Strategic Bets—all backed by live evidence with citations.
            </p>
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row pt-2">
              <Link href="/try">
                <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow hover:scale-105">
                  Try Plinth
                </Button>
              </Link>
              <Link href="/samples">
                <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-accent-primary/5">
                  See example output
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

