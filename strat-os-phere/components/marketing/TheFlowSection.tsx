/**
 * The Flow (Clean 3-Step Timeline)
 * 
 * A clean horizontal timeline showing:
 * 1. Input (question + market chips)
 * 2. Evidence (sources count + types + competitor coverage)
 * 3. Output (readout crop: recommendation + score + sources)
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { HeroMoment } from "./HeroMoment"
import { cn } from "@/lib/utils"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Micro-visual: Input card mock
function InputCardVisual() {
  return (
    <div className="p-4 rounded-lg bg-white border border-border-subtle shadow-sm space-y-3">
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-text-primary">
          Should we introduce a free tier?
        </h4>
        <p className="text-xs text-text-secondary">
          Market: Incident management tools
        </p>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border-subtle">
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
          Pricing
        </Badge>
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
          Reviews
        </Badge>
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
          Docs
        </Badge>
      </div>
    </div>
  )
}

// Micro-visual: Evidence collection state
function EvidenceStateVisual() {
  return (
    <div className="p-4 rounded-lg bg-white border border-border-subtle shadow-sm space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-primary">Sources</span>
          <span className="text-xs text-text-secondary">8 found</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-text-primary">Competitors</span>
          <span className="text-xs text-text-secondary">5 analyzed</span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 pt-2 border-t border-border-subtle">
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
          Pricing
        </Badge>
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
          Reviews
        </Badge>
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
          Docs
        </Badge>
        <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
          Positioning
        </Badge>
      </div>
    </div>
  )
}

// Micro-visual: Readout crop
function ReadoutCropVisual() {
  return (
    <div className="rounded-lg overflow-hidden shadow-lg border border-border-subtle">
      <HeroMoment variant="cropped-recommendation" className="min-h-[180px]" />
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
              Question to evidence to readout. This holds up.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="space-y-6 sm:space-y-8">
            {/* 3-step horizontal timeline */}
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
              {/* Step 1: Input */}
              <div className={cn(
                "flex flex-col items-center text-center space-y-4 flex-1 w-full lg:w-auto"
              )}>
                <div className="w-full">
                  <div className="rounded-lg bg-surface/50 border border-border-subtle p-4">
                    <InputCardVisual />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-text-primary">
                    Bring the question
                  </h3>
                  <p className="text-xs text-text-secondary">
                    A hunch, a market, a bet you're considering.
                  </p>
                </div>
              </div>

              {/* Arrow 1 (desktop) / Down chevron (mobile) */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-6 h-6 text-text-muted" />
              </div>
              <div className="flex lg:hidden items-center justify-center py-2">
                <ChevronDown className="w-5 h-5 text-text-muted" />
              </div>

              {/* Step 2: Evidence */}
              <div className={cn(
                "flex flex-col items-center text-center space-y-4 flex-1 w-full lg:w-auto"
              )}>
                <div className="w-full">
                  <div className="rounded-lg bg-surface/50 border border-border-subtle p-4">
                    <EvidenceStateVisual />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-text-primary">
                    We bring the proof
                  </h3>
                  <p className="text-xs text-text-secondary">
                    Pricing, docs, reviews, changelogs. Tagged and inspectable.
                  </p>
                </div>
              </div>

              {/* Arrow 2 (desktop) / Down chevron (mobile) */}
              <div className="hidden lg:flex items-center justify-center flex-shrink-0">
                <ArrowRight className="w-6 h-6 text-text-muted" />
              </div>
              <div className="flex lg:hidden items-center justify-center py-2">
                <ChevronDown className="w-5 h-5 text-text-muted" />
              </div>

              {/* Step 3: Output */}
              <div className={cn(
                "flex flex-col items-center text-center space-y-4 flex-1 w-full lg:w-auto"
              )}>
                <div className="w-full">
                  <ReadoutCropVisual />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-semibold text-text-primary">
                    You walk in prepared
                  </h3>
                  <p className="text-xs text-text-secondary">
                    One clear point of view. Sources attached. Uncertainty shown.
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
