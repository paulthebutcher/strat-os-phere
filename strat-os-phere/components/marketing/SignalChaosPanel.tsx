/**
 * SignalChaosPanel
 * 
 * Abstract signal collage showing raw, unstructured inputs.
 * Built from fragments: highlight bars, comment snippets, pricing rows,
 * faded score chips, partial doc headers.
 * 
 * Visual principles:
 * - No full cards or borders
 * - Muted colors (slate, amber, soft red)
 * - Masonry/staggered layout
 * - Light motion drift (optional)
 * - Communicates ambiguity and overload without showing product UI
 */
"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, FileText, DollarSign, TrendingUp, Hash } from "lucide-react"

interface SignalChaosPanelProps {
  className?: string
}

export function SignalChaosPanel({ className }: SignalChaosPanelProps) {
  return (
    <div
      className={cn(
        "relative w-full min-h-[400px] p-8 sm:p-12",
        "bg-gradient-to-br from-slate-50/80 via-white/50 to-slate-50/60",
        className
      )}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.02] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Masonry-style signal fragments */}
      <div className="relative h-full space-y-4">
        
        {/* Row 1: Highlight bars + comment fragments */}
        <div className="flex flex-wrap gap-4 items-start">
          {/* Highlight bar - amber */}
          <div className="relative transform rotate-[-0.8deg] mt-2">
            <div className="h-8 bg-amber-200/40 rounded px-3 flex items-center">
              <div className="h-1 bg-slate-400/50 rounded w-32" />
            </div>
            <div className="absolute top-1/2 left-0 w-full h-1 bg-amber-300/60 -translate-y-1/2" />
          </div>

          {/* Comment fragment - soft red */}
          <div className="relative transform rotate-[1.2deg]">
            <div className="flex items-start gap-2 px-3 py-2 bg-red-50/50 rounded">
              <MessageSquare className="w-3.5 h-3.5 text-red-400/60 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <div className="h-1 bg-red-300/50 rounded w-24" />
                <div className="h-0.5 bg-red-200/40 rounded w-20" />
              </div>
            </div>
          </div>

          {/* Partial doc header - slate */}
          <div className="relative transform rotate-[-0.5deg]">
            <div className="flex items-center gap-2 px-3 py-2">
              <FileText className="w-3.5 h-3.5 text-slate-400/50" />
              <div className="h-1 bg-slate-300/60 rounded w-28" />
            </div>
          </div>
        </div>

        {/* Row 2: Pricing rows + score chips */}
        <div className="flex flex-wrap gap-4 items-start mt-6">
          {/* Pricing row fragment - slate/amber mix */}
          <div className="relative transform rotate-[0.6deg]">
            <div className="px-3 py-2 space-y-1.5">
              <div className="flex items-center gap-2">
                <DollarSign className="w-3 h-3 text-slate-500/50" />
                <div className="h-1 bg-slate-300/50 rounded w-16" />
              </div>
              <div className="flex gap-4 text-xs text-slate-600/60">
                <span>$49</span>
                <span>$99</span>
                <span>$199</span>
              </div>
            </div>
          </div>

          {/* Faded score chip - soft red */}
          <div className="relative transform rotate-[-1deg] mt-1">
            <div className="px-3 py-1.5 bg-red-50/40 rounded-full border border-red-200/30">
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-3 h-3 text-red-400/50" />
                <div className="h-1 bg-red-300/50 rounded w-12" />
              </div>
            </div>
          </div>

          {/* Highlight bar - slate */}
          <div className="relative transform rotate-[0.8deg]">
            <div className="h-6 bg-slate-200/40 rounded px-3 flex items-center">
              <div className="h-0.5 bg-slate-400/50 rounded w-28" />
            </div>
          </div>
        </div>

        {/* Row 3: Mixed fragments - staggered */}
        <div className="flex flex-wrap gap-4 items-start mt-8">
          {/* Comment fragment - amber */}
          <div className="relative transform rotate-[-1.2deg]">
            <div className="flex items-start gap-2 px-3 py-2 bg-amber-50/40 rounded">
              <Hash className="w-3 h-3 text-amber-400/50 mt-0.5" />
              <div className="space-y-0.5">
                <div className="h-1 bg-amber-300/50 rounded w-20" />
                <div className="h-0.5 bg-amber-200/40 rounded w-16" />
              </div>
            </div>
          </div>

          {/* Pricing row fragment */}
          <div className="relative transform rotate-[0.9deg] mt-3">
            <div className="px-3 py-2">
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-600/50">
                <div>Plan</div>
                <div>Price</div>
                <div className="col-span-2 h-px bg-slate-300/40" />
                <div>Free</div>
                <div>$0</div>
              </div>
            </div>
          </div>

          {/* Faded score chip - slate */}
          <div className="relative transform rotate-[-0.7deg]">
            <div className="px-3 py-1.5 bg-slate-100/50 rounded-full">
              <div className="flex items-center gap-1.5">
                <div className="h-1.5 bg-slate-400/50 rounded w-10" />
              </div>
            </div>
          </div>

          {/* Partial doc header - soft red */}
          <div className="relative transform rotate-[1.1deg] mt-2">
            <div className="flex items-center gap-2 px-3 py-2">
              <FileText className="w-3.5 h-3.5 text-red-400/40" />
              <div className="h-1 bg-red-300/40 rounded w-24" />
            </div>
          </div>
        </div>

        {/* Row 4: More scattered fragments */}
        <div className="flex flex-wrap gap-4 items-start mt-10">
          {/* Highlight bar - soft red */}
          <div className="relative transform rotate-[-0.4deg]">
            <div className="h-7 bg-red-200/30 rounded px-3 flex items-center">
              <div className="h-1 bg-red-400/40 rounded w-36" />
            </div>
          </div>

          {/* Comment fragment - slate */}
          <div className="relative transform rotate-[0.7deg] mt-1">
            <div className="flex items-start gap-2 px-3 py-2 bg-slate-100/40 rounded">
              <MessageSquare className="w-3 h-3 text-slate-400/50 mt-0.5" />
              <div className="h-1 bg-slate-300/50 rounded w-22" />
            </div>
          </div>

          {/* Score chip - amber */}
          <div className="relative transform rotate-[-1.1deg]">
            <div className="px-3 py-1.5 bg-amber-100/40 rounded-full border border-amber-200/30">
              <div className="h-1 bg-amber-400/50 rounded w-8" />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle noise texture */}
      <div
        className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />
    </div>
  )
}

