/**
 * "What Would Change the Call" Visual
 * 
 * A dedicated visual component that makes Plinth's monitoring/trigger concept
 * immediately understandable. Shows a small card stack with:
 * - Trigger event
 * - Evidence type
 * - Monitoring action
 * 
 * This makes Plinth feel alive, not static.
 */
"use client"

import { cn } from "@/lib/utils"
import { ChangeTriggerIcon, EvidenceIcon } from "./icons/PlinthIcons"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp, FileText } from "lucide-react"
import { sampleAnalysis } from "./sampleReadoutData"

interface WhatWouldChangeVisualProps {
  className?: string
  variant?: "compact" | "detailed"
}

export function WhatWouldChangeVisual({ 
  className,
  variant = "detailed"
}: WhatWouldChangeVisualProps) {
  const triggers = sampleAnalysis.whatWouldChange

  if (variant === "compact") {
    return (
      <div className={cn("space-y-3", className)}>
        {triggers.slice(0, 2).map((trigger, index) => (
          <div
            key={index}
            className="flex items-start gap-3 p-3 rounded-lg border border-border-subtle bg-surface-muted/30"
          >
            <ChangeTriggerIcon size={18} className="mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium">
                {trigger.event}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {trigger.evidenceType}
                </Badge>
                <span className="text-xs text-text-muted">
                  → {trigger.action}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <ChangeTriggerIcon size={20} />
        <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wide">
          What Would Change This Call
        </h4>
      </div>

      {/* Card stack - slightly offset for depth */}
      <div className="relative space-y-3">
        {triggers.map((trigger, index) => (
          <div
            key={index}
            className={cn(
              "relative rounded-lg border-2 border-border-subtle bg-white shadow-sm p-4 space-y-3",
              "transform transition-all",
              index === 0 && "z-30 shadow-md",
              index === 1 && "z-20 -mt-2 ml-2 opacity-90",
              index === 2 && "z-10 -mt-2 ml-4 opacity-80"
            )}
            style={{
              transform: index > 0 ? `translateX(${index * 8}px) translateY(-${index * 8}px)` : undefined
            }}
          >
            {/* Trigger event */}
            <div className="flex items-start gap-2">
              <AlertCircle 
                size={16} 
                className={cn(
                  "mt-0.5 shrink-0",
                  trigger.priority === "high" ? "text-amber-500" : "text-blue-500"
                )} 
              />
              <p className="text-sm text-text-primary leading-relaxed flex-1">
                {trigger.event}
              </p>
            </div>

            {/* Evidence type + action */}
            <div className="flex items-center gap-3 pt-2 border-t border-border-subtle">
              <div className="flex items-center gap-2">
                {(trigger.evidenceType === "reviews" || trigger.evidenceType === "community") && <FileText size={14} className="text-text-muted" />}
                {trigger.evidenceType === "changelog" && <TrendingUp size={14} className="text-text-muted" />}
                <Badge variant="secondary" className="text-xs">
                  {trigger.evidenceType}
                </Badge>
              </div>
              <span className="text-xs text-text-muted">→</span>
              <span className="text-xs text-text-secondary font-medium">
                {trigger.action}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Footer note */}
      <p className="text-xs text-text-muted italic pt-2">
        Plinth monitors these automatically. You'll know when evidence shifts.
      </p>
    </div>
  )
}

