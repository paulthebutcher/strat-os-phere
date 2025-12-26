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
import { PreviewArtifact } from "./PreviewArtifact"
import { Reveal, HoverLift } from "./motion"
import { MarketingContainer } from "./MarketingContainer"

export function HeroWithPreview() {
  return (
    <section className="relative overflow-hidden pt-16 md:pt-20 pb-8 sm:pb-12 md:pb-16">
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
          <div className="flex flex-col gap-3 sm:gap-4 md:gap-5">
            {/* Top: Copy and CTAs */}
            <div className="max-w-[1100px] mx-auto text-center space-y-3 sm:space-y-4">
              <Reveal delay={0}>
                <h1 className={cn(
                  "text-3xl sm:text-4xl md:text-5xl lg:text-5xl xl:text-6xl font-semibold tracking-tight leading-tight text-text-primary",
                  "lg:whitespace-nowrap"
                )}>
                  Clarity that holds up
                </h1>
              </Reveal>
              
              <Reveal delay={60}>
                <p className={cn(
                  "text-base sm:text-lg md:text-xl leading-relaxed text-text-secondary max-w-[90ch] mx-auto"
                )}>
                  When the stakes are high and the room is skeptical, evidence beats instinct.
                </p>
              </Reveal>

              <Reveal delay={90}>
                <div className="flex flex-col items-center gap-2.5">
                  <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3 justify-center items-center w-full">
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
                        See a real readout →
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-text-muted mt-0.5">Takes ~2 minutes. No login required.</p>
                </div>
              </Reveal>
            </div>

            {/* Below: Decision Brief Preview - immediately after CTAs */}
            <Reveal delay={120}>
              <div className="max-w-6xl mx-auto w-full">
                <div className="max-h-[420px] lg:max-h-[520px] overflow-hidden">
                  <PreviewArtifact
                    title=""
                    subtitle=""
                    callouts={[]}
                  >
                    <DecisionBriefPreview />
                  </PreviewArtifact>
                </div>
                
                {/* Interactive affordance */}
              </div>
            </Reveal>
          </div>
        </MarketingContainer>
      </div>
    </section>
  )
}

