/**
 * ConfidenceBoundariesPreview
 * 
 * Preview showing confidence range / "what would change the call" section.
 * This is the key differentiator - shows what's supported, what's uncertain, and what would change the recommendation.
 */
"use client"

import { cn } from "@/lib/utils"
import { AlertCircle, ArrowRight } from "lucide-react"
import { sampleAnalysis } from "../sampleReadoutData"

export function ConfidenceBoundariesPreview() {
  return (
    <div className="bg-white p-5 md:p-6 min-h-[320px] flex flex-col">
      {/* Proof-first: Focus on the call and what changes it */}
      <div className="space-y-4">
        {/* Current recommendation - the call */}
        <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-green-600 mt-1 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary mb-1">
                Recommended: {sampleAnalysis.recommendation.title}
              </p>
              <p className="text-xs text-text-secondary">
                {sampleAnalysis.recommendation.confidence} confidence based on competitor analysis and market signals
              </p>
            </div>
          </div>
        </div>

        {/* What would change this call - the boundaries */}
        <div>
          <div className="flex items-center gap-2 mb-2.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <h4 className="text-xs font-semibold text-text-primary">What would change this call?</h4>
          </div>
          <div className="space-y-2">
            {sampleAnalysis.whatWouldChange.slice(0, 2).map((trigger, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2.5 rounded-lg border border-amber-200 bg-amber-50/60">
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="text-xs font-medium text-text-primary mb-0.5">
                    {trigger.event}
                  </p>
                  <p className="text-[11px] text-text-secondary">
                    {trigger.action}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

