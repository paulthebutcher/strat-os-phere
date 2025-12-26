/**
 * OutcomeArtifact
 * 
 * Single large outcome card that's heroic and exportable.
 * Shows: Title, Verdict, Confidence band, 3-4 supporting signal summaries
 * 
 * Principles:
 * - Bigger typography
 * - More breathing room
 * - Looks exportable/presentable
 * - Feels like something you'd screenshot for leadership
 */
"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { sampleAnalysis } from "./sampleReadoutData"
import { CheckCircle2, AlertCircle, TrendingUp } from "lucide-react"

interface OutcomeArtifactProps {
  className?: string
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

export function OutcomeArtifact({ className }: OutcomeArtifactProps) {
  const recommendation = sampleAnalysis.recommendation
  const statusLabel = statusLabels[recommendation.confidenceLevel]
  const statusVariant = statusVariants[recommendation.confidenceLevel]

  // Supporting signal summaries (not scores)
  const supportingSignals = [
    {
      icon: TrendingUp,
      title: "Competitive alignment",
      summary: "4 of 5 competitors offer free tiers; StatusFlow and PagerGrid expanded theirs recently",
    },
    {
      icon: AlertCircle,
      title: "Market friction",
      summary: "Enterprise reviews cite evaluation delays; mid-market buyers need longer trial periods",
    },
    {
      icon: CheckCircle2,
      title: "Market maturity",
      summary: "Free tiers have become table stakes; buyers expect hands-on evaluation before purchase",
    },
    {
      icon: CheckCircle2,
      title: "Risk profile",
      summary: "Cannibalization risk manageable with hard caps; competitor conversion data supports this",
    },
  ]

  return (
    <div
      className={cn(
        "relative w-full max-w-4xl mx-auto",
        "rounded-2xl border-2 border-border-subtle bg-white",
        "shadow-2xl p-8 sm:p-12 md:p-16 space-y-8 sm:space-y-10",
        className
      )}
    >
      {/* Verdict Badge */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <Badge variant={statusVariant} className="text-sm font-semibold px-4 py-1.5">
          {statusLabel}
        </Badge>
        {recommendation.score && (
          <div className="text-lg text-text-secondary">
            <span className="font-bold text-text-primary text-2xl">{recommendation.score}</span>
            <span className="text-text-muted ml-1">/100</span>
          </div>
        )}
      </div>

      {/* Main Title - Large, Heroic */}
      <h2 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-text-primary leading-tight tracking-tight">
        {recommendation.title}
      </h2>

      {/* Confidence Band */}
      <div className="pt-6 border-t border-border-subtle">
        <div className="flex items-center gap-3 mb-4">
          <div className="text-sm font-medium text-text-secondary">
            Confidence Level
          </div>
          <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-primary rounded-full"
              style={{ width: `${recommendation.score || 81.4}%` }}
            />
          </div>
        </div>
        <p className="text-sm text-text-secondary leading-relaxed">
          Strong confidence based on {sampleAnalysis.evidence.totalSources} sources across {sampleAnalysis.evidence.types.length} evidence types
        </p>
      </div>

      {/* Supporting Signal Summaries */}
      <div className="pt-8 border-t border-border-subtle">
        <h3 className="text-lg font-semibold text-text-primary mb-6">
          Supporting Evidence
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {supportingSignals.map((signal, idx) => {
            const Icon = signal.icon
            return (
              <div key={idx} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-5 h-5 text-text-secondary" />
                  <h4 className="font-semibold text-text-primary">
                    {signal.title}
                  </h4>
                </div>
                <p className="text-sm text-text-secondary leading-relaxed">
                  {signal.summary}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Evidence Count Footer */}
      <div className="pt-6 border-t border-border-subtle">
        <div className="flex flex-wrap items-center gap-4 text-sm text-text-secondary">
          <span className="font-medium">
            {sampleAnalysis.evidence.totalSources} sources analyzed
          </span>
          <span className="text-text-muted">·</span>
          <div className="flex flex-wrap gap-2">
            {sampleAnalysis.evidence.types.slice(0, 4).map((type, idx) => (
              <span key={idx} className="text-text-muted">
                {type.type} ({type.count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

