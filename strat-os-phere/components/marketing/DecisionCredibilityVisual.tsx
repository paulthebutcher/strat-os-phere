/**
 * DecisionCredibilityVisual
 * 
 * Single static visual that communicates Plinth's value in one frame:
 * Recommendation, Evidence attached, Confidence boundaries, What would change the call, and Next steps.
 * 
 * Marketing-only component. No animation, no interaction - pure value communication.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { ConfidencePill } from "./ConfidencePill"
import { cn } from "@/lib/utils"
import { FileText, CheckCircle2 } from "lucide-react"

// Confidence range bar component
function ConfidenceRangeBar() {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs text-text-muted mb-1">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
      <div className="relative h-2 bg-surface-muted rounded-full overflow-hidden">
        {/* Background segments */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-amber-100" />
          <div className="flex-1 bg-blue-100" />
          <div className="flex-1 bg-green-100" />
        </div>
        {/* Indicator */}
        <div className="absolute left-1/3 top-0 bottom-0 w-1 bg-accent-primary" />
        <div className="absolute left-1/3 -translate-x-1/2 top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-accent-primary border-2 border-white" />
      </div>
      <p className="text-xs text-text-muted">
        Confidence is bounded by coverage, not vibes.
      </p>
    </div>
  )
}

export function DecisionCredibilityVisual() {
  const evidenceSources = [
    { type: "Pricing page", icon: FileText },
    { type: "Docs", icon: FileText },
    { type: "Enterprise reviews", icon: FileText },
  ]

  const nextSteps = [
    "Validate with 8 target teams",
    "Pull more evidence from docs + changelogs",
    "Run a lightweight prototype test",
  ]

  return (
    <div className="w-full max-w-[960px] mx-auto">
      {/* Main card */}
      <div className="bg-white rounded-xl border-2 border-border-subtle shadow-xl overflow-hidden">
        <div className="p-6 sm:p-8 space-y-6">
          {/* Row A: Recommendation */}
          <div className="space-y-3">
            <div>
              <p className="text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">
                Recommendation
              </p>
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-text-primary leading-tight flex-1 min-w-0">
                  Add structured handoff workflows
                </h3>
                <div className="shrink-0 mt-2 sm:mt-0">
                  <ConfidencePill level="directional" />
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border-subtle" />

          {/* Row B: Evidence attached */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Evidence
            </p>
            <p className="text-sm text-text-secondary mb-3">
              12 sources attached
            </p>
            <div className="flex flex-wrap gap-2">
              {evidenceSources.map((source, index) => {
                const Icon = source.icon
                return (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="text-xs flex items-center gap-1.5"
                  >
                    <Icon className="w-3 h-3" aria-hidden="true" />
                    {source.type}
                  </Badge>
                )
              })}
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-border-subtle" />

          {/* Row C: Confidence boundaries */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Confidence Boundaries
            </p>
            <ConfidenceRangeBar />
          </div>

          {/* Divider */}
          <div className="border-t border-border-subtle" />

          {/* Row D: What would change the call */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              What Would Change This Call
            </p>
            <ul className="space-y-2 text-sm text-text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-text-muted mt-0.5">•</span>
                <span>+2 enterprise reviews confirming this pain</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-text-muted mt-0.5">•</span>
                <span>Competitor X ships equivalent workflow</span>
              </li>
            </ul>
          </div>

          {/* Divider */}
          <div className="border-t border-border-subtle" />

          {/* Row E: Next steps */}
          <div className="space-y-3">
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wide">
              Next Steps
            </p>
            <ul className="space-y-2">
              {nextSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-text-secondary">
                  <CheckCircle2
                    className="w-4 h-4 text-text-muted mt-0.5 shrink-0"
                    aria-hidden="true"
                  />
                  <span>{step}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

