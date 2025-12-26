/**
 * ProblemEvidenceCollage
 * 
 * Real workspace chaos: overlapping Slack threads, highlighted docs with conflicting notes,
 * pricing tables without conclusions, slides with comments and no resolution.
 * 
 * Each visual is clearly an input without synthesis, not generic mess.
 */
"use client"

import { cn } from "@/lib/utils"
import { MessageSquare, FileText, Presentation, DollarSign } from "lucide-react"
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
      <div className="relative h-full p-6 sm:p-8 md:p-12">
        
        {/* Layer 1: Slack thread with conflicting opinions (back, tilted) */}
        <div className={cn(
          "absolute top-8 left-4 w-[42%] rounded-lg bg-white/75 backdrop-blur-sm",
          "border border-purple-200/40 shadow-sm p-3 space-y-2",
          "transform rotate-[-2deg] z-0"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded-full bg-purple-300/60" />
            <div className="h-1.5 bg-slate-300 rounded w-24" />
            <span className="text-[8px] text-slate-500/60 ml-auto">12:34 PM</span>
          </div>
          <div className="space-y-1.5 text-xs text-slate-700/80">
            <div className="h-1 bg-slate-300/60 rounded w-full" />
            <div className="h-1 bg-slate-300/60 rounded w-5/6" />
          </div>
          <div className="flex items-start gap-2 mt-3 pt-2 border-t border-purple-200/30">
            <div className="w-4 h-4 rounded-full bg-blue-300/60 mt-0.5" />
            <div className="flex-1">
              <div className="text-[9px] text-slate-700/80 leading-tight font-medium mb-1">
                Do we need a free tier to compete with {sampleAnalysis.competitors[0].name}?
              </div>
              <div className="text-[8px] text-slate-500/60 italic">
                Not sure, their pricing is confusing
              </div>
            </div>
          </div>
          <div className="flex items-start gap-2 pt-2">
            <div className="w-4 h-4 rounded-full bg-green-300/60 mt-0.5" />
            <div className="flex-1">
              <div className="text-[9px] text-slate-700/80 leading-tight">
                Their free tier only does 7 days retention
              </div>
            </div>
          </div>
          <MessageSquare className="absolute bottom-2 right-2 w-4 h-4 text-purple-400/50" />
        </div>

        {/* Layer 2: Google Doc with conflicting highlighted notes (middle, tilted) */}
        <div className={cn(
          "absolute top-12 right-6 w-[38%] rounded-lg bg-white/75 backdrop-blur-sm",
          "border border-yellow-200/40 shadow-sm p-3 space-y-1",
          "transform rotate-[1.5deg] z-10"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-yellow-600/60" />
            <div className="h-1.5 bg-slate-300 rounded flex-1" />
          </div>
          <div className="h-1 bg-slate-300/60 rounded w-full" />
          <div className="h-1 bg-slate-300/60 rounded w-11/12" />
          <div className="h-1 bg-slate-300/60 rounded w-4/5" />
          {/* Highlighted text with conflicting note */}
          <div className="mt-2 p-1.5 bg-yellow-200/70 rounded border border-yellow-300/50">
            <div className="text-[9px] text-yellow-900/80 leading-tight font-medium mb-1">
              Users can't evaluate without procurement approval
            </div>
            <div className="text-[8px] text-orange-700/70 italic border-l-2 border-orange-400/50 pl-1.5">
              But Sarah said they do allow trials?
            </div>
          </div>
          <div className="h-1 bg-slate-300/60 rounded w-full mt-1" />
          <div className="flex items-center gap-1 mt-2 pt-1 border-t border-yellow-200/30">
            <span className="text-[7px] text-slate-500/60">3 comments</span>
            <span className="text-[7px] text-slate-400">·</span>
            <span className="text-[7px] text-slate-500/60">No resolution</span>
          </div>
        </div>

        {/* Layer 3: Pricing table without conclusions (front, tilted) */}
        <div className={cn(
          "absolute bottom-10 left-8 w-[40%] rounded-lg bg-white/80 backdrop-blur-sm",
          "border border-red-200/40 shadow-sm p-3 space-y-2",
          "transform rotate-[-1deg] z-20"
        )}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-red-600/60" />
            <div className="h-2 bg-slate-800/30 rounded w-1/2" />
          </div>
          <div className="space-y-1.5">
            <div className="grid grid-cols-3 gap-1 text-[8px] text-slate-600/70">
              <div className="font-semibold">Plan</div>
              <div className="font-semibold">Price</div>
              <div className="font-semibold">Retention</div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[8px] text-slate-700/80 pt-1 border-t border-red-200/30">
              <div>Free</div>
              <div>$0</div>
              <div>7 days</div>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[8px] text-slate-700/80">
              <div>Pro</div>
              <div>$49</div>
              <div>90 days</div>
            </div>
          </div>
          {/* Red callout with question */}
          <div className="mt-3 p-2 bg-red-50/70 rounded border border-red-200/50">
            <div className="text-[9px] text-red-800/80 leading-tight font-semibold mb-0.5">
              Free plan: 1 service / 7 days retention
            </div>
            <div className="text-[8px] text-red-700/70 italic">
              Is this a competitive weakness?
            </div>
          </div>
        </div>

        {/* Layer 4: Slide deck with comments and no resolution (overlapping, muted) */}
        <div className={cn(
          "absolute bottom-6 right-4 w-[35%] rounded-lg bg-gradient-to-br from-slate-50/85 to-white/85",
          "backdrop-blur-sm border border-slate-300/40 shadow-sm p-3 space-y-1.5",
          "transform rotate-[0.8deg] z-30"
        )}>
          <div className="h-3 bg-slate-800/25 rounded w-1/2 mb-2" />
          <div className="space-y-1.5">
            <div className="h-2 bg-slate-700/20 rounded w-full" />
            <div className="h-1.5 bg-slate-600/15 rounded w-11/12" />
            <div className="h-1.5 bg-slate-600/15 rounded w-10/12" />
          </div>
          {/* Comment indicator with unresolved question */}
          <div className="absolute bottom-2 right-2">
            <Presentation className="w-4 h-4 text-red-500/60" />
          </div>
          <div className="absolute top-10 left-3 bg-blue-50/90 border border-blue-200/60 rounded px-1.5 py-1">
            <div className="text-[8px] text-blue-900/80 leading-tight italic">
              What's the evidence? Which sources?
            </div>
            <div className="text-[7px] text-blue-700/60 mt-0.5">No reply</div>
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

