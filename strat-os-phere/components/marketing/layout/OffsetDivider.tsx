/**
 * OffsetDivider
 * 
 * Asymmetric divider line with a small label (e.g., "Proof", "Signals", "Resolution").
 * Offset alignment (not centered) to break the SaaS grid feel.
 * 
 * Creates editorial rhythm and section transitions.
 */
"use client"

import { cn } from "@/lib/utils"

interface OffsetDividerProps {
  /** Small label text */
  label: string
  /** Alignment: "left" (default, offset) or "right" */
  align?: "left" | "right"
  /** Additional className */
  className?: string
}

export function OffsetDivider({
  label,
  align = "left",
  className,
}: OffsetDividerProps) {
  return (
    <div
      className={cn(
        "relative w-full py-6 sm:py-8",
        className
      )}
    >
      <div
        className={cn(
          "relative",
          align === "left" ? "ml-[8%] mr-0" : "ml-0 mr-[8%]"
        )}
      >
        {/* Divider line */}
        <div
          className={cn(
            "h-px",
            "bg-[hsl(var(--hairline))]",
            align === "left" ? "mr-0" : "ml-auto"
          )}
        />
        
        {/* Label */}
        <div
          className={cn(
            "mt-2",
            align === "left" ? "text-left" : "text-right ml-auto"
          )}
        >
          <span className="editorial-meta text-[hsl(var(--ink-1))] uppercase tracking-wider">
            {label}
          </span>
        </div>
      </div>
    </div>
  )
}

