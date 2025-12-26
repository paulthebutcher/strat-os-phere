/**
 * MarketingSection
 * 
 * Full-bleed section wrapper with consistent spacing and variant treatments.
 * Single source of truth for homepage layout rhythm.
 * 
 * Supports:
 * - tone: Visual treatment (default, alt, subtle)
 * - density: Vertical spacing (tight, normal, spacious)
 */
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface MarketingSectionProps {
  children: ReactNode
  /** Visual treatment variant */
  tone?: "default" | "alt" | "subtle"
  /** Vertical spacing density */
  density?: "tight" | "normal" | "spacious" | "dense"
  /** Legacy variant prop (maps to tone) */
  variant?: "default" | "muted" | "gradient" | "bordered" | "tinted"
  className?: string
  id?: string
}

export function MarketingSection({
  children,
  tone,
  density = "normal",
  variant,
  className,
  id,
}: MarketingSectionProps) {
  // Map legacy variant to tone if tone not provided
  const resolvedTone = tone || (variant === "muted" || variant === "tinted" ? "alt" : variant === "gradient" ? "subtle" : "default")
  
  const baseClasses = "w-full"
  
  const toneClasses = {
    default: "bg-transparent", // Inherit background from marketing-landing
    alt: "bg-slate-50/60",
    subtle: "bg-gradient-to-b from-accent-primary/5 via-transparent to-transparent",
  }

  const densityClasses = {
    tight: "py-12 sm:py-14 md:py-16",
    normal: "py-16 sm:py-18 md:py-20",
    spacious: "py-20 sm:py-24 md:py-28",
    dense: "py-10 sm:py-12 md:py-14", // Reduced padding for evidence-heavy areas
  }
  
  // Subtle section separator (not heavy borders) - removed for cleaner transitions
  const separatorClasses = ""

  return (
    <section
      id={id}
      className={cn(
        baseClasses,
        toneClasses[resolvedTone],
        densityClasses[density],
        separatorClasses,
        className
      )}
    >
      {children}
    </section>
  )
}

