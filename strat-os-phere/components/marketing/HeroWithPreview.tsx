/**
 * Hero With Preview Section
 * 
 * Product-led hero with large product screenshot on right side.
 * Shows opportunities list + Decision Brief visible with light annotations.
 */
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { HeroPreview } from "./previews/HeroPreview"
import { Reveal, HoverLift } from "./motion"
import { MarketingContainer } from "./MarketingContainer"
import { Badge } from "@/components/ui/badge"

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

      {/* Main content: two-column layout */}
      <div className="relative z-10">
        <MarketingContainer maxWidth="7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Left: Copy and CTAs */}
            <div className="space-y-6 sm:space-y-8">
              <Reveal delay={0}>
                <h1 className={cn(
                  "text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-semibold tracking-tight leading-tight text-text-primary"
                )}>
                  Make decisions you can defend.
                </h1>
              </Reveal>
              
              <Reveal delay={60}>
                <p className={cn(
                  "text-base sm:text-lg md:text-xl leading-relaxed text-text-secondary"
                )}>
                  Ranked opportunities, real evidence, and explicit confidence boundaries.
                </p>
              </Reveal>

              <Reveal delay={90}>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
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
              </Reveal>
            </div>

            {/* Right: Product Preview with Annotations */}
            <Reveal delay={120}>
              <div className="relative">
                {/* Product Screenshot */}
                <div className="relative rounded-xl border-2 border-border-subtle shadow-2xl overflow-hidden bg-white">
                  <HeroPreview />
                  
                  {/* Light annotations overlay */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur-sm">
                      Ranked by evidence strength
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <Badge variant="secondary" className="text-xs bg-white/90 backdrop-blur-sm">
                      Sources attached
                    </Badge>
                  </div>
                </div>
                
                {/* Floating annotation */}
                <div className="absolute -bottom-4 -right-4 bg-white rounded-lg border border-border-subtle shadow-lg p-3 max-w-[200px] hidden lg:block">
                  <p className="text-xs text-text-secondary">
                    <span className="font-semibold text-text-primary">What would change this call?</span>
                    <br />
                    Confidence boundaries are explicit
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </MarketingContainer>
      </div>
    </section>
  )
}

