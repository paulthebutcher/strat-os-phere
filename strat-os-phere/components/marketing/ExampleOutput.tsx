/**
 * Example Output Section
 * 
 * Shows a single annotated opportunity with confidence boundaries.
 * Section id: #example
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

export function ExampleOutput() {
  return (
    <MarketingSection variant="muted" id="example">
      <MarketingContainer maxWidth="6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            One opportunity. Clear boundaries.
          </h2>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {/* Example opportunity card */}
          <div className="rounded-xl border-2 border-border-subtle shadow-lg bg-surface overflow-hidden">
            {/* Card header with confidence level */}
            <div className="p-5 bg-surface-muted/50 border-b border-border-subtle">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Badge variant="default" className="text-sm font-semibold px-3 py-1 bg-accent-primary/10 text-accent-primary border-accent-primary/20">
                    Directional
                  </Badge>
                  <span className="text-sm text-text-muted">Safe to prioritize discovery</span>
                </div>
              </div>
            </div>
            
            {/* Card body */}
            <div className="p-6 space-y-5">
              {/* Title */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  Launch enterprise SSO to match competitor positioning
                </h3>
              </div>
              
              {/* Citations */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Citations</h4>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-surface-muted/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-1.5 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">Competitor A pricing page</p>
                      <p className="text-xs text-text-secondary mt-0.5">Enterprise tier includes SSO • Updated 2 weeks ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-surface-muted/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-1.5 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">Competitor B documentation</p>
                      <p className="text-xs text-text-secondary mt-0.5">SSO integration guide published • Updated 1 month ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-surface-muted/30">
                    <div className="w-1.5 h-1.5 rounded-full bg-accent-primary mt-1.5 shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary">Review site feature request</p>
                      <p className="text-xs text-text-secondary mt-0.5">Top-voted request: "Enterprise SSO support" • 47 upvotes</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* What this is safe to decide */}
              <div className="pt-4 border-t border-border-subtle">
                <h4 className="text-sm font-semibold text-text-primary mb-3">What this is safe to decide</h4>
                <p className="text-sm leading-relaxed text-text-secondary">
                  Multiple competitors have this in enterprise tiers. This is worth prioritizing discovery and scoping—the evidence suggests it's table-stakes for B2B positioning.
                </p>
              </div>
              
              {/* What would increase confidence */}
              <div className="pt-4 border-t border-border-subtle">
                <h4 className="text-sm font-semibold text-text-primary mb-3">What would increase confidence</h4>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-text-secondary text-sm">•</span>
                    <span className="text-sm leading-relaxed text-text-secondary">
                      Customer interview data confirming SSO as a deal-breaker (not just nice-to-have)
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-text-secondary text-sm">•</span>
                    <span className="text-sm leading-relaxed text-text-secondary">
                      Pricing evidence showing SSO drives enterprise tier upsells
                    </span>
                  </li>
                </ul>
              </div>
              
              {/* Why this surfaced */}
              <div className="pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-muted italic">
                  This surfaced because three competitors have SSO in enterprise tiers, and it's a top-voted feature request. The signals align, but we don't yet know if it's a deal-breaker or just expected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

