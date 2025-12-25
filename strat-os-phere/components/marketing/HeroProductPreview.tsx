/**
 * Hero Product Preview
 * 
 * High-fidelity product preview showing a ranked opportunity with confidence scores,
 * evidence citations, and real UI elements. This replaces static placeholders with
 * actual product context.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { ConfidencePill } from "./ConfidencePill"
import { cn } from "@/lib/utils"
import { FileText, TrendingUp, Shield } from "lucide-react"

// Sample opportunity data for the preview
const sampleOpportunity = {
  title: "Launch enterprise SSO to match competitor positioning",
  oneLiner: "Three competitors now offer SSO in their enterprise tiers. This is a table-stakes feature for B2B positioning.",
  confidence: "directional" as const,
  score: 8.7,
  evidenceCount: 14,
  citations: [
    { type: "Pricing", domain: "competitor-a.com", note: "SSO included in Enterprise plan" },
    { type: "Docs", domain: "competitor-b.com", note: "Published 2 months ago" },
    { type: "Reviews", domain: "review-site.com", note: "47 upvotes, top request" },
  ],
}

export function HeroProductPreview() {
  return (
    <div className="relative w-full max-w-5xl mx-auto">
      {/* Main product preview card */}
      <div className="bg-white rounded-xl border-2 border-border-subtle shadow-xl overflow-hidden">
        {/* Header with score and confidence */}
        <div className="bg-surface-muted/50 border-b border-border-subtle p-4 sm:p-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-accent-primary/10 rounded-lg px-3 py-1.5 border border-accent-primary/20">
                <span className="text-xl font-bold text-accent-primary">
                  {sampleOpportunity.score}
                </span>
                <span className="text-xs text-text-muted">score</span>
              </div>
              <ConfidencePill level={sampleOpportunity.confidence} />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                {sampleOpportunity.evidenceCount} citations
              </Badge>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Title and one-liner */}
          <div>
            <h3 className="text-xl sm:text-2xl font-semibold text-text-primary mb-3 leading-tight">
              {sampleOpportunity.title}
            </h3>
            <p className="text-sm sm:text-base leading-relaxed text-text-secondary">
              {sampleOpportunity.oneLiner}
            </p>
          </div>

          {/* Evidence preview */}
          <div className="pt-4 border-t border-border-subtle">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-text-muted" />
              <h4 className="text-sm font-semibold text-text-primary">Evidence</h4>
            </div>
            <div className="space-y-2">
              {sampleOpportunity.citations.map((citation, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-surface-muted/30"
                >
                  <Badge variant="secondary" className="text-xs shrink-0 mt-0.5">
                    {citation.type}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text-primary">
                      {citation.domain}
                    </p>
                    <p className="text-xs text-text-secondary mt-0.5">
                      {citation.note}
                    </p>
                  </div>
                </div>
              ))}
              <div className="pt-1">
                <p className="text-xs text-text-muted">
                  +{sampleOpportunity.evidenceCount - sampleOpportunity.citations.length} more sources
                </p>
              </div>
            </div>
          </div>

          {/* Confidence metrics */}
          <div className="pt-4 border-t border-border-subtle">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Evidence strength</p>
                  <p className="text-base font-semibold text-text-primary">8.9</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-text-muted" />
                <div>
                  <p className="text-xs text-text-muted mb-0.5">Coverage</p>
                  <p className="text-base font-semibold text-text-primary">High</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

