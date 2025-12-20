/**
 * CTA Band Section
 * 
 * Design tokens used:
 * - accent-primary: Primary button
 * - text-text-primary: Headline color
 * - surface: Card background
 * 
 * Strong visual separation with deliberate, confident presentation.
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function CTABand() {
  return (
    <section className="bg-surface-muted/30 mx-auto max-w-7xl px-4 py-32 md:py-40">
      <div className="mx-auto max-w-4xl text-center">
        <h2 className="text-4xl font-semibold tracking-tight text-text-primary md:text-5xl">
          Stop generating insights. Start making decisions.
        </h2>
        <div className="mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link href="/dashboard">
            <Button size="lg" className="w-full sm:w-auto">
              Generate an analysis
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}

