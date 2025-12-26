/**
 * ProblemEvidenceCollage
 * 
 * A composed visual collage that shows the "noise" of strategy work:
 * - Dashboards with scattered metrics
 * - Document fragments with highlighted text
 * - Slack threads with opinions
 * - Slide decks with bold claims
 * 
 * Visual style: Real workspace feeling, but anonymized. Low contrast, restrained.
 * Uses blur + highlight overlays to suggest information overload without showing specifics.
 */
"use client"

import { cn } from "@/lib/utils"
import { sampleAnalysis } from "./sampleReadoutData"

interface ProblemEvidenceCollageProps {
  className?: string
}

export function ProblemEvidenceCollage({ className }: ProblemEvidenceCollageProps) {
  return (
    <div className={cn(
      "relative rounded-2xl border border-border-subtle bg-surface-muted/30 overflow-hidden",
      "aspect-video w-full",
      className
    )}>
      {/* Base gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-slate-50/50" />
      
      {/* Grid overlay for workspace feel */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />
      
      {/* Composed collage tiles */}
      <div className="relative h-full p-6 sm:p-8 md:p-12 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Tile 1: Dashboard fragment (top left) */}
        <div className={cn(
          "relative rounded-lg bg-white/80 backdrop-blur-sm border border-border-subtle/60 shadow-sm",
          "p-3 sm:p-4 space-y-2",
          "transform rotate-[-1.5deg]",
          "col-span-1 row-span-1"
        )}>
          <div className="h-2 bg-slate-200 rounded w-3/4" />
          <div className="h-1 bg-slate-200 rounded w-full" />
          <div className="h-1 bg-slate-200 rounded w-5/6" />
          <div className="grid grid-cols-3 gap-2 mt-3">
            <div className="h-8 bg-blue-100/50 rounded" />
            <div className="h-8 bg-blue-100/50 rounded" />
            <div className="h-8 bg-blue-100/50 rounded" />
          </div>
          {/* Highlight overlay */}
          <div className="absolute top-1 right-1 w-1 h-1 bg-yellow-300/40 rounded-full blur-sm" />
        </div>

        {/* Tile 2: Document fragment (top right) */}
        <div className={cn(
          "relative rounded-lg bg-white/80 backdrop-blur-sm border border-border-subtle/60 shadow-sm",
          "p-3 sm:p-4 space-y-1.5",
          "transform rotate-[1deg]",
          "col-span-1 row-span-1"
        )}>
          <div className="h-2 bg-slate-300 rounded w-full" />
          <div className="h-1.5 bg-slate-200 rounded w-11/12" />
          <div className="h-1 bg-slate-200 rounded w-full" />
          <div className="h-1 bg-slate-200 rounded w-4/5" />
          {/* Highlighted text */}
          <div className="mt-2 p-1.5 bg-yellow-100/60 rounded border border-yellow-200/40">
            <div className="text-[9px] text-yellow-900/70 leading-tight font-medium">
              Users can't evaluate without procurement approval
            </div>
          </div>
          <div className="h-1 bg-slate-200 rounded w-full mt-1" />
        </div>

        {/* Tile 3: Slack thread (bottom left, larger) */}
        <div className={cn(
          "relative rounded-lg bg-white/80 backdrop-blur-sm border border-border-subtle/60 shadow-sm",
          "p-3 sm:p-4 space-y-2",
          "transform rotate-[0.5deg]",
          "col-span-2 md:col-span-1 row-span-2 md:row-span-1"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-purple-200/60" />
            <div className="h-1.5 bg-slate-300 rounded w-20" />
          </div>
          <div className="space-y-1.5">
            <div className="h-1 bg-slate-200 rounded w-full" />
            <div className="h-1 bg-slate-200 rounded w-5/6" />
            <div className="h-1 bg-slate-200 rounded w-full" />
          </div>
          <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border-subtle/40">
            <div className="w-5 h-5 rounded-full bg-blue-200/60" />
            <div className="flex-1 space-y-1">
              <div className="text-[9px] text-slate-600/70 leading-tight font-medium">
                Do we need a free tier to compete with {sampleAnalysis.competitors[0].name}?
              </div>
            </div>
          </div>
          {/* Opinion indicator */}
          <div className="absolute bottom-2 right-2 text-xs text-slate-400 opacity-60">
            💬
          </div>
        </div>

        {/* Tile 4: Slide deck fragment (bottom right) */}
        <div className={cn(
          "relative rounded-lg bg-gradient-to-br from-slate-50 to-white backdrop-blur-sm border border-border-subtle/60 shadow-sm",
          "p-3 sm:p-4 space-y-2",
          "transform rotate-[-0.8deg]",
          "col-span-2 md:col-span-1 row-span-1"
        )}>
          <div className="h-3 bg-slate-800/20 rounded w-1/2 mb-2" />
          <div className="space-y-1.5">
            <div className="h-2 bg-slate-700/15 rounded w-full" />
            <div className="h-1.5 bg-slate-600/10 rounded w-11/12" />
            <div className="h-1.5 bg-slate-600/10 rounded w-10/12" />
          </div>
          {/* Bold claim highlight */}
          <div className="mt-3 p-2 bg-red-50/50 rounded border border-red-100/30">
            <div className="text-[9px] text-red-800/70 leading-tight font-semibold">
              What's the evidence? Which sources?
            </div>
          </div>
        </div>

        {/* Tile 5: Dashboard metrics (overlapping, center) */}
        <div className={cn(
          "relative rounded-lg bg-white/90 backdrop-blur-sm border border-border-subtle/60 shadow-md",
          "p-3 sm:p-4",
          "transform rotate-[1.2deg]",
          "col-span-2 md:col-span-1 row-span-1 hidden md:block",
          "absolute bottom-6 left-1/2 -translate-x-1/2 md:relative md:translate-x-0 md:left-auto md:bottom-auto"
        )}>
          <div className="h-2 bg-slate-300 rounded w-2/3 mb-3" />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <div className="h-1 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-green-100/50 rounded" />
            </div>
            <div className="space-y-1">
              <div className="h-1 bg-slate-200 rounded w-full" />
              <div className="h-4 bg-blue-100/50 rounded" />
            </div>
          </div>
        </div>
      </div>

      {/* Subtle blur overlay for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 via-transparent to-transparent pointer-events-none" />
      
      {/* Noise texture overlay (subtle) */}
      <div 
        className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px'
        }}
      />
    </div>
  )
}

