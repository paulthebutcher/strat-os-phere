/**
 * Example Output Section
 * 
 * Shows a detailed example of what Plinth generates.
 * Includes an opportunity card with citations and scoring breakdown.
 */
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"

export function ExampleOutput() {
  return (
    <MarketingSection variant="default" id="example-output">
      <MarketingContainer maxWidth="6xl">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-4">
            Example output
          </h2>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            See what a ranked opportunity looks like with citations, confidence, and scoring breakdown.
          </p>
        </div>
        
        <div className="max-w-3xl mx-auto">
          {/* Example opportunity card */}
          <div className="rounded-xl border-2 border-border-subtle shadow-lg bg-surface overflow-hidden">
            {/* Card header */}
            <div className="p-5 bg-surface-muted/50 border-b border-border-subtle">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <Badge variant="primary" className="text-sm font-semibold px-3 py-1">8.7</Badge>
                  <span className="text-sm text-text-muted">High confidence</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">12 sources</Badge>
                  <Badge variant="secondary" className="text-xs">4 evidence types</Badge>
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
                <p className="text-sm leading-relaxed text-text-secondary">
                  Three competitors now offer SSO in their enterprise tiers. This is a table-stakes feature for B2B positioning, with strong evidence from pricing pages and feature requests.
                </p>
              </div>
              
              {/* Top evidence citations */}
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-3">Top evidence citations</h4>
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
              
              {/* Scoring breakdown */}
              <div className="pt-4 border-t border-border-subtle">
                <h4 className="text-sm font-semibold text-text-primary mb-3">Scoring breakdown</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted">Evidence strength</p>
                    <p className="text-lg font-semibold text-text-primary">8.9</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted">Defensibility</p>
                    <p className="text-lg font-semibold text-text-primary">8.5</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted">Market timing</p>
                    <p className="text-lg font-semibold text-text-primary">8.2</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-text-muted">Strategic fit</p>
                    <p className="text-lg font-semibold text-text-primary">9.1</p>
                  </div>
                </div>
              </div>
              
              {/* VP-ready framing note */}
              <div className="pt-4 border-t border-border-subtle">
                <p className="text-xs text-text-muted italic">
                  "This is a table-stakes feature for B2B positioning. Three competitors have it in enterprise tiers. The evidence is strong and recent. This should be prioritized in Q2."
                </p>
              </div>
            </div>
          </div>
          
          {/* CTA */}
          <div className="mt-8 text-center">
            <Link href="/samples">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                View more examples
              </Button>
            </Link>
          </div>
        </div>
      </MarketingContainer>
    </MarketingSection>
  )
}

