/**
 * Callout
 * 
 * Small annotation component for inline explanations on marketing pages.
 * Muted, subtle styling for explanatory text.
 */
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface CalloutProps {
  children: ReactNode
  className?: string
}

export function Callout({ children, className }: CalloutProps) {
  return (
    <div
      className={cn(
        "text-xs text-text-muted italic leading-relaxed",
        className
      )}
    >
      {children}
    </div>
  )
}

