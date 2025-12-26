/**
 * Signal Stack
 * 
 * Replaces "Plinth does the digging" screenshots.
 * A vertical or clustered stack of small cards representing inputs:
 * - Pricing pages
 * - Docs
 * - Reviews
 * - Competitors
 * 
 * Each card shows:
 * - Source type
 * - Count
 * - Small icon
 * - Muted color
 * 
 * Visually communicates: "Plinth aggregates real signals before forming an opinion."
 */
"use client"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { SourceTypeIcon } from "./icons/PlinthIcons"
import { FileText, MessageSquare, TrendingUp, DollarSign } from "lucide-react"
import { sampleAnalysis } from "./sampleReadoutData"

interface SignalStackProps {
  className?: string
  variant?: "vertical" | "clustered"
  signals?: Array<{ type: string; count: number }>
}

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Pricing: DollarSign,
  Docs: FileText,
  Reviews: MessageSquare,
  Changelog: TrendingUp,
  Community: MessageSquare,
  Blog: FileText,
}

export function SignalStack({
  className,
  variant = "vertical",
  signals = sampleAnalysis.evidence.types,
}: SignalStackProps) {
  if (variant === "clustered") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {signals.map((signal, idx) => {
          const Icon = iconMap[signal.type] || FileText
          return (
            <div
              key={idx}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-surface-muted/50 border border-border-subtle"
            >
              <Icon size={14} className="text-text-muted" />
              <span className="text-xs font-medium text-text-secondary">{signal.type}</span>
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                {signal.count}
              </Badge>
            </div>
          )
        })}
      </div>
    )
  }

  // Vertical stack
  return (
    <div className={cn("space-y-2", className)}>
      {signals.map((signal, idx) => {
        const Icon = iconMap[signal.type] || FileText
        return (
          <div
            key={idx}
            className="flex items-center justify-between px-3 py-2 rounded-lg bg-surface-muted/50 border border-border-subtle"
          >
            <div className="flex items-center gap-2">
              <Icon size={14} className="text-text-muted" />
              <span className="text-xs font-medium text-text-secondary">{signal.type}</span>
            </div>
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {signal.count}
            </Badge>
          </div>
        )
      })}
    </div>
  )
}

