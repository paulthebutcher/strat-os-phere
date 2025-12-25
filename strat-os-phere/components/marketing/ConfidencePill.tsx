/**
 * ConfidencePill
 * 
 * Displays a confidence level badge/pill for opportunities.
 * Used in marketing pages to show confidence states.
 */
import { cn } from "@/lib/utils"

type ConfidenceLevel = "exploratory" | "directional" | "investment_ready"

interface ConfidencePillProps {
  level: ConfidenceLevel
  className?: string
}

const confidenceLabels: Record<ConfidenceLevel, string> = {
  exploratory: "Exploratory",
  directional: "Directional",
  investment_ready: "Investment-ready",
}

const confidenceColors: Record<ConfidenceLevel, string> = {
  exploratory: "bg-amber-50 text-amber-700 border-amber-200",
  directional: "bg-blue-50 text-blue-700 border-blue-200",
  investment_ready: "bg-green-50 text-green-700 border-green-200",
}

export function ConfidencePill({ level, className }: ConfidencePillProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border",
        confidenceColors[level],
        className
      )}
    >
      {confidenceLabels[level]}
    </span>
  )
}

