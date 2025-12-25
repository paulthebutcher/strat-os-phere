/**
 * ArtifactPreviewRow
 * 
 * Side-by-side comparison of early exploration vs investment-ready artifacts.
 * Compact previews showing the progression from idea to call.
 * ~120px tall each, no scrolling, subtle framing.
 */
"use client"

import { Badge } from "@/components/ui/badge"
import { ConfidencePill } from "./ConfidencePill"
import { cn } from "@/lib/utils"
import { Reveal } from "./motion"

interface ArtifactPreviewProps {
  title: string
  opportunityTitle: string
  confidence: "exploratory" | "directional" | "investment_ready"
  citationsCount: number
  evidenceTypes: number
  caption: string
}

function ArtifactPreview({
  title,
  opportunityTitle,
  confidence,
  citationsCount,
  evidenceTypes,
  caption,
}: ArtifactPreviewProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Title */}
      <div className="mb-2">
        <p className="text-xs font-medium text-muted-foreground">{title}</p>
      </div>

      {/* Visual: Opportunity row */}
      <div className="flex-1 bg-white rounded-lg border border-border-subtle p-3 sm:p-4 flex flex-col justify-between min-h-[120px]">
        <div className="space-y-2">
          {/* Opportunity title */}
          <p className="text-xs sm:text-sm font-medium text-text-primary line-clamp-2 leading-snug">
            {opportunityTitle}
          </p>

          {/* Confidence + Evidence */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
            <ConfidencePill level={confidence} className="text-[10px] px-2 py-0.5" />
            <span className="text-[10px] sm:text-xs text-text-muted">
              {citationsCount} citations · {evidenceTypes} types
            </span>
          </div>
        </div>
      </div>

      {/* Caption */}
      <p className="mt-2 text-xs text-text-secondary leading-relaxed">{caption}</p>
    </div>
  )
}

export function ArtifactPreviewRow() {
  return (
    <Reveal delay={180} y={12}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12 md:mt-16">
        {/* Left: Early exploration */}
        <ArtifactPreview
          title="Exploring an idea"
          opportunityTitle="Introduce a constrained free tier to unlock mid-market adoption"
          confidence="exploratory"
          citationsCount={3}
          evidenceTypes={2}
          caption="Here's what's real—and what's missing."
        />

        {/* Right: Investment-ready */}
        <ArtifactPreview
          title="Making a call"
          opportunityTitle="Introduce a constrained free tier to unlock mid-market adoption"
          confidence="investment_ready"
          citationsCount={8}
          evidenceTypes={4}
          caption="Here's what to do—and why now."
        />
      </div>
    </Reveal>
  )
}

