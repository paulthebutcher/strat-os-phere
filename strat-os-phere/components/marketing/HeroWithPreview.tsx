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
    <section className="relative overflow-hidden pt-16 sm:pt-24 md:pt-32 lg:pt-40 pb-8 sm:pb-12 md:pb-16">
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
          <div className="flex flex-col gap-4 sm:gap-6 md:gap-8">
            {/* Top: Copy and CTAs */}
            <div className="max-w-3xl mx-auto text-center space-y-4 sm:space-y-6">
              <Reveal delay={0}>
                <h1 className={cn(
                  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-text-primary"
                )}>
                  Make decisions you can defend
                </h1>
              </Reveal>
              
              <Reveal delay={60}>
                <p className={cn(
                  "text-base sm:text-lg md:text-xl leading-relaxed text-text-secondary max-w-[90ch] mx-auto"
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
                        See the full receipt
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-text-muted">Takes ~2 minutes. No login required.</p>
                </div>
              </Reveal>
            </div>

            {/* Below: Decision Brief Preview - immediately after CTAs */}
            <Reveal delay={120}>
              <div className="max-w-6xl mx-auto w-full">
                <PreviewArtifact
                  title=""
                  subtitle=""
                  callouts={[]}
                >
                  <DecisionBriefPreview />
                </PreviewArtifact>
                
                {/* Interactive affordance */}
                <div className="mt-3 px-1 text-center sm:text-left">
                  <Link 
                    href="/example" 
                    className="text-sm text-accent-primary hover:text-accent-primary/80 font-medium inline-flex items-center gap-1 transition-colors"
                  >
                    Click to see a real decision →
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

