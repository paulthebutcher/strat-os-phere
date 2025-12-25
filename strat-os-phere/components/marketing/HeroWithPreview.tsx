/**
 * Hero With Preview Section
 * 
 * Stacked hero: copy on top, preview below.
 * Conversion-optimized layout with clear proof following claim.
 */
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { DecisionBriefPreview } from "./previews/DecisionBriefPreview"
import { Reveal, HoverLift } from "./motion"
import { MarketingContainer } from "./MarketingContainer"

export function HeroWithPreview() {
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

      {/* Main content: stacked layout */}
      <div className="relative z-10">
        <MarketingContainer maxWidth="6xl">
          <div className="flex flex-col gap-10 sm:gap-12 md:gap-16">
            {/* Top: Copy and CTAs */}
            <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
              <Reveal delay={0}>
                <h1 className={cn(
                  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-text-primary"
                )}>
                  Make decisions you can defend
                </h1>
              </Reveal>
              
              <Reveal delay={60}>
                <p className={cn(
                  "text-base sm:text-lg md:text-xl leading-relaxed text-text-secondary"
                )}>
                  Ranked opportunities, backed by real evidence and explicit confidence boundaries.
                </p>
              </Reveal>

              <Reveal delay={90}>
                <div className="flex flex-col items-center gap-3">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center w-full">
                    <Link href="/new" className="w-full sm:w-auto">
                      <Button 
                        size="lg" 
                        variant="brand"
                        className={cn(
                          "w-full sm:w-auto text-base px-6 sm:px-8 py-5 sm:py-6 min-h-[44px]",
                          HoverLift.className
                        )}
                      >
                        Try it on your idea
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
                        See a real decision
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-text-muted">No login required to start</p>
                </div>
              </Reveal>
            </div>

            {/* Below: Decision Brief Preview */}
            <Reveal delay={120}>
              <div className="max-w-5xl mx-auto w-full">
                {/* Artifact header */}
                <div className="flex items-center justify-between mb-3 px-1">
                  <div>
                    <h2 className="text-sm font-semibold text-text-primary mb-0.5">
                      Top Opportunities (Example)
                    </h2>
                    <p className="text-xs text-text-muted">
                      Ranked by evidence strength • Sources attached
                    </p>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    Example
                  </Badge>
                </div>

                {/* Preview container with background tint */}
                <div className="relative rounded-xl border-2 border-border-subtle shadow-2xl overflow-hidden bg-white">
                  {/* Subtle background tint */}
                  <div className="absolute inset-0 bg-surface-muted/30 pointer-events-none" />
                  <div className="relative">
                    <DecisionBriefPreview />
                  </div>
                </div>
                
                {/* Trust cues */}
                <div className="mt-6 flex flex-wrap justify-center items-center gap-4 sm:gap-6 text-xs text-text-muted">
                  <span>Citations included</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Confidence is explicit</span>
                  <span className="hidden sm:inline">•</span>
                  <span>Sources are inspectable</span>
                </div>
              </div>
            </Reveal>
          </div>
        </MarketingContainer>
      </div>
    </section>
  )
}

