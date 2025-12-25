/**
 * ConfidenceBoundariesPreview
 * 
 * Preview showing confidence range / "what would change the call" section.
 * This is the key differentiator - shows what's supported, what's uncertain, and what would change the recommendation.
 */
"use client"

import { cn } from "@/lib/utils"
import { AlertCircle, ArrowRight } from "lucide-react"

export function ConfidenceBoundariesPreview() {
  return (
    <div className="bg-white p-6 md:p-8 min-h-[350px] flex flex-col">
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Confidence boundaries
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            What's supported, what's uncertain, and what would change the recommendation
          </p>
        </div>

        {/* Current recommendation */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-start gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-600 mt-1.5 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-text-primary mb-1">
                Recommended: Ship SSO in Q2
              </p>
              <p className="text-xs text-text-secondary">
                High confidence based on competitor analysis and market signals
              </p>
            </div>
          </div>
        </div>

        {/* What would change this call */}
        <div className="pt-4 border-t border-border-subtle">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-4 h-4 text-amber-600" />
            <h4 className="text-sm font-semibold text-text-primary">What would change this call?</h4>
          </div>
          <div className="space-y-2">
            <div className="flex items-start gap-2 p-3 rounded-lg border border-border-subtle bg-amber-50/50">
              <ArrowRight className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-text-primary mb-1">
                  Competitor pricing shifts
                </p>
                <p className="text-[11px] text-text-secondary">
                  Monitor pricing pages monthly for changes
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-3 rounded-lg border border-border-subtle bg-amber-50/50">
              <ArrowRight className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-medium text-text-primary mb-1">
                  New market data emerges
                </p>
                <p className="text-[11px] text-text-secondary">
                  Track industry reports and competitor announcements
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

