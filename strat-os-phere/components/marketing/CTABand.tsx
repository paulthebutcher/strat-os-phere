/**
 * CTA Band Section
 * 
 * Design tokens used:
 * - accent-primary: Background gradient and primary button
 * - text-primary-foreground: Text color on accent background
 * - surface: Card background for contrast
 * 
 * Enhanced with accent background gradient and stronger visual treatment.
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTABand() {
  return (
    <section className="mx-auto max-w-[1200px] px-4 py-24 md:py-32">
      <div className="relative mx-auto max-w-4xl overflow-hidden rounded-xl border-2 border-accent-primary/20 bg-gradient-to-br from-accent-primary/10 via-accent-primary/5 to-surface p-12 text-center shadow-lg md:p-16">
        <h2 className="text-4xl font-bold tracking-tight text-text-primary md:text-5xl">
          Make one strategic bet this week with confidence.
        </h2>
        <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl">
          Turn competitor signals into decision-ready outputs in minutes. Get Jobs-to-be-Done, scorecards, opportunities, and Strategic Bets—all backed by live evidence with citations.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto shadow-lg hover:shadow-xl transition-shadow hover:scale-105">
              Start an analysis
            </Button>
          </Link>
          <Link href="#sample-output">
            <Button size="lg" variant="outline" className="w-full sm:w-auto border-2 hover:bg-accent-primary/5">
              View sample output
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

