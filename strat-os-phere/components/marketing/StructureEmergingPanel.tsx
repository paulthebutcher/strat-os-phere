/**
 * StructureEmergingPanel
 * 
 * Visually communicate the transition from noise to form.
 * 
 * Visual treatment:
 * - Fragments from earlier acts begin to align
 * - Loose elements snap into rows and columns
 * - Signals become grouped
 * - Clear boundaries appear
 * 
 * This is not the app yet.
 * It's the concept of structure.
 * 
 * Think: "The fog is lifting."
 */
"use client"

import { cn } from "@/lib/utils"
import { FileText, DollarSign, MessageSquare, GitBranch, TrendingUp } from "lucide-react"

interface StructureEmergingPanelProps {
  className?: string
}

export function StructureEmergingPanel({ className }: StructureEmergingPanelProps) {
  return (
    <div
      className={cn(
        "relative w-full min-h-[500px] p-8 sm:p-12 overflow-hidden",
        "bg-gradient-to-br from-slate-50 via-white to-slate-50/80",
        "border border-slate-200/60",
        className
      )}
    >
      {/* Subtle grid that becomes visible */}
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px'
        }}
      />

      <div className="relative z-10">
        {/* Top: Fragments beginning to align */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-3 items-center justify-center">
            {/* Evidence type groups - now aligned */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <DollarSign className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Pricing</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">23</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <FileText className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Docs</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">31</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <MessageSquare className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Reviews</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">47</span>
            </div>
            
            <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <GitBranch className="w-4 h-4 text-slate-600" />
              <span className="text-sm font-semibold text-slate-700">Changelog</span>
              <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">12</span>
            </div>
          </div>
        </div>

        {/* Middle: Signals grouped into structured rows */}
        <div className="space-y-4 mb-8">
          {/* Signal Group 1 */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-slate-600" />
              <h4 className="text-sm font-semibold text-slate-900">Competitive Positioning</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
              <div className="text-xs text-slate-600">
                <div className="font-medium text-slate-900">4 of 5</div>
                <div className="text-slate-500">offer free tiers</div>
              </div>
              <div className="text-xs text-slate-600">
                <div className="font-medium text-slate-900">Recent</div>
                <div className="text-slate-500">expansions noted</div>
              </div>
              <div className="text-xs text-slate-600">
                <div className="font-medium text-slate-900">Market</div>
                <div className="text-slate-500">expectation shift</div>
              </div>
              <div className="text-xs text-slate-600">
                <div className="font-medium text-slate-900">Timing</div>
                <div className="text-slate-500">favorable</div>
              </div>
            </div>
          </div>

          {/* Signal Group 2 */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <h4 className="text-sm font-semibold text-slate-900">Market Friction</h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
              <div className="text-xs text-slate-600">
                <div className="font-medium text-slate-900">Enterprise</div>
                <div className="text-slate-500">evaluation delays</div>
              </div>
              <div className="text-xs text-slate-600">
                <div className="font-medium text-slate-900">Mid-market</div>
                <div className="text-slate-500">longer trials</div>
              </div>
              <div className="text-xs text-slate-600">
                <div className="font-medium text-slate-900">Pattern</div>
                <div className="text-slate-500">consistent</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Clear boundaries appearing - narrative summary, not dashboard */}
        <div className="bg-white border-2 border-slate-300 rounded-lg p-6 shadow-md">
          <div className="flex items-center justify-between mb-4 pb-4 border-b-2 border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Structure Emerging
              </div>
              <div className="text-lg font-bold text-slate-900">
                Signals aligned
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">
                Clarity
              </div>
              <div className="text-lg font-bold text-slate-900">
                Increasing
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-3 bg-slate-50 rounded border border-slate-200">
              <div className="text-2xl font-bold text-slate-900 mb-1">✓</div>
              <div className="text-xs text-slate-600">Grouped</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded border border-slate-200">
              <div className="text-2xl font-bold text-slate-900 mb-1">✓</div>
              <div className="text-xs text-slate-600">Organized</div>
            </div>
            <div className="text-center p-3 bg-slate-50 rounded border border-slate-200">
              <div className="text-2xl font-bold text-slate-900 mb-1">✓</div>
              <div className="text-xs text-slate-600">Bounded</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

