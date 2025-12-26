/**
 * PaperSection
 * 
 * Marketing-only wrapper component that applies the Plinth Ink + Paper visual language.
 * Adds paper texture, hairline borders, gentle shadows, and consistent padding.
 * 
 * Variants:
 * - paper: Base paper tone with subtle shadow
 * - paperRaised: Slightly warmer tone with more elevation
 */
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface PaperSectionProps {
  /** Paper tone variant */
  tone?: "paper" | "paperRaised"
  /** Section content */
  children: ReactNode
  /** Additional className */
  className?: string
}

export function PaperSection({
  tone = "paper",
  children,
  className,
}: PaperSectionProps) {
  return (
    <section
      className={cn(
        tone === "paper" ? "plinth-paper-section" : "plinth-paper-section-raised",
        className
      )}
    >
      {children}
    </section>
  )
}

