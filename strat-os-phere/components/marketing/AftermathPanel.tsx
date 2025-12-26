/**
 * AftermathPanel
 * 
 * Show downstream impact without feature lists.
 * 
 * Visual treatment:
 * - Symbolic representations
 * - Closed loops instead of endless cycles
 * - Clean timelines instead of branching debates
 * - Fewer artifacts, more resolution
 * - Calm, confident composition
 * 
 * Minimal text. Clear implication:
 * "This is what alignment looks like."
 */
"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, ArrowRight, Circle } from "lucide-react"

interface AftermathPanelProps {
  className?: string
}

export function AftermathPanel({ className }: AftermathPanelProps) {
  return (
    <div
      className={cn(
        "relative w-full min-h-[500px] p-8 sm:p-12 overflow-hidden",
        "bg-gradient-to-br from-white via-slate-50/50 to-white",
        "border border-slate-200/60",
        className
      )}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px'
        }}
      />

      <div className="relative z-10">
        {/* Closed Loop - Clean Timeline */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white border-2 border-slate-200 rounded-xl p-8 shadow-sm">
            {/* Timeline header */}
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-semibold text-slate-900">Decision Timeline</h3>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="font-medium">Resolved</span>
              </div>
            </div>
            
            {/* Clean, linear timeline */}
            <div className="relative">
              {/* Timeline line - neutral slate instead of green */}
              <div className="absolute left-0 top-1/2 w-full h-1 bg-slate-300 rounded-full -translate-y-1/2" />
              
              {/* Timeline nodes */}
              <div className="relative flex items-center justify-between">
                {/* Decision Made - neutral */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-400 shadow-md flex items-center justify-center">
                    <Circle className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-900">Decision</div>
                    <div className="text-xs text-slate-600">Made</div>
                  </div>
                </div>
                
                {/* Execution In Progress - neutral */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-slate-400 shadow-md flex items-center justify-center">
                    <Circle className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-900">Execution</div>
                    <div className="text-xs text-slate-600">In Progress</div>
                  </div>
                </div>
                
                {/* Outcome Measured - green (earned resolution) */}
                <div className="flex flex-col items-center gap-2 z-10">
                  <div className="w-8 h-8 rounded-full bg-green-600 border-4 border-white shadow-md flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-white" />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-slate-900">Outcome</div>
                    <div className="text-xs text-slate-600">Measured</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Symbolic Alignment Indicators */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {/* Alignment 1 - Team Alignment: blue for evidence/alignment */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Circle className="w-3 h-3 text-blue-600" strokeWidth={2.5} />
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Circle className="w-3 h-3 text-blue-600" strokeWidth={2.5} />
              <ArrowRight className="w-4 h-4 text-slate-400" />
              <Circle className="w-3 h-3 text-blue-600" strokeWidth={2.5} />
            </div>
            <div className="text-sm font-semibold text-slate-900 mb-1">
              Team Alignment
            </div>
            <div className="text-xs text-slate-600">
              Single source of truth
            </div>
          </div>

          {/* Alignment 2 - Clear Resolution: green but toned down */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-12 h-12 rounded-lg bg-green-50 border-2 border-green-400 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <div className="text-sm font-semibold text-slate-900 mb-1">
              Clear Resolution
            </div>
            <div className="text-xs text-slate-600">
              No ambiguity
            </div>
          </div>

          {/* Alignment 3 - Forward Motion: neutral (motion ≠ success yet) */}
          <div className="bg-white border border-slate-200 rounded-lg p-6 text-center shadow-sm">
            <div className="flex items-center justify-center gap-2 mb-3">
              <div className="w-8 h-0.5 bg-slate-400 rounded-full" />
              <div className="w-8 h-0.5 bg-slate-400 rounded-full" />
              <div className="w-8 h-0.5 bg-slate-400 rounded-full" />
            </div>
            <div className="text-sm font-semibold text-slate-900 mb-1">
              Forward Motion
            </div>
            <div className="text-xs text-slate-600">
              Continuous progress
            </div>
          </div>
        </div>

        {/* Bottom: Minimal text, maximum implication */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <p className="text-base text-slate-700 leading-relaxed">
            This is what alignment looks like.
          </p>
        </div>
      </div>
    </div>
  )
}

