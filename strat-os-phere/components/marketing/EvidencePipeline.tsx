/**
 * EvidencePipeline
 * 
 * Process diagram showing evidence intake flow.
 * Visual tokens: pill-shaped inputs → Evidence Engine → Normalized Signals
 * 
 * Principles:
 * - No UI chrome
 * - Counts feel real (e.g., 17 sources)
 * - Subtle connectors
 * - Makes Plinth feel like infrastructure, not a dashboard
 */
"use client"

import { cn } from "@/lib/utils"
import { ArrowRight, FileText, DollarSign, MessageSquare, GitBranch, Database } from "lucide-react"

interface EvidencePipelineProps {
  className?: string
}

const evidenceSources = [
  { type: "Pricing", icon: DollarSign, count: 23, color: "blue" },
  { type: "Docs", icon: FileText, count: 31, color: "slate" },
  { type: "Reviews", icon: MessageSquare, count: 47, color: "amber" },
  { type: "Changelog", icon: GitBranch, count: 12, color: "purple" },
]

const colorClasses = {
  blue: "bg-blue-50/60 border-blue-200/40 text-blue-700/80",
  slate: "bg-slate-50/60 border-slate-200/40 text-slate-700/80",
  amber: "bg-amber-50/60 border-amber-200/40 text-amber-700/80",
  purple: "bg-purple-50/60 border-purple-200/40 text-purple-700/80",
}

export function EvidencePipeline({ className }: EvidencePipelineProps) {
  return (
    <div
      className={cn(
        "relative w-full py-12 px-6 sm:px-8",
        "flex flex-col items-center gap-8 sm:gap-12",
        className
      )}
    >
      {/* Stage 1: Input Sources */}
      <div className="w-full">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {evidenceSources.map((source, idx) => {
            const Icon = source.icon
            return (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-full border",
                  "backdrop-blur-sm shadow-sm",
                  colorClasses[source.color as keyof typeof colorClasses]
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-medium whitespace-nowrap">
                  {source.type}
                </span>
                <span className="text-xs opacity-70 font-medium">
                  {source.count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Connector Arrow */}
      <div className="flex flex-col items-center gap-2">
        <ArrowRight className="w-6 h-6 text-slate-400/60 rotate-90 sm:rotate-0" />
        <div className="text-xs font-medium text-text-secondary">
          17 sources total
        </div>
      </div>

      {/* Stage 2: Evidence Engine */}
      <div className="relative">
        <div className="px-8 py-6 rounded-2xl bg-gradient-to-br from-slate-50/80 to-white/60 border-2 border-slate-200/60 shadow-lg backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-slate-600/70" />
              <h3 className="text-lg font-semibold text-text-primary">
                Evidence Engine
              </h3>
            </div>
            <div className="text-xs text-text-secondary text-center">
              Normalization · Cross-reference · Validation
            </div>
          </div>
        </div>
      </div>

      {/* Connector Arrow */}
      <div className="flex flex-col items-center gap-2">
        <ArrowRight className="w-6 h-6 text-slate-400/60 rotate-90 sm:rotate-0" />
        <div className="text-xs font-medium text-text-secondary">
          Structured signals
        </div>
      </div>

      {/* Stage 3: Normalized Signals */}
      <div className="w-full">
        <div className="flex flex-wrap justify-center gap-2.5 sm:gap-3">
          {[
            "Competitive positioning",
            "Pricing strategy",
            "Feature gaps",
            "User sentiment",
            "Market timing",
          ].map((signal, idx) => (
            <div
              key={idx}
              className="px-4 py-2 rounded-full bg-white/80 border border-slate-200/50 text-sm font-medium text-text-primary shadow-sm backdrop-blur-sm"
            >
              {signal}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

