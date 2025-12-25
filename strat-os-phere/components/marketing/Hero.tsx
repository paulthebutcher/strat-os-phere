/**
 * Hero Section
 * 
 * Single-column narrative stack: headline + subhead, CTA row, artifact preview band.
 * Artifact-first design with compact, scannable preview.
 */
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DecisionFormationAnimation } from "./DecisionFormationAnimation"
import { microcopy } from "@/lib/copy/microcopy"
import { Reveal, HoverLift } from "./motion"
import { MarketingContainer } from "./MarketingContainer"

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 sm:pt-32 md:pt-40 lg:pt-48 pb-12 sm:pb-16 md:pb-24">
      {/* Subtle radial gradient background */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[1000px] opacity-[0.08]"
          style={{
            background: "radial-gradient(ellipse 1200px 1000px at 50% 0%, hsl(var(--accent-primary) / 0.1) 0%, transparent 70%)",
          }}
        />
      </div>

      {/* Main content: single-column narrative stack */}
      <div className="relative z-10">
        <MarketingContainer maxWidth="4xl">
          <div className="space-y-6 sm:space-y-8 md:space-y-10 text-center px-4 sm:px-0">
            {/* Hero headline */}
            <Reveal delay={0}>
              <h1 className={cn(
                "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight"
              )}>
                {microcopy.marketing.heroHeadline}
              </h1>
            </Reveal>
            
            {/* Subhead */}
            <Reveal delay={60}>
              <p className={cn(
                "text-sm sm:text-base md:text-lg leading-relaxed text-text-secondary max-w-2xl mx-auto"
              )}>
                {microcopy.marketing.heroSubhead}
              </p>
            </Reveal>
            
            {/* CTAs */}
            <Reveal delay={90}>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                <Link href="/example" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="brand"
                    className={cn(
                      "w-full sm:w-auto text-base px-6 sm:px-8 py-5 sm:py-6 min-h-[44px]",
                      HoverLift.className
                    )}
                  >
                    {microcopy.marketing.primaryCTA}
                  </Button>
                </Link>
                <Link href="/new" className="w-full sm:w-auto">
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className={cn(
                      "w-full sm:w-auto border-2 hover:bg-accent-primary/5 min-h-[44px]",
                      HoverLift.subtle
                    )}
                  >
                    {microcopy.marketing.secondaryCTA}
                  </Button>
                </Link>
              </div>
            </Reveal>
            
            {/* Microcopy under CTAs */}
            <Reveal delay={120}>
              <p className={cn(
                "text-xs md:text-sm text-text-muted"
              )}>
                {microcopy.marketing.heroTagline}
              </p>
            </Reveal>
          </div>

          {/* Decision formation animation */}
          <div className="mt-12 sm:mt-16 md:mt-20 px-4 sm:px-0">
            <Reveal delay={150}>
              <div className="space-y-4 text-center mb-8">
                <p className="text-lg sm:text-xl md:text-2xl font-medium text-text-primary">
                  Watch how a decision takes shape.
                </p>
              </div>
              <DecisionFormationAnimation />
              <div className="mt-6 text-center">
                <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
                  From a rough idea to a call you can defend — with evidence attached.
                </p>
              </div>
            </Reveal>
          </div>
        </MarketingContainer>
      </div>
    </section>
  )
}
