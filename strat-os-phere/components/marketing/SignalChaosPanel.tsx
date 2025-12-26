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
 * - Cool/sexy visual treatment with depth and texture
 */
"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, FileText, DollarSign, TrendingUp, Hash, AlertCircle, Zap } from "lucide-react"

interface SignalChaosPanelProps {
  className?: string
}

export function SignalChaosPanel({ className }: SignalChaosPanelProps) {
  return (
    <div
      className={cn(
        "relative w-full min-h-[500px] p-8 sm:p-12 overflow-hidden",
        "bg-gradient-to-br from-slate-50/90 via-amber-50/30 to-red-50/40",
        "backdrop-blur-[0.5px]",
        className
      )}
    >
      {/* Animated gradient overlay for depth */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(251, 191, 36, 0.2) 0%, transparent 50%),
            radial-gradient(circle at 80% 70%, rgba(239, 68, 68, 0.15) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(100, 116, 139, 0.1) 0%, transparent 60%)
          `,
        }}
      />
      
      {/* Subtle grid overlay with more presence */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      {/* Masonry-style signal fragments with enhanced visual treatment */}
      <div className="relative h-full space-y-6 z-10">
        
        {/* Row 1: Highlight bars + comment fragments - more dynamic */}
        <div className="flex flex-wrap gap-5 items-start">
          {/* Highlight bar - amber with glow */}
          <div className="relative transform rotate-[-1.2deg] mt-3 group">
            <div className="h-10 bg-gradient-to-r from-amber-200/50 to-amber-300/40 rounded-lg px-4 flex items-center shadow-sm backdrop-blur-sm border border-amber-300/30">
              <div className="h-1.5 bg-slate-500/60 rounded-full w-36" />
            </div>
            <div className="absolute top-1/2 left-0 w-full h-1.5 bg-amber-400/40 -translate-y-1/2 rounded-full blur-[2px]" />
          </div>

          {/* Comment fragment - soft red with more presence */}
          <div className="relative transform rotate-[1.5deg] group">
            <div className="flex items-start gap-2.5 px-4 py-2.5 bg-gradient-to-br from-red-50/70 to-red-100/40 rounded-lg shadow-sm backdrop-blur-sm border border-red-200/40">
              <MessageSquare className="w-4 h-4 text-red-500/70 mt-0.5 flex-shrink-0" />
              <div className="space-y-1.5">
                <div className="h-1.5 bg-red-400/60 rounded-full w-28" />
                <div className="h-1 bg-red-300/50 rounded-full w-24" />
              </div>
            </div>
          </div>

          {/* Partial doc header - slate with depth */}
          <div className="relative transform rotate-[-0.8deg]">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-slate-100/50 rounded-lg backdrop-blur-sm border border-slate-300/30 shadow-sm">
              <FileText className="w-4 h-4 text-slate-500/70" />
              <div className="h-1.5 bg-slate-400/60 rounded-full w-32" />
            </div>
          </div>

          {/* Alert fragment - new */}
          <div className="relative transform rotate-[0.9deg] mt-2">
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-100/50 rounded-lg border border-amber-200/40">
              <AlertCircle className="w-3.5 h-3.5 text-amber-600/60" />
              <div className="h-1 bg-amber-500/50 rounded-full w-20" />
            </div>
          </div>
        </div>

        {/* Row 2: Pricing rows + score chips - enhanced */}
        <div className="flex flex-wrap gap-5 items-start mt-8">
          {/* Pricing row fragment - slate/amber mix with more depth */}
          <div className="relative transform rotate-[0.8deg]">
            <div className="px-4 py-3 space-y-2 bg-white/60 rounded-lg backdrop-blur-sm border border-slate-300/40 shadow-sm">
              <div className="flex items-center gap-2.5">
                <DollarSign className="w-4 h-4 text-slate-600/70" />
                <div className="h-1.5 bg-slate-400/60 rounded-full w-20" />
              </div>
              <div className="flex gap-5 text-xs font-medium text-slate-700/70">
                <span>$49</span>
                <span>$99</span>
                <span>$199</span>
              </div>
            </div>
          </div>

          {/* Faded score chip - soft red with glow */}
          <div className="relative transform rotate-[-1.3deg] mt-2">
            <div className="px-4 py-2 bg-gradient-to-br from-red-50/60 to-red-100/40 rounded-full border border-red-300/40 shadow-sm backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-red-500/70" />
                <div className="h-1.5 bg-red-400/60 rounded-full w-16" />
              </div>
            </div>
          </div>

          {/* Highlight bar - slate with texture */}
          <div className="relative transform rotate-[1.1deg]">
            <div className="h-8 bg-gradient-to-r from-slate-200/50 to-slate-300/40 rounded-lg px-4 flex items-center shadow-sm border border-slate-300/30">
              <div className="h-1 bg-slate-500/60 rounded-full w-32" />
            </div>
          </div>

          {/* Zap icon fragment - new */}
          <div className="relative transform rotate-[-0.7deg] mt-1">
            <div className="px-3 py-2 bg-amber-100/50 rounded-lg border border-amber-200/40">
              <Zap className="w-4 h-4 text-amber-600/60" />
            </div>
          </div>
        </div>

        {/* Row 3: Mixed fragments - staggered with more visual interest */}
        <div className="flex flex-wrap gap-5 items-start mt-10">
          {/* Comment fragment - amber with depth */}
          <div className="relative transform rotate-[-1.5deg]">
            <div className="flex items-start gap-2.5 px-4 py-2.5 bg-gradient-to-br from-amber-50/60 to-amber-100/40 rounded-lg shadow-sm border border-amber-200/40 backdrop-blur-sm">
              <Hash className="w-4 h-4 text-amber-500/70 mt-0.5" />
              <div className="space-y-1">
                <div className="h-1.5 bg-amber-400/60 rounded-full w-24" />
                <div className="h-1 bg-amber-300/50 rounded-full w-20" />
              </div>
            </div>
          </div>

          {/* Pricing row fragment - enhanced */}
          <div className="relative transform rotate-[1.2deg] mt-4">
            <div className="px-4 py-3 bg-white/70 rounded-lg border border-slate-300/40 shadow-sm backdrop-blur-sm">
              <div className="grid grid-cols-2 gap-2.5 text-[11px] font-medium text-slate-700/70">
                <div>Plan</div>
                <div>Price</div>
                <div className="col-span-2 h-px bg-slate-300/50" />
                <div>Free</div>
                <div>$0</div>
              </div>
            </div>
          </div>

          {/* Faded score chip - slate with texture */}
          <div className="relative transform rotate-[-0.9deg]">
            <div className="px-4 py-2 bg-gradient-to-br from-slate-100/60 to-slate-200/40 rounded-full border border-slate-300/30 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="h-2 bg-slate-500/60 rounded-full w-14" />
              </div>
            </div>
          </div>

          {/* Partial doc header - soft red enhanced */}
          <div className="relative transform rotate-[1.4deg] mt-3">
            <div className="flex items-center gap-2.5 px-4 py-2.5 bg-red-50/60 rounded-lg border border-red-200/40 shadow-sm backdrop-blur-sm">
              <FileText className="w-4 h-4 text-red-500/60" />
              <div className="h-1.5 bg-red-400/50 rounded-full w-28" />
            </div>
          </div>
        </div>

        {/* Row 4: More scattered fragments - final layer */}
        <div className="flex flex-wrap gap-5 items-start mt-12">
          {/* Highlight bar - soft red with glow */}
          <div className="relative transform rotate-[-0.6deg]">
            <div className="h-9 bg-gradient-to-r from-red-200/50 to-red-300/40 rounded-lg px-4 flex items-center shadow-sm border border-red-300/40 backdrop-blur-sm">
              <div className="h-1.5 bg-red-500/60 rounded-full w-40" />
            </div>
          </div>

          {/* Comment fragment - slate enhanced */}
          <div className="relative transform rotate-[0.9deg] mt-2">
            <div className="flex items-start gap-2.5 px-4 py-2.5 bg-gradient-to-br from-slate-100/60 to-slate-200/40 rounded-lg border border-slate-300/40 shadow-sm backdrop-blur-sm">
              <MessageSquare className="w-4 h-4 text-slate-500/70 mt-0.5" />
              <div className="h-1.5 bg-slate-400/60 rounded-full w-28" />
            </div>
          </div>

          {/* Score chip - amber with depth */}
          <div className="relative transform rotate-[-1.3deg]">
            <div className="px-4 py-2 bg-gradient-to-br from-amber-100/60 to-amber-200/40 rounded-full border border-amber-300/40 shadow-sm backdrop-blur-sm">
              <div className="h-1.5 bg-amber-500/60 rounded-full w-12" />
            </div>
          </div>

          {/* Additional fragment - new */}
          <div className="relative transform rotate-[0.5deg] mt-1">
            <div className="px-3 py-2 bg-white/60 rounded-lg border border-slate-300/30 shadow-sm">
              <TrendingUp className="w-4 h-4 text-slate-600/60" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced noise texture with more presence */}
      <div
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />

    </div>
  )
}




