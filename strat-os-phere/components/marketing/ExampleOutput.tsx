/**
 * Example Output Section
 * 
 * Real data-driven snapshot showing a ranked opportunity with evidence count,
 * confidence scale, and next actions. This is a real Plinth run preview.
 * Section id: #example
 */
"use client"

import { MarketingSection } from "./MarketingSection"
import { MarketingContainer } from "./MarketingContainer"
import { Reveal } from "./motion"
import { Badge } from "@/components/ui/badge"
import { ConfidencePill } from "./ConfidencePill"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { FileText, TrendingUp, ArrowRight } from "lucide-react"

// Real example data (anonymized public input)
const exampleOpportunity = {
  title: "Grow B2B Sales",
  description: "Enterprise customers are evaluating SSO capabilities. Three competitors added this feature in the last 6 months.",
  confidence: "directional" as const,
  score: 76.8,
  evidenceCount: 13,
  evidenceSnippet: "Pricing pages show SSO in enterprise tiers • Documentation published 2 months ago • 43 upvotes on feature requests",
  nextAction: "Ship SSO in Q2",
  wouldChange: "If two competitors remove SSO from enterprise tiers or enterprise buyer feedback shifts priorities",
}

export function ExampleOutput() {
  return (
    <MarketingSection variant="muted" id="example">
      <MarketingContainer maxWidth="6xl">
        <Reveal>
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary mb-3">
              See a real example
            </h2>
            <p className="text-base sm:text-lg text-text-secondary">
              Here's what Plinth generates from a simple hunch
            </p>
          </div>
        </Reveal>

        <Reveal delay={60}>
          <div className={cn(
            "bg-white rounded-xl border-2 border-border-subtle shadow-lg overflow-hidden",
            "max-w-4xl mx-auto"
          )}>
            {/* Header with opportunity title and metrics */}
            <div className="bg-surface-muted/50 border-b border-border-subtle p-6">
              <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-2">
                    {exampleOpportunity.title}
                  </h3>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {exampleOpportunity.description}
                  </p>
                </div>
              </div>
              
              {/* Metrics row */}
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-accent-primary/10 rounded-lg px-3 py-1.5 border border-accent-primary/20">
                    <TrendingUp className="w-4 h-4 text-accent-primary" />
                    <span className="text-lg font-bold text-accent-primary">
                      {exampleOpportunity.score}%
                    </span>
                  </div>
                  <ConfidencePill level={exampleOpportunity.confidence} />
                </div>
                <Badge variant="secondary" className="text-xs">
                  <FileText className="w-3 h-3 mr-1" />
                  {exampleOpportunity.evidenceCount} citations
                </Badge>
              </div>
            </div>

            {/* Evidence preview */}
            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold text-text-primary mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Evidence
                </h4>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {exampleOpportunity.evidenceSnippet}
                </p>
              </div>

              {/* Next action */}
              <div className="pt-4 border-t border-border-subtle">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-accent-primary mt-0.5 shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-text-primary mb-1">
                      Next action: {exampleOpportunity.nextAction}
                    </p>
                    <p className="text-xs text-text-muted">
                      Would change if: {exampleOpportunity.wouldChange}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        {/* CTAs */}
        <Reveal delay={120}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Link href="/example" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                See More Examples
              </Button>
            </Link>
            <Link href="/new" className="w-full sm:w-auto">
              <Button variant="brand" size="lg" className="w-full sm:w-auto">
                Get Started
              </Button>
            </Link>
          </div>
        </Reveal>
      </MarketingContainer>
    </MarketingSection>
  )
}

