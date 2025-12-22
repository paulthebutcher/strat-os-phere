/**
 * CTA Band Section
 * 
 * Enhanced with brand tokens for consistent styling and enterprise-grade appearance.
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"
import { Backdrop } from "@/components/graphics"

export function CTABand() {
  return (
    <section className={cn("mx-auto max-w-[1200px] px-4 relative", brand.spacing.section)}>
      <div className={cn(
        "relative mx-auto max-w-4xl overflow-hidden rounded-xl border-2 border-accent-primary/20",
        "bg-gradient-to-br from-accent-primary/10 via-accent-primary/5 to-surface",
        "p-12 text-center shadow-lg md:p-16"
      )}>
        <Backdrop variant="section" density="medium" className="rounded-xl" />
        <div className="relative z-10">
        <h2 className={cn(brand.typeScale.headline, "text-text-primary")}>
          Make one strategic bet this week with confidence.
        </h2>
        <p className={cn("mt-6", brand.typeScale.bodyLarge, "text-text-secondary")}>
          Turn competitor signals into decision-ready outputs in minutes. Get Jobs-to-be-Done, scorecards, opportunities, and Strategic Bets—all backed by live evidence with citations.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/projects/new">
            <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow hover:scale-105">
              Run an analysis
            </Button>
          </Link>
          <Link href="#sample-output">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-accent-primary/5">
              See a sample
            </Button>
          </Link>
        </div>
        </div>
      </div>
    </section>
  )
}

