/**
 * Hero Section
 * 
 * Centered layout with header above and decision credibility visual below.
 * Single static visual that communicates value in one frame.
 */
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DecisionCredibilityVisual } from "./DecisionCredibilityVisual"
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

      {/* Main content: centered layout */}
      <div className="relative z-10">
        <MarketingContainer maxWidth="7xl">
          <div className="space-y-8 sm:space-y-12">
            {/* Section header */}
            <div className="text-center space-y-4">
              <Reveal delay={0}>
                <h2 className={cn(
                  "text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-text-primary",
                  "lg:whitespace-nowrap"
                )}>
                  Stand behind your strategy.
                </h2>
              </Reveal>
              
              <Reveal delay={60}>
                <p className={cn(
                  "text-base sm:text-lg md:text-xl leading-relaxed text-text-secondary max-w-3xl mx-auto"
                )}>
                  Evidence-backed insights that hold up in real conversations. Not just docs.
                </p>
              </Reveal>
            </div>

            {/* Main visual */}
            <Reveal delay={90}>
              <DecisionCredibilityVisual />
            </Reveal>

            {/* Footer line and CTAs */}
            <Reveal delay={120}>
              <div className="text-center space-y-6">
                <p className={cn(
                  "text-sm sm:text-base text-text-secondary"
                )}>
                  From a rough idea to clarity you can trust. Evidence attached.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link href="/new" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="brand"
                      className={cn(
                        "w-full sm:w-auto text-base px-6 sm:px-8 py-5 sm:py-6 min-h-[44px]",
                        HoverLift.className
                      )}
                    >
                      Pressure-test an idea
                    </Button>
                  </Link>
                  <Link href="/example" className="w-full sm:w-auto">
                    <Button 
                      size="lg" 
                      variant="outline" 
                      className={cn(
                        "w-full sm:w-auto border-2 hover:bg-accent-primary/5 min-h-[44px]",
                        HoverLift.subtle
                      )}
                    >
                      See a sample brief
                    </Button>
                  </Link>
                </div>
              </div>
            </Reveal>
          </div>
        </MarketingContainer>
      </div>
    </section>
  )
}
