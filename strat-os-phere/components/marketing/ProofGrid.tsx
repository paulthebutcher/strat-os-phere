/**
 * ProofGrid
 * 
 * Structural proof blocks showing how Plinth thinks without showing UI.
 * Asymmetric layout with different sizes = different importance.
 * 
 * Blocks:
 * - Coverage block (source count, competitor coverage)
 * - Confidence block (bounded vs speculative)
 * - Change conditions block (clear invalidation signals)
 * 
 * Principles:
 * - Minimal copy, strong labels
 * - Show structure, not UI
 */
"use client"

import { cn } from "@/lib/utils"
import { Database, Shield, AlertTriangle, CheckCircle2 } from "lucide-react"
import { sampleAnalysis } from "./sampleReadoutData"

interface ProofGridProps {
  className?: string
}

export function ProofGrid({ className }: ProofGridProps) {
  return (
    <div
      className={cn(
        "w-full grid grid-cols-1 md:grid-cols-12 gap-6",
        className
      )}
    >
      {/* Coverage Block - Large, Left (spans 7 cols) */}
      <div className="md:col-span-7 space-y-4 p-8 rounded-xl border-2 border-border-subtle bg-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-slate-100">
            <Database className="w-6 h-6 text-slate-700" />
          </div>
          <h3 className="text-xl font-semibold text-text-primary">
            Evidence Coverage
          </h3>
        </div>
        
        <div className="space-y-6 pt-4">
          <div>
            <div className="text-4xl font-bold text-text-primary mb-2">
              {sampleAnalysis.evidence.totalSources}
            </div>
            <div className="text-sm text-text-secondary font-medium">
              Sources analyzed
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border-subtle">
            <div>
              <div className="text-2xl font-bold text-text-primary mb-1">
                {sampleAnalysis.competitors.length}
              </div>
              <div className="text-xs text-text-secondary">
                Competitors tracked
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-text-primary mb-1">
                {sampleAnalysis.evidence.types.length}
              </div>
              <div className="text-xs text-text-secondary">
                Evidence types
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Block - Medium, Top Right (spans 5 cols) */}
      <div className="md:col-span-5 space-y-4 p-6 rounded-xl border-2 border-border-subtle bg-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-amber-100">
            <Shield className="w-5 h-5 text-amber-700" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            Confidence Boundaries
          </h3>
        </div>
        
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-text-primary text-sm">
                Bounded signals
              </div>
              <div className="text-xs text-text-secondary mt-1">
                Competitive pricing, public documentation, verified reviews
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-semibold text-text-primary text-sm">
                Speculative signals
              </div>
              <div className="text-xs text-text-secondary mt-1">
                Internal strategy, unconfirmed rumors, future plans
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Conditions Block - Full Width Below (spans 12 cols) */}
      <div className="md:col-span-12 space-y-4 p-6 rounded-xl border-2 border-border-subtle bg-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-red-100">
            <AlertTriangle className="w-5 h-5 text-red-700" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary">
            Invalidation Conditions
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {sampleAnalysis.whatWouldChange.slice(0, 3).map((condition, idx) => (
            <div key={idx} className="space-y-2">
              <div className="text-xs font-semibold text-text-muted uppercase tracking-wide">
                Condition {idx + 1}
              </div>
              <div className="text-sm text-text-secondary leading-relaxed">
                {condition.event}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

