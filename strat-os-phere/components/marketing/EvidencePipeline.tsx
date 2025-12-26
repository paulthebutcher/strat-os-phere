/**
 * EvidencePipeline
 * 
 * Compact horizontal pipeline band showing evidence intake flow.
 * Visual tokens: pill-shaped inputs → Evidence Engine → Normalized Signals
 * 
 * Principles:
 * - No UI chrome
 * - Counts feel real (e.g., 17 sources)
 * - Subtle connectors
 * - Makes Plinth feel like infrastructure, not a dashboard
 * - Tight vertical rhythm, horizontal narrative flow
 */
"use client"

import { cn } from "@/lib/utils"
import { FileText, DollarSign, MessageSquare, GitBranch, Database } from "lucide-react"

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
  blue: "bg-blue-50/50 border-blue-200/30 text-blue-700/70",
  slate: "bg-slate-50/50 border-slate-200/30 text-slate-700/70",
  amber: "bg-amber-50/50 border-amber-200/30 text-amber-700/70",
  purple: "bg-purple-50/50 border-purple-200/30 text-purple-700/70",
}

export function EvidencePipeline({ className }: EvidencePipelineProps) {
  return (
    <div
      className={cn(
        "relative w-full py-10 px-6 sm:px-8",
        "rounded-xl bg-gradient-to-br from-slate-50/50 via-white/80 to-slate-50/90",
        "border border-slate-200/50 shadow-sm",
        className
      )}
    >
      {/* Connector line behind stations (desktop only) */}
      <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px bg-slate-200/60 -translate-y-1/2" />
      
      {/* Desktop: Horizontal pipeline band (3 columns) - tighter spacing */}
      <div className="hidden md:grid md:grid-cols-[1fr_auto_1fr] gap-4 items-start relative">
        {/* Station 1: Sources */}
        <div className="flex flex-col items-start gap-3">
          <div className="flex flex-wrap gap-2.5">
            {evidenceSources.map((source, idx) => {
              const Icon = source.icon
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border",
                    "backdrop-blur-sm shadow-sm",
                    "bg-white/90",
                    colorClasses[source.color as keyof typeof colorClasses]
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {source.type}
                  </span>
                  <span className="text-xs opacity-70 font-bold bg-white/60 px-1 py-0.5 rounded-full">
                    {source.count}
                  </span>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-text-secondary/70">
            17 sources total
          </p>
        </div>

        {/* Station 2: Evidence Engine (focal point) */}
        <div className="flex flex-col items-center gap-3 relative z-10">
          <div className="px-6 py-5 rounded-xl bg-white border-2 border-slate-300/70 shadow-lg backdrop-blur-sm min-w-[200px]">
            {/* Subtle infrastructure pattern */}
            <div className="absolute inset-0 rounded-xl opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(45deg, transparent 30%, rgba(0,0,0,0.1) 50%, transparent 70%),
                  linear-gradient(-45deg, transparent 30%, rgba(0,0,0,0.1) 50%, transparent 70%)
                `,
                backgroundSize: '20px 20px'
              }}
            />
            <div className="relative flex flex-col items-center gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-slate-200/50 border border-slate-300/50">
                  <Database className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-text-primary tracking-tight">
                  Evidence Engine
                </h3>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-medium text-text-secondary/80 tracking-wide uppercase">
                <span>Normalization</span>
                <span className="text-slate-400">·</span>
                <span>Cross-reference</span>
                <span className="text-slate-400">·</span>
                <span>Validation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Station 3: Signals */}
        <div className="flex flex-col items-end gap-3">
          <div className="flex flex-wrap justify-end gap-2">
            {[
              "Competitive positioning",
              "Pricing strategy",
              "Feature gaps",
              "User sentiment",
              "Market timing",
            ].map((signal, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-full bg-white/90 border border-slate-200/50 text-xs font-semibold text-text-primary shadow-sm backdrop-blur-sm"
              >
                {signal}
              </div>
            ))}
          </div>
          <p className="text-xs text-text-secondary/70">
            Structured signals
          </p>
        </div>
      </div>

      {/* Mobile: 2-row layout */}
      <div className="md:hidden flex flex-col gap-3">
        {/* Row 1: Sources → Engine */}
        <div className="flex items-center gap-3">
          <div className="flex-1 flex flex-wrap gap-2.5">
            {evidenceSources.map((source, idx) => {
              const Icon = source.icon
              return (
                <div
                  key={idx}
                  className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full border",
                    "backdrop-blur-sm shadow-sm",
                    "bg-white/90",
                    colorClasses[source.color as keyof typeof colorClasses]
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs font-semibold whitespace-nowrap">
                    {source.type}
                  </span>
                  <span className="text-xs opacity-70 font-bold bg-white/60 px-1 py-0.5 rounded-full">
                    {source.count}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="flex-shrink-0 text-slate-400">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
          <div className="flex-shrink-0">
            <div className="px-5 py-4 rounded-xl bg-white border-2 border-slate-300/70 shadow-lg backdrop-blur-sm">
              <div className="flex flex-col items-center gap-2.5">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-slate-200/50 border border-slate-300/50">
                    <Database className="w-4 h-4 text-slate-700" />
                  </div>
                  <h3 className="text-base font-bold text-text-primary tracking-tight">
                    Evidence Engine
                  </h3>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-medium text-text-secondary/80 tracking-wide uppercase">
                  <span>Normalization</span>
                  <span className="text-slate-400">·</span>
                  <span>Cross-reference</span>
                  <span className="text-slate-400">·</span>
                  <span>Validation</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Row 2: Signals */}
        <div className="flex items-center gap-3">
          <div className="flex-1" />
          <div className="flex-shrink-0 text-slate-400">
            <svg className="w-5 h-5 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
          <div className="flex-1 flex flex-wrap justify-center gap-2">
            {[
              "Competitive positioning",
              "Pricing strategy",
              "Feature gaps",
              "User sentiment",
              "Market timing",
            ].map((signal, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-full bg-white/90 border border-slate-200/50 text-xs font-semibold text-text-primary shadow-sm backdrop-blur-sm"
              >
                {signal}
              </div>
            ))}
          </div>
        </div>
        
        {/* Mobile captions */}
        <div className="flex flex-col gap-2 text-center mt-2">
          <p className="text-xs text-text-secondary/70">17 sources total</p>
          <p className="text-xs text-text-secondary/70">Structured signals</p>
        </div>
      </div>
    </div>
  )
}

