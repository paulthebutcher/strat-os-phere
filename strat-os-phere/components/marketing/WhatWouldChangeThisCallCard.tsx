/**
 * What Would Change This Call? Card
 * 
 * Replaces annotations and callouts.
 * A compact list card with:
 * - 2–3 concrete conditions
 * - Each tied to a signal type (reviews, pricing, adoption)
 * 
 * This is one of Plinth's most unique ideas and should be visually first-class.
 */
"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ChangeTriggerIcon } from "./icons/PlinthIcons"
import { sampleAnalysis } from "./sampleReadoutData"

interface WhatWouldChangeThisCallCardProps {
  className?: string
  triggers?: Array<{
    event: string
    evidenceType: string
    action: string
    priority?: "high" | "medium" | "low"
  }>
  maxItems?: number
}

export function WhatWouldChangeThisCallCard({
  className,
  triggers = sampleAnalysis.whatWouldChange,
  maxItems = 3,
}: WhatWouldChangeThisCallCardProps) {
  const displayTriggers = triggers.slice(0, maxItems)

  return (
    <div
      className={cn(
        "rounded-lg border border-border-subtle bg-surface-muted/30 p-4 md:p-5 space-y-3",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <ChangeTriggerIcon size={18} />
        <h4 className="text-sm font-semibold text-text-primary">What would change this call?</h4>
      </div>

      {/* Trigger list */}
      <ul className="space-y-2.5">
        {displayTriggers.map((trigger, idx) => (
          <li key={idx} className="flex items-start gap-2.5">
            <span className="text-text-muted mt-1">•</span>
            <div className="flex-1 min-w-0 space-y-1">
              <p className="text-sm text-text-primary leading-relaxed">{trigger.event}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  {trigger.evidenceType}
                </Badge>
                <span className="text-xs text-text-muted">→</span>
                <span className="text-xs text-text-secondary">{trigger.action}</span>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

