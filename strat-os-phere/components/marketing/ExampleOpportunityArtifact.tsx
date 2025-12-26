/**
 * ExampleOpportunityArtifact
 * 
 * Client component that displays a single opportunity with all its details.
 * Includes interactive elements like expandable assumptions section.
 */
"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { GlassPanel } from "./GlassPanel"
import { CitationList, type Citation } from "./CitationList"
import { type ExampleOpportunity } from "@/lib/examples/opportunities"
import { cn } from "@/lib/utils"

interface ExampleOpportunityArtifactProps {
  opportunity: ExampleOpportunity
}

export function ExampleOpportunityArtifact({ opportunity }: ExampleOpportunityArtifactProps) {
  const [assumptionsExpanded, setAssumptionsExpanded] = useState(false)

  // Convert evidence to Citation format
  const citations: Citation[] = opportunity.evidence.map((ev) => {
    // Extract domain from URL
    let domain = ev.url.replace(/^https?:\/\//, "").split("/")[0]
    domain = domain.replace(/^www\./, "")
    
    return {
      domain,
      type: ev.sourceType,
      excerpt: ev.excerpt,
      url: ev.url,
    }
  })

  const confidenceLabel: Record<string, string> = {
    exploratory: "Safe to explore; not yet safe to fully invest.",
    directional: "Safe to prioritize discovery; not yet safe to fully invest.",
    investment_ready: "Safe to invest; evidence converges and risks are explicit.",
  }

  return (
    <div className="space-y-8">
      {/* Title + Confidence */}
      <div className="space-y-4">
        <h2 className="text-2xl md:text-3xl font-semibold text-text-primary">
          {opportunity.title}
        </h2>
        <p className="text-sm text-text-secondary">
          {confidenceLabel[opportunity.confidenceLevel]}
        </p>
        <p className="text-xs text-text-muted italic">
          This confidence boundary prevents false precision. Plinth tells you when it's safe to explore vs. invest.
        </p>
      </div>

      {/* What to do */}
      <GlassPanel className="p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-3">
          What to do
        </h3>
        <p className="text-base text-text-secondary leading-relaxed">
          {opportunity.safeToDecide}
        </p>
      </GlassPanel>

      {/* Why this matters */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Why this matters
        </h3>
        <GlassPanel className="p-6">
          <ul className="space-y-3 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Converging signals show clear demand and competitive gaps across pricing pages, user reviews, and competitor roadmaps.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Evidence spans multiple independent sources, indicating this isn't an isolated trend.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-1">•</span>
              <span>Competitors are actively investing, suggesting market validation and strategic importance.</span>
            </li>
          </ul>
        </GlassPanel>
      </div>

      {/* Why this ranks */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Why this ranks
        </h3>
        <GlassPanel className="p-6">
          <div className="space-y-4">
            {opportunity.scoringBreakdown.map((driver, index) => (
              <div key={index} className="border-b border-border-subtle last:border-0 pb-4 last:pb-0">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h4 className="text-sm font-medium text-text-primary">
                    {driver.driver}
                  </h4>
                  <span className={cn(
                    "text-xs px-2 py-1 rounded",
                    driver.direction === "up" 
                      ? "bg-green-50 text-green-700" 
                      : "bg-amber-50 text-amber-700"
                  )}>
                    {driver.direction === "up" ? "↑" : "↓"}
                  </span>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {driver.explanation}
                </p>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {/* Evidence */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Evidence
        </h3>
        <CitationList citations={citations} />
        <p className="text-xs text-text-muted italic mt-4">
          This is why citations matter. Every claim is traceable to a source, so you can verify and understand context.
        </p>
      </div>

      {/* What would increase confidence */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          What would increase confidence
        </h3>
        <GlassPanel className="p-6">
          <ul className="space-y-3">
            {opportunity.whatWouldIncreaseConfidence.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <input
                  type="checkbox"
                  disabled
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                />
                <span className="text-sm text-text-secondary leading-relaxed flex-1">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </GlassPanel>
      </div>

      {/* Assumptions + Risks (collapsed) */}
      <div>
        <button
          onClick={() => setAssumptionsExpanded(!assumptionsExpanded)}
          className="flex items-center justify-between w-full text-left"
        >
          <h3 className="text-lg font-semibold text-text-primary">
            Assumptions + Risks
          </h3>
          {assumptionsExpanded ? (
            <ChevronUp className="h-5 w-5 text-text-secondary" />
          ) : (
            <ChevronDown className="h-5 w-5 text-text-secondary" />
          )}
        </button>
        {assumptionsExpanded && (
          <GlassPanel className="p-6 mt-4">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">
                  Assumptions
                </h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• User demand signals from reviews translate to willingness to pay</li>
                  <li>• Competitor mobile investment indicates market maturity</li>
                  <li>• Premium pricing positioning reflects actual market value</li>
                </ul>
              </div>
              <div>
                <h4 className="text-sm font-medium text-text-primary mb-2">
                  Risks
                </h4>
                <ul className="space-y-2 text-sm text-text-secondary">
                  <li>• Specific mobile workflows that justify native apps need validation</li>
                  <li>• Adoption friction in onboarding could reduce user willingness to switch</li>
                  <li>• Technical implementation complexity may be higher than estimated</li>
                </ul>
              </div>
            </div>
            <p className="text-xs text-text-muted italic mt-4">
              These are the assumptions that could flip the decision. Plinth makes them explicit so you can validate them.
            </p>
          </GlassPanel>
        )}
      </div>
    </div>
  )
}

