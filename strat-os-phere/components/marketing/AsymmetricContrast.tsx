/**
 * AsymmetricContrast
 * 
 * Asymmetric before/after emphasis without split-screen labels.
 * Left: Messy signal stack (compressed, faded, abstract)
 * Right: Clean outcome preview (larger, structured, calm)
 * 
 * Principles:
 * - Let hierarchy do the persuasion
 * - No "Before / After" labels needed
 * - Visual weight tells the story
 */
"use client"

import { cn } from "@/lib/utils"
import { SignalChaosPanel } from "./SignalChaosPanel"
import { DecisionCard } from "./DecisionCard"
import { Badge } from "@/components/ui/badge"
import { sampleAnalysis } from "./sampleReadoutData"

interface AsymmetricContrastProps {
  className?: string
}

// Lighter outcome preview for asymmetric contrast
function OutcomePreview() {
  const recommendation = sampleAnalysis.recommendation
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

  return (
    <div className="rounded-xl border-2 border-border-subtle bg-white shadow-xl p-8 space-y-6">
      <div className="flex items-center justify-between">
        <Badge variant={statusVariants[recommendation.confidenceLevel]} className="text-sm font-semibold px-3 py-1.5">
          {statusLabels[recommendation.confidenceLevel]}
        </Badge>
        {recommendation.score && (
          <div className="text-base text-text-secondary">
            <span className="font-bold text-text-primary text-xl">{recommendation.score}</span>
            <span className="text-text-muted ml-1">/100</span>
          </div>
        )}
      </div>

      <h3 className="text-2xl font-semibold text-text-primary leading-tight">
        {recommendation.title}
      </h3>

      <div className="pt-4 border-t border-border-subtle">
        <div className="flex flex-wrap items-center gap-3 text-sm text-text-secondary">
          <span className="font-medium">
            {sampleAnalysis.evidence.totalSources} sources
          </span>
          <span className="text-text-muted">·</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleAnalysis.evidence.types.slice(0, 3).map((type, idx) => (
              <Badge key={idx} variant="secondary" className="text-xs px-2 py-0.5">
                {type.type}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function AsymmetricContrast({ className }: AsymmetricContrastProps) {
  return (
    <div
      className={cn(
        "w-full grid grid-cols-1 lg:grid-cols-[0.4fr_0.6fr] gap-6 lg:gap-12 items-start",
        className
      )}
    >
      {/* Left: Before - Compressed, faded, abstract */}
      <div className="relative opacity-60 scale-95 lg:scale-100">
        <div className="sticky top-24">
          <SignalChaosPanel className="min-h-[300px] lg:min-h-[400px] blur-[1px]" />
        </div>
      </div>

      {/* Right: After - Larger, structured, calm */}
      <div className="relative lg:pt-8">
        <div className="scale-100 lg:scale-105 origin-top-left">
          <OutcomePreview />
        </div>
      </div>
    </div>
  )
}

