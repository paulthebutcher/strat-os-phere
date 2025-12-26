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
        "relative w-full py-16 px-6 sm:px-8",
        "flex flex-col items-center gap-10 sm:gap-14",
        className
      )}
    >
      {/* Stage 1: Input Sources - Enhanced with infrastructure feel */}
      <div className="w-full">
        <div className="flex flex-wrap justify-center gap-4 sm:gap-5">
          {evidenceSources.map((source, idx) => {
            const Icon = source.icon
            return (
              <div
                key={idx}
                className={cn(
                  "flex items-center gap-2.5 px-5 py-3 rounded-full border-2",
                  "backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow",
                  "bg-white/90",
                  colorClasses[source.color as keyof typeof colorClasses]
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-semibold whitespace-nowrap">
                  {source.type}
                </span>
                <span className="text-xs opacity-75 font-bold bg-white/60 px-1.5 py-0.5 rounded-full">
                  {source.count}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Connector Arrow - More prominent */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <ArrowRight className="w-8 h-8 text-slate-500/70 rotate-90 sm:rotate-0" />
          <div className="absolute inset-0 w-8 h-8 text-slate-400/30 rotate-90 sm:rotate-0 blur-sm">
            <ArrowRight className="w-full h-full" />
          </div>
        </div>
        <div className="text-sm font-semibold text-text-secondary">
          17 sources total
        </div>
      </div>

      {/* Stage 2: Evidence Engine - More infrastructure-focused */}
      <div className="relative">
        <div className="px-10 py-8 rounded-2xl bg-gradient-to-br from-slate-100/90 via-white/80 to-slate-50/90 border-2 border-slate-300/70 shadow-xl backdrop-blur-sm">
          {/* Subtle infrastructure pattern */}
          <div className="absolute inset-0 rounded-2xl opacity-[0.03] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(45deg, transparent 30%, rgba(0,0,0,0.1) 50%, transparent 70%),
                linear-gradient(-45deg, transparent 30%, rgba(0,0,0,0.1) 50%, transparent 70%)
              `,
              backgroundSize: '20px 20px'
            }}
          />
          <div className="relative flex flex-col items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-slate-200/50 border border-slate-300/50">
                <Database className="w-6 h-6 text-slate-700" />
              </div>
              <h3 className="text-xl font-bold text-text-primary tracking-tight">
                Evidence Engine
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-text-secondary">
              <span>Normalization</span>
              <span className="text-slate-400">·</span>
              <span>Cross-reference</span>
              <span className="text-slate-400">·</span>
              <span>Validation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connector Arrow - More prominent */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <ArrowRight className="w-8 h-8 text-slate-500/70 rotate-90 sm:rotate-0" />
          <div className="absolute inset-0 w-8 h-8 text-slate-400/30 rotate-90 sm:rotate-0 blur-sm">
            <ArrowRight className="w-full h-full" />
          </div>
        </div>
        <div className="text-sm font-semibold text-text-secondary">
          Structured signals
        </div>
      </div>

      {/* Stage 3: Normalized Signals - Enhanced */}
      <div className="w-full">
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {[
            "Competitive positioning",
            "Pricing strategy",
            "Feature gaps",
            "User sentiment",
            "Market timing",
          ].map((signal, idx) => (
            <div
              key={idx}
              className="px-5 py-2.5 rounded-full bg-white/90 border-2 border-slate-200/60 text-sm font-semibold text-text-primary shadow-md backdrop-blur-sm hover:shadow-lg transition-shadow"
            >
              {signal}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

