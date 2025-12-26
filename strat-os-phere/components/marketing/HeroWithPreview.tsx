/**
 * Hero Section — The Artifact Demo (Explicit Exception)
 * 
 * The hero keeps the artifact demo with these constraints:
 * - It must feel like a deliverable, not a live app
 * - No tooltips, annotations, or UI chrome
 * - Framed as "the answer," not "a preview"
 * - This is the only place a realistic product artifact appears
 * 
 * The hero earns trust.
 * The rest of the page earns belief.
 */
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HeroReadoutReveal } from "./HeroReadoutReveal"
import { Reveal, HoverLift } from "./motion"
import { MarketingContainer } from "./MarketingContainer"

export function HeroWithPreview() {
  return (
    <section className="relative overflow-hidden pt-12 md:pt-24 pb-6 sm:pb-12 md:pb-16 w-full max-w-[100vw]">
      {/* Ambient background - softened and simplified */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1400px] h-[1400px] opacity-[0.04]"
          style={{
            background: "radial-gradient(circle 700px at 50% 50%, hsl(var(--accent-primary) / 0.08) 0%, transparent 65%)",
          }}
        />
      </div>

      {/* Main content: stacked layout */}
      <div className="relative z-10 w-full">
        {/* Hero text: truly centered in viewport */}
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center space-y-4 sm:space-y-5 md:space-y-6">
            <Reveal delay={0}>
              <h1 className={cn(
                "editorial-headline lg:max-w-none lg:whitespace-nowrap"
              )}>
                Find your <span className="editorial-gradient-text">unfair advantage</span>.
              </h1>
            </Reveal>
            
            <Reveal delay={60}>
              <div className="space-y-1.5 max-w-2xl">
                <p className={cn(
                  "editorial-body text-text-primary"
                )}>
                  Turn competitive evidence into strategic bets you can defend.
                </p>
                <p className={cn(
                  "editorial-meta text-text-secondary"
                )}>
                  Citations. Assumptions. Confidence.
                </p>
              </div>
            </Reveal>

            <Reveal delay={90}>
              <div className="flex flex-col items-center gap-3">
                <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center w-full">
                  <Link href="/example" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="brand"
                      className={cn(
                        "w-full sm:w-auto text-base px-6 sm:px-8 py-5 sm:py-6 min-h-[44px]",
                        HoverLift.className
                      )}
                    >
                      View example decision
                    </Button>
                  </Link>
                  <Link href="/how-plinth-thinks" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className={cn(
                        "w-full sm:w-auto border-2 hover:bg-accent-primary/5 min-h-[44px]",
                        HoverLift.subtle
                      )}
                    >
                      How it works
                    </Button>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Hero Artifact: Large, centered deliverable with more separation */}
        <div className="mt-12 sm:mt-16 md:mt-20 w-full px-4 sm:px-6 lg:px-8">
          <MarketingContainer maxWidth="6xl">
            <div className="relative">
              {/* Caption label */}
              <p className="text-center editorial-meta mb-2 text-text-muted">
                Example decision output
              </p>
              <div className="shadow-2xl rounded-xl overflow-hidden border-2 border-slate-200/50">
                <HeroReadoutReveal variant="full" />
              </div>
              {/* Editorial footnote: time & effort cue */}
              <p className="text-center editorial-meta mt-4 text-text-secondary">
                Analyzed 47 sources across 4 evidence types · Generated in 3.2 minutes
              </p>
            </div>
          </MarketingContainer>
        </div>
      </div>
    </section>
  )
}

