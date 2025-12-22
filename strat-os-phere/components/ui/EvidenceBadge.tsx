"use client"

import { FileText, Clock, CheckCircle2 } from "lucide-react"
import { TrustChips } from "./TrustChips"
import type { TrustChipItem } from "./TrustChips"

interface EvidenceBadgeProps {
  evidenceWindowDays?: number
  updatedLabel?: string
  confidenceLabel?: "High" | "Medium" | "Low"
  className?: string
}

/**
 * EvidenceBadge - Displays evidence metadata in a compact chip format
 * Shows evidence window, recency, and confidence level
 */
export function EvidenceBadge({
  evidenceWindowDays = 90,
  updatedLabel,
  confidenceLabel = "High",
  className,
}: EvidenceBadgeProps) {
  const items: TrustChipItem[] = [
    {
      icon: <FileText className="h-3 w-3" />,
      label: "Public evidence",
      tone: "neutral",
    },
    {
      icon: <Clock className="h-3 w-3" />,
      label: updatedLabel || `Last ${evidenceWindowDays} days`,
      tone: "neutral",
    },
    {
      icon: <CheckCircle2 className="h-3 w-3" />,
      label: `Confidence: ${confidenceLabel}`,
      tone: confidenceLabel === "High" ? "good" : confidenceLabel === "Medium" ? "warn" : "bad",
    },
  ]

  return <TrustChips items={items} className={className} />
}

