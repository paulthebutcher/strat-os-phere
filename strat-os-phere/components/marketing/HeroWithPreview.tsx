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
    <section className="relative overflow-hidden pt-20 md:pt-24 pb-8 sm:pb-12 md:pb-16">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] opacity-[0.08]"
          style={{
            background: "radial-gradient(ellipse 1200px 1000px at 50% 0%, hsl(var(--accent-primary) / 0.1) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main content: stacked layout */}
      <div className="relative z-10">
        <MarketingContainer maxWidth="6xl">
          <div className="flex flex-col gap-6 sm:gap-8 md:gap-10">
            {/* Top: Copy and CTAs - PRIMARY READING PATH */}
            <div className="max-w-[55ch] mx-auto text-center space-y-5 sm:space-y-6">
              <Reveal delay={0}>
                <h1 className={cn(
                  "editorial-headline mx-auto"
                )}>
                  Find your <span className="editorial-gradient-text">unfair advantage</span>.
                </h1>
              </Reveal>
              
              <Reveal delay={60}>
                <p className={cn(
                  "editorial-body text-text-primary max-w-[55ch] mx-auto"
                )}>
                  Turn competitive evidence into strategic bets you can defend in skeptical rooms.
                </p>
              </Reveal>

              <Reveal delay={90}>
                <div className="flex flex-col items-center gap-2.5">
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
                        See an example decision
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
                  <p className="editorial-meta mt-0.5">Built for leaders who need more than analysis—they need conviction.</p>
                </div>
              </Reveal>
            </div>

            {/* Bridge copy above artifact */}
            <Reveal delay={120}>
              <p className="text-center editorial-meta max-w-[65ch] mx-auto">
                The answer. Documented. Defensible.
              </p>
            </Reveal>

            {/* Hero Artifact: Large, centered deliverable */}
            <div className="max-w-6xl mx-auto w-full">
              <div className="shadow-2xl rounded-xl overflow-hidden border-2 border-slate-200/50">
                <HeroReadoutReveal variant="full" />
              </div>
              {/* Editorial footnote: time & effort cue */}
              <p className="text-center editorial-meta mt-4 text-text-secondary">
                Analyzed 47 sources across 4 evidence types · Generated in 3.2 minutes
              </p>
            </div>
          </div>
        </MarketingContainer>
      </div>
    </section>
  )
}

