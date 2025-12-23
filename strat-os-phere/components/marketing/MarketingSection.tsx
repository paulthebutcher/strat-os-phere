/**
 * MarketingSection
 * 
 * Full-bleed section wrapper with consistent spacing and variant treatments.
 * Supports different visual treatments for section separation.
 */
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface MarketingSectionProps {
  children: ReactNode
  variant?: "default" | "muted" | "gradient" | "bordered" | "tinted"
  bleed?: boolean
  className?: string
  id?: string
}

export function MarketingSection({
  children,
  variant = "default",
  bleed = true,
  className,
  id,
}: MarketingSectionProps) {
  const baseClasses = "w-full"
  
  const variantClasses = {
    default: "bg-background",
    muted: "bg-surface-muted/30",
    gradient: "bg-gradient-to-b from-accent-primary/5 via-transparent to-transparent",
    bordered: "bg-background border-y border-border-subtle",
    tinted: "bg-surface-muted/50",
  }

  const spacingClasses = "py-16 md:py-24"

  return (
    <section
      id={id}
      className={cn(
        baseClasses,
        variantClasses[variant],
        spacingClasses,
        className
      )}
    >
      {children}
    </section>
  )
}

