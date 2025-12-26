/**
 * Confidence Boundary Bar
 * 
 * Replaces vague "confidence" language and heavy previews.
 * A horizontal bar with:
 * - Low → Medium → High
 * - Indicator positioned based on sample data
 * - Label: "Confidence is bounded by evidence coverage"
 * 
 * Reinforces key differentiator: Plinth shows how sure it is and why.
 */
"use client"

import { cn } from "@/lib/utils"
import { sampleAnalysis } from "./sampleReadoutData"

interface ConfidenceBoundaryBarProps {
  className?: string
  confidenceLevel?: "investment_ready" | "directional" | "exploratory"
}

const confidencePositions = {
  exploratory: "15%",
  directional: "50%",
  investment_ready: "85%",
}

const confidenceLabels = {
  exploratory: "Limited",
  directional: "Directional",
  investment_ready: "Investment-ready",
}

export function ConfidenceBoundaryBar({
  className,
  confidenceLevel = sampleAnalysis.recommendation.confidenceLevel,
}: ConfidenceBoundaryBarProps) {
  const position = confidencePositions[confidenceLevel]
  const label = confidenceLabels[confidenceLevel]

  return (
    <div className={cn("space-y-2", className)}>
      {/* Bar container */}
      <div className="relative h-3 bg-surface-muted rounded-full overflow-hidden">
        {/* Segments */}
        <div className="absolute inset-0 flex">
          <div className="flex-1 bg-warning/20 border-r border-border-subtle" />
          <div className="flex-1 bg-info/20 border-r border-border-subtle" />
          <div className="flex-1 bg-success/20" />
        </div>

        {/* Indicator */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-accent-primary rounded-full shadow-sm"
          style={{ left: position, transform: "translateX(-50%)" }}
        >
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-5 h-5 bg-accent-primary rounded-full border-2 border-white shadow-md" />
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between items-center text-xs">
        <span className="text-text-muted">Limited</span>
        <span className="font-semibold text-text-primary">{label}</span>
        <span className="text-text-muted">Investment-ready</span>
      </div>

      {/* Caption */}
      <p className="text-xs text-text-secondary text-center mt-1">
        Confidence is bounded by evidence coverage
      </p>
    </div>
  )
}

