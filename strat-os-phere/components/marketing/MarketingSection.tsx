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
    default: "bg-transparent", // Inherit tan background from marketing-landing
    muted: "bg-slate-50/60",
    gradient: "bg-gradient-to-b from-accent-primary/5 via-transparent to-transparent",
    bordered: "bg-white border-y border-black/5",
    tinted: "bg-slate-50/60",
  }

  const spacingClasses = "py-16 md:py-24"
  
  // Add border-t to all sections except gradient (which handles its own styling)
  const borderClasses = variant !== "gradient" ? "border-t border-black/5" : ""

  return (
    <section
      id={id}
      className={cn(
        baseClasses,
        variantClasses[variant],
        spacingClasses,
        borderClasses,
        className
      )}
    >
      {children}
    </section>
  )
}

