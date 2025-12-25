/**
 * Clear Next Moves Section
 * 
 * Screenshot preview of "What would change this call" + Next Steps.
 * Shows that Plinth doesn't just tell you what to do — it tells you what would increase confidence.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react"

// Next Moves Preview Component
function NextMovesPreview() {
  return (
    <div className="bg-white rounded-lg border-2 border-border-subtle shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-surface-muted/50 border-b border-border-subtle p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
          Next Steps
        </h3>
        <p className="text-sm text-text-secondary">
          Clear actions and confidence conditions
        </p>
      </div>

      {/* Main content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Recommended action */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <h4 className="text-base font-semibold text-text-primary">Recommended action</h4>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
            <p className="text-sm font-semibold text-text-primary mb-1">
              Ship SSO in Q2
            </p>
            <p className="text-xs text-text-secondary">
              High confidence based on competitor analysis and market signals
            </p>
          </div>
        </div>

        {/* What would change this call */}
        <div className="pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-amber-600" />
            <h4 className="text-base font-semibold text-text-primary">What would change this call?</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 rounded-lg border border-border-subtle bg-amber-50/50">
              <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary mb-1">
                  Competitor pricing shifts
                </p>
                <p className="text-xs text-text-secondary">
                  Monitor pricing pages monthly for changes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border border-border-subtle bg-amber-50/50">
              <ArrowRight className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-text-primary mb-1">
                  New market data emerges
                </p>
                <p className="text-xs text-text-secondary">
                  Track industry reports and competitor announcements
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Confidence increase actions */}
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-xs font-semibold text-text-primary mb-2">To increase confidence</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />
              <span>Collect additional pricing data from 2 more competitors</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-text-secondary">
              <span className="w-1.5 h-1.5 rounded-full bg-accent-primary shrink-0" />
              <span>Review customer feedback on SSO requirements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ClearNextMoves() {
  return (
    <MarketingSection variant="muted" id="next-moves">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3">
              Clear next moves
            </h2>
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mx-auto">
              Plinth doesn't just tell you what to do — it tells you what would increase confidence.
            </p>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="max-w-4xl mx-auto">
            <NextMovesPreview />
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

