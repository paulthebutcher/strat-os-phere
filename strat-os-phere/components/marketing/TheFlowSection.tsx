/**
 * The Flow (Still Image-First)
 * 
 * A simplified 3-panel visual, all pointing toward the same hero readout:
 * 1. Input (hunch / question)
 * 2. Evidence (logos, docs, reviews)
 * 3. Output (the hero screenshot again)
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal, Stagger } from "./motion"
import { HeroMoment } from "./HeroMoment"
import { cn } from "@/lib/utils"
import { ArrowRight } from "lucide-react"

export function TheFlowSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              From hunch to proof.
            </h2>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center text-sm text-text-secondary">
              <span>You bring the question</span>
              <span className="hidden sm:inline">·</span>
              <span>Plinth does the digging</span>
              <span className="hidden sm:inline">·</span>
              <span>You get something defensible</span>
            </div>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="space-y-6 sm:space-y-8">
            {/* 3-panel flow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-center">
              {/* Panel 1: Input */}
              <div className={cn(
                "p-6 rounded-lg bg-surface/50 border border-border-subtle",
                "text-center space-y-3"
              )}>
                <div className={cn(
                  "rounded-lg border border-border-subtle bg-surface-muted/30",
                  "aspect-video flex items-center justify-center mb-3"
                )}>
                  <p className="text-xs text-text-muted px-2 text-center">
                    Question / Hunch
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    You bring
                  </h3>
                  <p className="text-xs text-text-secondary">
                    a question, a market, a hunch
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="w-6 h-6 text-text-muted" />
              </div>

              {/* Panel 2: Evidence */}
              <div className={cn(
                "p-6 rounded-lg bg-surface/50 border border-border-subtle",
                "text-center space-y-3"
              )}>
                <div className={cn(
                  "rounded-lg border border-border-subtle bg-surface-muted/30",
                  "aspect-video flex items-center justify-center mb-3"
                )}>
                  <p className="text-xs text-text-muted px-2 text-center">
                    Evidence gathering
                  </p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    Plinth does
                  </h3>
                  <p className="text-xs text-text-secondary">
                    the digging
                  </p>
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex justify-center">
                <ArrowRight className="w-6 h-6 text-text-muted" />
              </div>

              {/* Panel 3: Output (Hero readout) */}
              <div className={cn(
                "p-6 rounded-lg bg-surface/50 border border-border-subtle",
                "text-center space-y-3"
              )}>
                <div className="rounded-lg overflow-hidden shadow-lg">
                  <HeroMoment variant="full" className="min-h-[200px]" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary mb-1">
                    You get
                  </h3>
                  <p className="text-xs text-text-secondary">
                    something defensible
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

