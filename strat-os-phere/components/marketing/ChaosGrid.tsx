/**
 * Chaos Grid (Before State)
 * 
 * Replaces blurry, meaningless "chaos" screenshots.
 * A grid of abstract but recognizable fragments:
 * - Slack-style message blocks
 * - Highlighted doc snippets
 * - Conflicting bullets
 * - Partial charts
 * 
 * Rules:
 * - No readable text
 * - Slight misalignment
 * - Muted, low-contrast palette
 * 
 * Reads instantly as: "Unstructured thinking. Too many opinions."
 */
"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, FileText, Presentation, DollarSign } from "lucide-react"

interface ChaosGridProps {
  className?: string
}

export function ChaosGrid({ className }: ChaosGridProps) {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3 p-4 rounded-lg bg-gradient-to-br from-slate-50 via-white to-slate-50/50 border border-border-subtle/60 opacity-70",
        className
      )}
    >
      {/* Slack-style message block */}
      <div
        className={cn(
          "rounded-lg bg-white/70 backdrop-blur-sm border border-border-subtle/40 shadow-sm p-2.5 space-y-1.5",
          "transform rotate-[-1deg]"
        )}
      >
        <div className="flex items-center gap-1.5 mb-1.5">
          <div className="w-4 h-4 rounded-full bg-purple-200/60" />
          <div className="h-1 bg-slate-300 rounded w-16" />
        </div>
        <div className="space-y-1">
          <div className="h-0.5 bg-slate-200 rounded w-full" />
          <div className="h-0.5 bg-slate-200 rounded w-5/6" />
          <div className="h-0.5 bg-slate-200 rounded w-full" />
        </div>
        <MessageSquare className="w-3 h-3 text-slate-400/50 mt-1" />
      </div>

      {/* Doc snippet with highlight */}
      <div
        className={cn(
          "rounded-lg bg-white/70 backdrop-blur-sm border border-border-subtle/40 shadow-sm p-2.5 space-y-1",
          "transform rotate-[1deg]"
        )}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <FileText className="w-3 h-3 text-slate-400/50" />
          <div className="h-1 bg-slate-300 rounded flex-1" />
        </div>
        <div className="h-0.5 bg-slate-200 rounded w-full" />
        <div className="h-0.5 bg-slate-200 rounded w-11/12" />
        <div className="p-1 bg-yellow-100/60 rounded border border-yellow-200/40 mt-1">
          <div className="h-0.5 bg-slate-300 rounded w-full" />
        </div>
      </div>

      {/* Pricing fragment */}
      <div
        className={cn(
          "rounded-lg bg-white/75 backdrop-blur-sm border border-border-subtle/40 shadow-sm p-2.5 space-y-1",
          "transform rotate-[-0.5deg]"
        )}
      >
        <div className="flex items-center gap-1.5 mb-1">
          <DollarSign className="w-3 h-3 text-slate-400/50" />
          <div className="h-1 bg-slate-800/20 rounded w-12" />
        </div>
        <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-600/70">
          <div>Plan</div>
          <div>Price</div>
        </div>
        <div className="grid grid-cols-2 gap-1 text-[8px] text-slate-700/80 pt-0.5 border-t border-border-subtle/30">
          <div>$0</div>
          <div>?</div>
        </div>
      </div>

      {/* Slide deck fragment */}
      <div
        className={cn(
          "rounded-lg bg-gradient-to-br from-slate-50/80 to-white/80 backdrop-blur-sm border border-border-subtle/40 shadow-sm p-2.5 space-y-1",
          "transform rotate-[0.5deg]"
        )}
      >
        <div className="h-1.5 bg-slate-800/20 rounded w-1/2 mb-1" />
        <div className="space-y-0.5">
          <div className="h-1 bg-slate-700/15 rounded w-full" />
          <div className="h-0.5 bg-slate-600/10 rounded w-11/12" />
        </div>
        <Presentation className="w-3 h-3 text-slate-400/50 mt-1" />
      </div>
    </div>
  )
}

