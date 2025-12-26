/**
 * StakesDossierPanel
 * 
 * Documentary / dossier feel showing the gravity of being wrong.
 * 
 * Visual elements:
 * - Redacted memo blocks
 * - "Decision pending" stamps
 * - Branching timelines
 * - Highlighted risk notes
 * - Sparse color
 * - Strong framing
 * 
 * No product. No UI.
 * This section should feel heavier than the one above it.
 */
"use client"

import { cn } from "@/lib/utils"
import { AlertTriangle, Clock, FileText, XCircle } from "lucide-react"

interface StakesDossierPanelProps {
  className?: string
}

export function StakesDossierPanel({ className }: StakesDossierPanelProps) {
  return (
    <div
      className={cn(
        "relative w-full min-h-[600px] p-8 sm:p-12 overflow-hidden",
        "bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95",
        "border-2 border-slate-700/50",
        className
      )}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }}
      />

      <div className="relative z-10 space-y-8">
        {/* Redacted Memo Block */}
        <div className="bg-slate-800/60 border border-slate-700/50 p-6 rounded-lg shadow-lg backdrop-blur-sm">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" />
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
                Internal Memo
              </span>
            </div>
            <div className="px-3 py-1 bg-red-900/40 border border-red-800/50 rounded text-xs font-bold text-red-300 uppercase tracking-wider">
              Decision Pending
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="h-4 bg-slate-700/60 rounded w-3/4" />
            <div className="h-3 bg-slate-700/40 rounded w-1/2" />
            <div className="h-3 bg-slate-700/40 rounded w-2/3" />
            
            {/* Redacted lines */}
            <div className="pt-2 space-y-2">
              <div className="h-3 bg-black/40 rounded w-full" />
              <div className="h-3 bg-black/40 rounded w-5/6" />
              <div className="h-3 bg-black/40 rounded w-full" />
            </div>
            
            <div className="h-3 bg-slate-700/40 rounded w-1/3" />
          </div>
        </div>

        {/* Branching Timeline */}
        <div className="bg-slate-800/40 border border-slate-700/40 p-6 rounded-lg">
          <div className="flex items-center gap-2 mb-4">
            <Clock className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wide">
              Decision Timeline
            </span>
          </div>
          
          <div className="relative">
            {/* Main timeline line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-slate-600/50" />
            
            {/* Timeline nodes */}
            <div className="space-y-6 relative">
              {/* Node 1 */}
              <div className="flex items-start gap-4">
                <div className="w-4 h-4 rounded-full bg-slate-600 border-2 border-slate-500 z-10 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-300 mb-1">
                    Q1 Planning
                  </div>
                  <div className="text-xs text-slate-500">
                    Decision required
                  </div>
                </div>
              </div>
              
              {/* Branching paths */}
              <div className="ml-8 space-y-4 border-l-2 border-slate-700/50 pl-4">
                <div className="flex items-start gap-3">
                  <XCircle className="w-3 h-3 text-red-400/60 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-400 mb-0.5">
                      Path A: Proceed
                    </div>
                    <div className="text-xs text-slate-600">
                      Risk: High uncertainty
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <XCircle className="w-3 h-3 text-red-400/60 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-slate-400 mb-0.5">
                      Path B: Delay
                    </div>
                    <div className="text-xs text-slate-600">
                      Risk: Market moves
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Node 2 */}
              <div className="flex items-start gap-4 pt-4">
                <div className="w-4 h-4 rounded-full bg-slate-600 border-2 border-slate-500 z-10 mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-300 mb-1">
                    Q2 Execution
                  </div>
                  <div className="text-xs text-slate-500">
                    Outcome unknown
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-red-900/20 border border-red-800/40 p-4 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-red-400/70 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-red-300 uppercase tracking-wide mb-1">
                  Cost of Delay
                </div>
                <div className="text-xs text-red-200/70 leading-relaxed">
                  Every week of indecision compounds competitive disadvantage
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-amber-900/20 border border-amber-800/40 p-4 rounded-lg">
            <div className="flex items-start gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-amber-400/70 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <div className="text-xs font-semibold text-amber-300 uppercase tracking-wide mb-1">
                  Opportunity Cost
                </div>
                <div className="text-xs text-amber-200/70 leading-relaxed">
                  Resources allocated elsewhere while decision remains unresolved
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom stamp overlay */}
        <div className="absolute bottom-8 right-8 transform rotate-12 opacity-30">
          <div className="px-6 py-3 bg-slate-800/80 border-2 border-dashed border-slate-600/50 rounded">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Under Review
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

