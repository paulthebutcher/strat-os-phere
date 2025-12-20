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
    <section className="relative mx-auto max-w-7xl px-4 py-24 md:py-32 lg:py-40">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-surface-muted/50 via-background to-background" />
      
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center lg:gap-16">
          {/* Text content */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl font-semibold tracking-tight text-text-primary md:text-6xl lg:text-7xl">
              Find your unfair advantage.
            </h1>
            <p className="mt-6 text-lg leading-relaxed text-text-secondary md:text-xl lg:text-2xl">
              Plinth is a strategy workspace that turns competitive noise into clear, defensible positioning.
              It helps teams see what competitors can't — and act on it.
            </p>
            <p className="mt-4 text-base font-medium text-text-muted md:text-lg">
              Strategy, grounded.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start">
              <Link href="/dashboard">
                <Button size="lg" className="w-full sm:w-auto">
                  Try Plinth
                </Button>
              </Link>
              <Link href="#outputs">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  See a sample
                </Button>
              </Link>
            </div>
          </div>
          
          {/* Placeholder illustration */}
          <div className="hidden lg:block">
            <div className="panel overflow-hidden border-2 border-border-subtle shadow-sm">
              <div className="aspect-[4/3] bg-gradient-to-br from-surface-muted via-surface to-surface-muted flex items-center justify-center relative">
                {/* Abstract geometric shapes as placeholder */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-20"
                  viewBox="0 0 400 300"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect x="50" y="50" width="120" height="80" rx="8" fill="currentColor" className="text-accent-primary" />
                  <circle cx="250" cy="100" r="40" fill="currentColor" className="text-accent-primary" />
                  <path d="M100 200 L200 150 L300 200 L250 250 L150 250 Z" fill="currentColor" className="text-accent-primary" />
                </svg>
                <div className="relative z-10 text-center px-8">
                  <p className="text-sm font-medium text-text-muted">Product illustration placeholder</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile: Product screenshot placeholder */}
        <div className="mt-16 lg:hidden">
          <div className="panel mx-auto max-w-4xl overflow-hidden border-2 border-border-subtle shadow-sm">
            <div className="aspect-video bg-gradient-to-br from-surface-muted via-surface to-surface-muted flex items-center justify-center">
              <p className="text-sm text-text-muted">[Product screenshot placeholder]</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

