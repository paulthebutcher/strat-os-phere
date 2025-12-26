/**
 * The Flow - From hunch to proof
 * 
 * Clean 3-step progression:
 * 1. Input Card (question + tags) - small, muted
 * 2. Signal Stack - medium, muted
 * 3. Decision Card - large, dominant, elevated
 * 
 * Visual weight clearly favors Step 3 (Plinth output).
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { DecisionCard } from "./DecisionCard"
import { SignalStack } from "./SignalStack"
import { cn } from "@/lib/utils"
import { ArrowRight, ChevronDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { sampleAnalysis } from "./sampleReadoutData"

// Input Card - Step 1: You bring (small, muted)
function InputCard() {
  return (
    <div className="p-4 rounded-lg bg-white/80 border border-border-subtle/60 shadow-sm space-y-2">
      <div className="space-y-1.5">
        <h4 className="text-sm font-semibold text-text-primary">
          {sampleAnalysis.decisionQuestion}
        </h4>
        <p className="text-xs text-text-secondary">
          Market: {sampleAnalysis.market}
        </p>
      </div>
      <div className="flex flex-wrap gap-1 pt-2 border-t border-border-subtle/50">
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
          Pricing
        </Badge>
        <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
          Reviews
        </Badge>
      </div>
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
              One clear recommendation, backed by sources you can open. Confidence that shows its work—scores, assumptions, and gaps are explicit.
            </p>
          </div>
        </Reveal>
        
        <Reveal delay={60}>
          <div className="space-y-6 sm:space-y-8">
            {/* Weighted 3-step layout: [1fr] → [1.2fr] → [2fr] with arrows */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1.2fr_auto_2fr] items-start gap-4 lg:gap-6">
              {/* Step 1: You bring (small) */}
              <div className="flex flex-col items-center text-center space-y-2 lg:space-y-3">
                <div className="w-full">
                  <InputCard />
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
              <div className="hidden lg:flex items-center justify-center self-center">
                <ArrowRight className="w-6 h-6 text-text-muted" />
              </div>
              
              {/* Mobile chevron 1 */}
              <div className="flex lg:hidden items-center justify-center py-2 w-full">
                <ChevronDown className="w-5 h-5 text-text-muted" />
              </div>

              {/* Step 2: Plinth does (medium) - Signal Stack */}
              <div className="flex flex-col items-center text-center space-y-2 lg:space-y-3">
                <div className="w-full">
                  <SignalStack variant="vertical" />
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
              <div className="hidden lg:flex items-center justify-center self-center">
                <ArrowRight className="w-6 h-6 text-text-muted" />
              </div>
              
              {/* Mobile chevron 2 */}
              <div className="flex lg:hidden items-center justify-center py-2 w-full">
                <ChevronDown className="w-5 h-5 text-text-muted" />
              </div>

              {/* Step 3: You get (large, dominant) - Decision Card */}
              <div className="flex flex-col items-center text-center space-y-2 lg:space-y-3">
                <div className="w-full relative">
                  {/* Subtle spotlight behind the card */}
                  <div 
                    className="absolute -inset-4 opacity-60 rounded-2xl pointer-events-none -z-10"
                    style={{
                      background: 'radial-gradient(circle at center, hsl(230 65% 50% / 0.1), hsl(230 65% 50% / 0.05), transparent)'
                    }}
                  />
                  <DecisionCard className="relative shadow-xl border-accent-primary/20" />
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
