/**
 * The Flow - Guided reveal animation
 * 
 * Animated left → right progression:
 * 1. Blur + fade chaos inputs
 * 2. Snap into fully rendered Plinth readout
 * 3. Emphasis pulse on recommendation, confidence, evidence count
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { HeroMoment } from "./HeroMoment"
import { ProblemEvidenceCollage } from "./ProblemEvidenceCollage"
import { cn } from "@/lib/utils"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ConfidencePill } from "./ConfidencePill"
import { useEffect, useState, useRef } from "react"
import { prefersReducedMotion } from "@/lib/motion/tokens"

// Tiny input card mock (small, muted) - animated to fade/blur
function InputCardVisual({ phase }: { phase: number }) {
  const shouldBlur = phase >= 2
  return (
    <div 
      className={cn(
        "p-3 rounded-lg bg-white/80 border border-border-subtle/60 shadow-sm space-y-2 transition-all duration-700",
        shouldBlur ? "opacity-40 blur-[2px]" : "opacity-75 blur-[0.5px]"
      )}
    >
      <div className="space-y-1.5">
        <h4 className="text-xs font-semibold text-text-primary">
          Should we introduce a free tier?
        </h4>
        <p className="text-[10px] text-text-secondary">
          Market: Incident management tools
        </p>
      </div>
      <div className="flex flex-wrap gap-1 pt-1.5 border-t border-border-subtle/50">
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
          Pricing
        </Badge>
        <Badge variant="secondary" className="text-[9px] px-1.5 py-0.5">
          Reviews
        </Badge>
      </div>
    </div>
  )
}

// Compact chaos thumbnail (medium, muted) - animated to blur/fade
function EvidenceChaosThumbnail({ phase }: { phase: number }) {
  const shouldBlur = phase >= 2
  return (
    <div 
      className={cn(
        "relative rounded-lg overflow-hidden border border-border-subtle/60 shadow-sm transition-all duration-700",
        shouldBlur ? "opacity-30 blur-[3px]" : "opacity-70 blur-[1px]"
      )}
    >
      <ProblemEvidenceCollage className="aspect-[4/3] scale-75 origin-center" />
    </div>
  )
}

// Full Plinth readout with proof strip (large, dominant) - animated snap-in with pulse
function ReadoutHeroVisual({ phase }: { phase: number }) {
  const [pulseKey, setPulseKey] = useState(0)
  const isVisible = phase >= 2
  const shouldPulse = phase >= 3

  useEffect(() => {
    if (!shouldPulse) return
    const timer = setTimeout(() => setPulseKey(k => k + 1), 500)
    return () => clearTimeout(timer)
  }, [shouldPulse, pulseKey])

  return (
    <div 
      className={cn(
        "relative rounded-xl overflow-hidden shadow-2xl border-2 border-border-subtle bg-white transition-all duration-500",
        isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"
      )}
    >
      {/* Plinth Readout tag */}
      <div className="absolute top-3 right-3 z-10 bg-accent-primary text-white text-[10px] px-2 py-1 rounded-full font-medium shadow-lg">
        Plinth Readout
      </div>
      
      {/* Main readout */}
      <div className="p-6 md:p-8">
        <HeroMoment variant="full" className="min-h-[500px]" />
      </div>
      
      {/* Proof strip at bottom with emphasis pulse */}
      <div 
        className={cn(
          "px-6 md:px-8 pb-6 md:pb-8 pt-4 border-t border-border-subtle bg-surface-muted/20 transition-all duration-500",
          shouldPulse && "bg-accent-primary/5"
        )}
        key={pulseKey}
      >
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <ConfidencePill level="investment_ready" className="text-[10px]" />
            <span className="text-text-secondary">Confidence shown</span>
          </div>
          <span className="text-text-muted">·</span>
          <div className="flex items-center gap-1.5">
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">8 sources</Badge>
            <span className="text-text-secondary">Evidence attached</span>
          </div>
          <span className="text-text-muted">·</span>
          <span className="text-text-secondary">One recommendation</span>
        </div>
      </div>
      
      {/* Subtle glow effect */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-accent-primary/20 pointer-events-none" />
    </div>
  )
}

export function TheFlowSection() {
  return (
    <MarketingSection variant="muted">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center space-y-4 sm:space-y-6 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary leading-tight">
              From hunch to proof.
            </h2>
            <p className="text-sm sm:text-base text-text-secondary max-w-2xl mx-auto">
              Bring a hunch. Get a readout you can defend.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="space-y-6 sm:space-y-8">
            {/* Weighted 3-step layout: [small] → [medium] → [large] */}
            <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-4">
              {/* Step 1: You bring (small, ~25%) */}
              <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4 flex-1 lg:flex-[0.25] w-full">
                <div className="w-full">
                  <InputCardVisual phase={1} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-text-primary">
                    You bring
                  </h3>
                  <p className="text-[10px] sm:text-xs text-text-secondary">
                    Where you think you might have an edge.
                  </p>
                </div>
              </div>

              {/* Arrow 1 (desktop) */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 px-2">
                <ArrowRight className="w-6 h-6 text-text-muted" />
              </div>
              
              {/* Mobile chevron 1 */}
              <div className="flex lg:hidden items-center justify-center py-2 w-full">
                <ChevronDown className="w-5 h-5 text-text-muted" />
              </div>

              {/* Step 2: Plinth does (medium, ~30%) */}
              <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4 flex-1 lg:flex-[0.3] w-full">
                <div className="w-full">
                  <EvidenceChaosThumbnail phase={1} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-text-primary">
                    Plinth does
                  </h3>
                  <p className="text-[10px] sm:text-xs text-text-secondary">
                    Competitors, pricing, docs, reviews—what the market actually shows.
                  </p>
                </div>
              </div>

              {/* Arrow 2 (desktop) */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0 px-2">
                <ArrowRight className="w-6 h-6 text-text-muted" />
              </div>
              
              {/* Mobile chevron 2 */}
              <div className="flex lg:hidden items-center justify-center py-2 w-full">
                <ChevronDown className="w-5 h-5 text-text-muted" />
              </div>

              {/* Step 3: You get (large, dominant, ~45%) */}
              <div className="flex flex-col items-center text-center space-y-3 lg:space-y-4 flex-1 lg:flex-[0.45] w-full">
                <div className="w-full">
                  <ReadoutHeroVisual phase={2} />
                </div>
                <div className="space-y-1">
                  <h3 className="text-xs sm:text-sm font-semibold text-text-primary">
                    You get
                  </h3>
                  <p className="text-[10px] sm:text-xs text-text-secondary">
                    One clear point of view, with proof attached.
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
