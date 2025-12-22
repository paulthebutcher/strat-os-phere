"use client"

import type { ReactNode } from "react"
import { brand } from "@/lib/ui/brand"
import { cn } from "@/lib/utils"

export interface TrustChipItem {
  icon?: ReactNode
  label: string
  tone?: "neutral" | "good" | "warn" | "bad"
}

interface TrustChipsProps {
  items: TrustChipItem[]
  className?: string
}

/**
 * TrustChips - Small pills with consistent spacing and subtle tinted backgrounds
 * Used to display trust signals, metadata, and status indicators
 */
export function TrustChips({ items, className }: TrustChipsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {items.map((item, index) => {
        const tone = item.tone || "neutral"
        const toneClasses = brand.tone[tone]
        
        return (
          <div
            key={index}
            className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium",
              toneClasses.bg,
              toneClasses.text,
              toneClasses.border
            )}
          >
            {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
            <span>{item.label}</span>
          </div>
        )
      })}
    </div>
  )
}

