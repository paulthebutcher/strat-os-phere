/**
 * Hero Section
 * 
 * Design tokens used:
 * - text-text-primary: Main headline color (dark gray, not pure black)
 * - text-text-secondary: Subhead color (medium gray for readability)
 * - accent-primary: Primary CTA button color (desaturated blue)
 * - surface-muted: Placeholder background (very light gray)
 * - background: Base background with subtle gradient overlay
 * 
 * Typography scale: text-4xl → text-5xl → text-6xl (mobile → tablet → desktop)
 * Spacing: py-24 → py-32 (increased vertical rhythm)
 */
import Link from "next/link"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-32 md:py-40 lg:py-48">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-muted/30 via-background to-background" />
      
      <div className="mx-auto max-w-5xl">
        {/* Text content */}
        <div className="text-center">
          <h1 className="text-5xl font-semibold tracking-tight text-text-primary md:text-6xl lg:text-7xl leading-[1.1]">
            Make the right strategic bets — with evidence you can defend.
          </h1>
          <p className="mt-10 text-xl leading-relaxed text-text-secondary md:text-2xl lg:text-3xl max-w-4xl mx-auto">
            Plinth synthesizes live market signals into jobs, scores, and opportunities — so product and UX leaders can decide what to build, what to ignore, and why competitors won't easily follow.
          </p>
          <div className="mt-14 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="#outputs">
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-base px-8 py-6">
                View an example analysis
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" className="w-full sm:w-auto text-base px-8 py-6">
                Generate your own analysis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

