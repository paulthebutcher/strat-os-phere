/**
 * NextStepsPreview
 * 
 * Preview showing next steps / recommended validations.
 * Shows clear actions to increase confidence — customer checks, competitive scans, and tests.
 */
"use client"

import { cn } from "@/lib/utils"
import { CheckCircle2, ArrowRight } from "lucide-react"

const nextSteps = [
  {
    title: "Customer validation",
    description: "Survey 20 enterprise customers on SSO requirements",
    type: "customer" as const,
  },
  {
    title: "Competitive scan",
    description: "Monitor competitor pricing pages for changes",
    type: "competitive" as const,
  },
  {
    title: "Market test",
    description: "Run A/B test on pricing page messaging",
    type: "test" as const,
  },
]

export function NextStepsPreview() {
  return (
    <div className="bg-white p-6 md:p-8 min-h-[300px] flex flex-col">
      <div className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-text-primary mb-2">
            Next moves
          </h3>
          <p className="text-xs text-text-secondary mb-4">
            Clear actions to increase confidence — customer checks, competitive scans, and tests
          </p>
        </div>

        {/* Next steps list */}
        <div className="space-y-2">
          {nextSteps.map((step, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-surface-muted/30"
            >
              <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-text-primary mb-1">
                  {step.title}
                </p>
                <p className="text-xs text-text-secondary">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

