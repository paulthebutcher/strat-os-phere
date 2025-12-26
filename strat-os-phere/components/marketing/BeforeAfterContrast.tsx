/**
 * Before/After Contrast Visual
 * 
 * Split-frame visual showing the transformation from chaos to clarity.
 * Left: "Before" - messy, overlapping sources of opinions
 * Right: "After" - clean Plinth Decision Readout
 * 
 * This is the emotional hook of the page - makes the value proposition instantly clear.
 */
"use client"

import { cn } from "@/lib/utils"
import { DecisionCredibilityVisual } from "./DecisionCredibilityVisual"
import { FileText, MessageSquare, Presentation } from "lucide-react"

interface BeforeAfterContrastProps {
  className?: string
}

export function BeforeAfterContrast({ className }: BeforeAfterContrastProps) {
  return (
    <div className={cn(
      "relative w-full rounded-2xl border-2 border-border-subtle overflow-hidden bg-white shadow-xl",
      className
    )}>
      {/* Split container */}
      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border-subtle">
        
        {/* LEFT: "Before" - Opinion Chaos */}
        <div className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50/50 p-6 sm:p-8 md:p-10">
          {/* Overlay label */}
          <div className="absolute top-4 left-4 z-10">
            <div className="bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5">
              <span className="text-xs font-semibold text-amber-900 uppercase tracking-wide">
                Opinion
              </span>
            </div>
          </div>

          {/* Chaos collage - overlapping, tilted layers */}
          <div className="relative h-full min-h-[400px] md:min-h-[500px]">
            
            {/* Layer 1: Slack thread (back, tilted) */}
            <div className={cn(
              "absolute top-8 left-4 w-[85%] rounded-lg bg-white/90 backdrop-blur-sm",
              "border border-border-subtle/60 shadow-md p-4 space-y-2",
              "transform rotate-[-2deg] z-0"
            )}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-purple-200/60" />
                <div className="h-1.5 bg-slate-300 rounded w-24" />
              </div>
              <div className="space-y-1.5">
                <div className="h-1 bg-slate-200 rounded w-full" />
                <div className="h-1 bg-slate-200 rounded w-5/6" />
                <div className="h-1 bg-slate-200 rounded w-full" />
              </div>
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border-subtle/40">
                <div className="w-4 h-4 rounded-full bg-blue-200/60" />
                <div className="flex-1 space-y-1">
                  <div className="h-1 bg-slate-200 rounded w-full" />
                  <div className="h-1 bg-slate-200 rounded w-3/4" />
                </div>
              </div>
              <div className="absolute bottom-2 right-2">
                <MessageSquare className="w-4 h-4 text-slate-400 opacity-60" />
              </div>
            </div>

            {/* Layer 2: Google Doc with highlights (middle, tilted) */}
            <div className={cn(
              "absolute top-16 right-6 w-[80%] rounded-lg bg-white/90 backdrop-blur-sm",
              "border border-border-subtle/60 shadow-md p-4 space-y-1.5",
              "transform rotate-[1.5deg] z-10"
            )}>
              <div className="h-2 bg-slate-300 rounded w-full" />
              <div className="h-1.5 bg-slate-200 rounded w-11/12" />
              <div className="h-1 bg-slate-200 rounded w-full" />
              <div className="h-1 bg-slate-200 rounded w-4/5" />
              {/* Highlighted text */}
              <div className="mt-2 p-1.5 bg-yellow-100/70 rounded border border-yellow-200/50">
                <div className="h-1 bg-yellow-600/40 rounded w-full" />
                <div className="h-1 bg-yellow-600/40 rounded w-3/4 mt-0.5" />
              </div>
              <div className="h-1 bg-slate-200 rounded w-full mt-1" />
              <div className="absolute top-2 right-2">
                <FileText className="w-4 h-4 text-slate-400 opacity-60" />
              </div>
            </div>

            {/* Layer 3: Pricing page with callouts (front, tilted) */}
            <div className={cn(
              "absolute bottom-12 left-8 w-[75%] rounded-lg bg-white/95 backdrop-blur-sm",
              "border-2 border-red-200/40 shadow-lg p-4 space-y-2",
              "transform rotate-[-1deg] z-20"
            )}>
              <div className="h-2 bg-slate-800/20 rounded w-1/2 mb-2" />
              <div className="space-y-1.5">
                <div className="h-2 bg-slate-700/15 rounded w-full" />
                <div className="h-1.5 bg-slate-600/10 rounded w-11/12" />
              </div>
              {/* Red callout */}
              <div className="mt-3 p-2 bg-red-50/60 rounded border border-red-100/40">
                <div className="h-2 bg-red-200/50 rounded w-full font-semibold" />
              </div>
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500/80 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">!</span>
              </div>
            </div>

            {/* Layer 4: Slide deck with comments (overlapping) */}
            <div className={cn(
              "absolute bottom-6 right-4 w-[70%] rounded-lg bg-gradient-to-br from-slate-50 to-white",
              "backdrop-blur-sm border border-border-subtle/60 shadow-md p-4 space-y-2",
              "transform rotate-[0.8deg] z-30"
            )}>
              <div className="h-3 bg-slate-800/20 rounded w-1/2 mb-2" />
              <div className="space-y-1.5">
                <div className="h-2 bg-slate-700/15 rounded w-full" />
                <div className="h-1.5 bg-slate-600/10 rounded w-11/12" />
              </div>
              {/* Comment indicator */}
              <div className="absolute bottom-2 right-2">
                <Presentation className="w-4 h-4 text-red-400 opacity-70" />
              </div>
            </div>

            {/* Noise overlay for depth */}
            <div 
              className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none z-40"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                backgroundSize: '200px 200px'
              }}
            />
          </div>
        </div>

        {/* RIGHT: "After" - Plinth Clarity */}
        <div className="relative bg-white p-6 sm:p-8 md:p-10">
          {/* Overlay label */}
          <div className="absolute top-4 right-4 z-10">
            <div className="bg-green-50 border border-green-200 rounded-md px-3 py-1.5">
              <span className="text-xs font-semibold text-green-900 uppercase tracking-wide">
                Proof
              </span>
            </div>
          </div>

          {/* Clean Plinth Decision Readout */}
          <div className="h-full min-h-[400px] md:min-h-[500px] flex items-center justify-center">
            <div className="w-full max-w-[480px] scale-90 md:scale-100">
              <DecisionCredibilityVisual />
            </div>
          </div>
        </div>
      </div>

      {/* Divider line with arrow (optional, subtle) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 hidden md:block">
        <div className="bg-white border-2 border-accent-primary rounded-full p-2 shadow-lg">
          <svg 
            className="w-6 h-6 text-accent-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </div>
      </div>
    </div>
  )
}

