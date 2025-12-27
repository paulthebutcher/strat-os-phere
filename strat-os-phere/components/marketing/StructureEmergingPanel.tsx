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

import { useState } from "react"
import { cn } from "@/lib/utils"
import { FileText, DollarSign, MessageSquare, GitBranch, TrendingUp, Check } from "lucide-react"

interface StructureEmergingPanelProps {
  className?: string
}

type EvidenceType = "pricing" | "docs" | "reviews" | "changelog"

interface EvidenceTypeConfig {
  id: EvidenceType
  label: string
  icon: typeof DollarSign
  count: number
  color: string
  railColor: string
}

const evidenceTypes: EvidenceTypeConfig[] = [
  {
    id: "pricing",
    label: "Pricing",
    icon: DollarSign,
    count: 23,
    color: "hsl(142, 60%, 40%)", // Success green
    railColor: "hsl(142, 60%, 40%)",
  },
  {
    id: "docs",
    label: "Docs",
    icon: FileText,
    count: 31,
    color: "hsl(var(--accent-primary))", // Indigo/blue
    railColor: "hsl(var(--accent-primary))",
  },
  {
    id: "reviews",
    label: "Reviews",
    icon: MessageSquare,
    count: 47,
    color: "hsl(38, 80%, 45%)", // Warning amber
    railColor: "hsl(38, 80%, 45%)",
  },
  {
    id: "changelog",
    label: "Changelog",
    icon: GitBranch,
    count: 12,
    color: "hsl(var(--marketing-gradient-end))", // Purple
    railColor: "hsl(var(--marketing-gradient-end))",
  },
]

export function StructureEmergingPanel({ className }: StructureEmergingPanelProps) {
  const [selectedTab, setSelectedTab] = useState<EvidenceType>("pricing")

  const selectedType = evidenceTypes.find((t) => t.id === selectedTab)!

  return (
    <div
      className={cn(
        "relative w-full min-h-[500px] p-6 sm:p-10 overflow-hidden",
        "bg-gradient-to-br from-slate-50 via-white to-slate-50/80",
        "border border-slate-200/60",
        "shadow-[inset_0_1px_2px_0_rgba(0,0,0,0.02)]",
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

      <div className="relative z-10 flex flex-col gap-6">
        {/* Tabs: Evidence type groups */}
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {evidenceTypes.map((type) => {
            const Icon = type.icon
            const isSelected = selectedTab === type.id
            
            return (
              <button
                key={type.id}
                onClick={() => setSelectedTab(type.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all",
                  "border",
                  isSelected
                    ? [
                        "bg-white",
                        "border-[hsl(var(--accent-primary))]/30",
                        "shadow-sm",
                        "[&_svg]:text-[hsl(var(--accent-primary))]",
                      ]
                    : [
                        "bg-white/80 border-slate-200/60",
                        "hover:bg-white hover:border-slate-300/60",
                        "[&_svg]:text-slate-600",
                      ]
                )}
                style={
                  isSelected
                    ? {
                        backgroundColor: `hsl(var(--accent-primary) / 0.06)`,
                        borderColor: `hsl(var(--accent-primary) / 0.25)`,
                      }
                    : undefined
                }
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-semibold text-slate-700">{type.label}</span>
                <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  {type.count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Confidence cue */}
        <div className="text-center">
          <p className="text-xs text-slate-500">
            113 sources grouped into 4 evidence types
          </p>
        </div>

        {/* Insight cards with signal rails */}
        <div className="space-y-3">
          {/* Signal Group 1 - Competitive Positioning (Pricing category - green) */}
          <div
            className="bg-white border border-slate-200 rounded-lg shadow-sm relative overflow-hidden"
            style={{
              borderLeftWidth: "3px",
              borderLeftColor: evidenceTypes[0].railColor, // Pricing - green
            }}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-semibold text-slate-900">Competitive Positioning</h4>
                <span className="ml-auto text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  12 signals
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Recent
                  </div>
                  <div className="text-sm font-medium text-slate-900">4 of 5</div>
                  <div className="text-xs text-slate-500 mt-0.5">offer free tiers</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Market
                  </div>
                  <div className="text-sm font-medium text-slate-900">Expansions</div>
                  <div className="text-xs text-slate-500 mt-0.5">noted</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Timing
                  </div>
                  <div className="text-sm font-medium text-slate-900">Favorable</div>
                  <div className="text-xs text-slate-500 mt-0.5">expectation shift</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Pattern
                  </div>
                  <div className="text-sm font-medium text-slate-900">Consistent</div>
                  <div className="text-xs text-slate-500 mt-0.5">across segments</div>
                </div>
              </div>
            </div>
          </div>

          {/* Signal Group 2 - Market Friction (Docs category - blue) */}
          <div
            className="bg-white border border-slate-200 rounded-lg shadow-sm relative overflow-hidden"
            style={{
              borderLeftWidth: "3px",
              borderLeftColor: evidenceTypes[1].railColor, // Docs - indigo/blue
            }}
          >
            <div className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <FileText className="w-4 h-4 text-slate-600" />
                <h4 className="text-sm font-semibold text-slate-900">Market Friction</h4>
                <span className="ml-auto text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                  8 signals
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Enterprise
                  </div>
                  <div className="text-sm font-medium text-slate-900">Evaluation</div>
                  <div className="text-xs text-slate-500 mt-0.5">delays</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Mid-market
                  </div>
                  <div className="text-sm font-medium text-slate-900">Longer</div>
                  <div className="text-xs text-slate-500 mt-0.5">trials</div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Pattern
                  </div>
                  <div className="text-sm font-medium text-slate-900">Consistent</div>
                  <div className="text-xs text-slate-500 mt-0.5">across segments</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Status bar with progression steps */}
        <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-5">
          {/* Status bar header */}
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Structure emerging
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Clarity:
              </div>
              <div className="text-sm font-semibold text-slate-900">Increasing</div>
              <div className="flex gap-1 ml-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-primary))]" />
                <div className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--accent-primary))]" />
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>
            </div>
          </div>
          
          {/* Progression steps */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Grouped", color: "hsl(var(--accent-primary))" },
              { label: "Organized", color: "hsl(var(--accent-primary))" },
              { label: "Bounded", color: "hsl(var(--accent-primary))" },
            ].map((step, idx) => (
              <div
                key={idx}
                className="text-center p-3 rounded border border-slate-200 transition-all"
                style={{
                  backgroundColor: `hsl(var(--accent-primary) / 0.04)`,
                }}
              >
                <div className="mb-1.5">
                  <Check
                    className="w-5 h-5 mx-auto"
                    style={{ color: step.color }}
                  />
                </div>
                <div className="text-xs font-medium text-slate-700">{step.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
