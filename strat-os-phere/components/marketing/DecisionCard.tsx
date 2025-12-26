/**
 * Decision Card - Primary Marketing Artifact
 * 
 * Clean, executive-ready card that shows:
 * - A single recommendation headline
 * - Confidence level (bounded, not absolute)
 * - Evidence count + types
 * - Status tag (Investment-ready / Directional / Limited)
 * 
 * This becomes the hero artifact for "After: Plinth".
 * Feels like a boardroom slide, not an app screen.
 */
"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { sampleAnalysis } from "./sampleReadoutData"

interface DecisionCardProps {
  className?: string
  recommendation?: {
    title: string
    confidenceLevel: "investment_ready" | "directional" | "exploratory"
    score?: number
  }
  evidenceCount?: number
  evidenceTypes?: string[]
}

const statusLabels = {
  investment_ready: "Investment-ready",
  directional: "Directional",
  exploratory: "Limited",
}

const statusVariants = {
  investment_ready: "success",
  directional: "warning",
  exploratory: "info",
} as const

export function DecisionCard({
  className,
  recommendation = {
    title: sampleAnalysis.recommendation.title,
    confidenceLevel: sampleAnalysis.recommendation.confidenceLevel,
    score: sampleAnalysis.recommendation.score,
  },
  evidenceCount = sampleAnalysis.evidence.totalSources,
  evidenceTypes = sampleAnalysis.evidence.types.slice(0, 3).map((t) => t.type),
}: DecisionCardProps) {
  const statusLabel = statusLabels[recommendation.confidenceLevel]
  const statusVariant = statusVariants[recommendation.confidenceLevel]

  return (
    <div
      className={cn(
        "rounded-xl border-2 border-border-subtle bg-white shadow-lg p-6 md:p-8 space-y-4",
        className
      )}
    >
      {/* Status Tag */}
      <div className="flex items-center justify-between">
        <Badge variant={statusVariant} className="text-xs font-semibold">
          {statusLabel}
        </Badge>
        {recommendation.score && (
          <div className="text-sm text-text-secondary">
            <span className="font-bold text-text-primary">{recommendation.score}</span>
            <span className="text-text-muted">/100</span>
          </div>
        )}
      </div>

      {/* Recommendation Headline */}
      <h3 className="text-lg md:text-xl font-semibold text-text-primary leading-snug">
        {recommendation.title}
      </h3>

      {/* Evidence Summary */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border-subtle">
        <span className="text-xs text-text-secondary font-medium">
          {evidenceCount} sources
        </span>
        <span className="text-text-muted">·</span>
        <div className="flex flex-wrap gap-1.5">
          {evidenceTypes.slice(0, 3).map((type, idx) => (
            <Badge key={idx} variant="secondary" className="text-[10px] px-2 py-0.5">
              {type}
            </Badge>
          ))}
          {evidenceTypes.length > 3 && (
            <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
              +{evidenceTypes.length - 3}
            </Badge>
          )}
        </div>
      </div>
    </div>
  )
}

