/**
 * Full Width Product Preview Section
 * 
 * Full-width screenshot of Decision Brief with confidence range and "What would change this call".
 * Right-aligned overlay copy.
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { cn } from "@/lib/utils"
import { ConfidencePill } from "./ConfidencePill"
import { Badge } from "@/components/ui/badge"
import { FileText, TrendingUp } from "lucide-react"

// Decision Brief Preview Component
function DecisionBriefPreview() {
  return (
    <div className="bg-white rounded-lg border-2 border-border-subtle shadow-xl overflow-hidden">
      {/* Header */}
      <div className="bg-surface-muted/50 border-b border-border-subtle p-4 sm:p-6">
        <h3 className="text-lg sm:text-xl font-semibold text-text-primary mb-2">
          Decision Brief
        </h3>
        <p className="text-sm text-text-secondary">
          Enterprise customers are evaluating SSO capabilities
        </p>
      </div>

      {/* Main content */}
      <div className="p-4 sm:p-6 space-y-6">
        {/* Recommendation */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-5 h-5 text-accent-primary" />
            <h4 className="text-base font-semibold text-text-primary">Recommendation</h4>
          </div>
          <p className="text-sm text-text-secondary mb-4">
            Ship SSO in Q2 to match competitor positioning. Three competitors added this feature in the last 6 months.
          </p>
          <div className="flex items-center gap-3">
            <ConfidencePill level="directional" />
            <Badge variant="secondary" className="text-xs">
              <FileText className="w-3 h-3 mr-1" />
              14 citations
            </Badge>
          </div>
        </div>

        {/* Confidence range */}
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-xs font-semibold text-text-primary mb-2">Confidence range</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-surface-muted rounded-full overflow-hidden">
              <div className="h-full bg-accent-primary w-[78%]" />
            </div>
            <span className="text-xs font-semibold text-text-secondary">78%</span>
          </div>
        </div>

        {/* What would change this call */}
        <div className="pt-4 border-t border-border-subtle">
          <p className="text-xs font-semibold text-text-primary mb-2">What would change this call?</p>
          <p className="text-sm text-text-secondary">
            If competitor pricing shifts or new market data emerges, confidence would decrease. Monitor pricing pages monthly.
          </p>
        </div>
      </div>
    </div>
  )
}

export function FullWidthProductPreview() {
  return (
    <MarketingSection variant="default" id="decision-preview">
      <MarketingContainer maxWidth="7xl">
        <Reveal>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3">
              See the decision, not the dashboard
            </h2>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className="relative">
            {/* Full-width preview */}
            <div className="w-full">
              <DecisionBriefPreview />
            </div>

            {/* Right-aligned overlay copy */}
            <div className="mt-8 md:mt-0 md:absolute md:top-1/2 md:right-8 md:-translate-y-1/2 md:max-w-[280px]">
              <div className="bg-white/95 backdrop-blur-sm rounded-lg border border-border-subtle shadow-lg p-4 sm:p-6 space-y-4">
                <p className="text-sm font-semibold text-text-primary">
                  Not a score. A recommendation.
                </p>
                <p className="text-xs text-text-secondary leading-relaxed">
                  Confidence is explicit. Uncertainty is visible.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

