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
        "rounded-3xl border-2 border-border-subtle bg-white",
        "shadow-2xl p-10 sm:p-14 md:p-20 space-y-10 sm:space-y-12",
        "backdrop-blur-sm",
        className
      )}
    >
      {/* Subtle texture overlay for depth */}
      <div 
        className="absolute inset-0 rounded-3xl opacity-[0.015] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Verdict Badge - Enhanced */}
      <div className="flex items-center justify-between flex-wrap gap-4 relative z-10">
        <Badge variant={statusVariant} className="text-base font-bold px-5 py-2 shadow-sm">
          {statusLabel}
        </Badge>
        {recommendation.score && (
          <div className="text-xl text-text-secondary">
            <span className="font-bold text-text-primary text-3xl">{recommendation.score}</span>
            <span className="text-text-muted ml-1.5">/100</span>
          </div>
        )}
      </div>

      {/* Main Title - Larger, More Heroic */}
      <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-text-primary leading-[1.1] tracking-tight relative z-10">
        {recommendation.title}
      </h2>

      {/* Confidence Band - Enhanced */}
      <div className="pt-8 border-t-2 border-border-subtle relative z-10">
        <div className="flex items-center gap-4 mb-5">
          <div className="text-base font-semibold text-text-secondary">
            Confidence Level
          </div>
          <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-accent-primary to-accent-primary/90 rounded-full shadow-sm"
              style={{ width: `${recommendation.score || 81.4}%` }}
            />
          </div>
        </div>
        <p className="text-base text-text-secondary leading-relaxed">
          Strong confidence based on <span className="font-semibold text-text-primary">{sampleAnalysis.evidence.totalSources} sources</span> across <span className="font-semibold text-text-primary">{sampleAnalysis.evidence.types.length} evidence types</span>
        </p>
      </div>

      {/* Supporting Signal Summaries - Enhanced */}
      <div className="pt-10 border-t-2 border-border-subtle relative z-10">
        <h3 className="text-xl font-bold text-text-primary mb-8">
          Supporting Evidence
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          {supportingSignals.map((signal, idx) => {
            const Icon = signal.icon
            return (
              <div key={idx} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-slate-100/60">
                    <Icon className="w-5 h-5 text-text-secondary" />
                  </div>
                  <h4 className="font-bold text-lg text-text-primary">
                    {signal.title}
                  </h4>
                </div>
                <p className="text-base text-text-secondary leading-relaxed">
                  {signal.summary}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Evidence Count Footer - Enhanced */}
      <div className="pt-8 border-t-2 border-border-subtle relative z-10">
        <div className="flex flex-wrap items-center gap-5 text-base text-text-secondary">
          <span className="font-bold text-text-primary">
            {sampleAnalysis.evidence.totalSources} sources analyzed
          </span>
          <span className="text-text-muted">·</span>
          <div className="flex flex-wrap gap-3">
            {sampleAnalysis.evidence.types.slice(0, 4).map((type, idx) => (
              <span key={idx} className="text-text-muted font-medium">
                {type.type} ({type.count})
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

