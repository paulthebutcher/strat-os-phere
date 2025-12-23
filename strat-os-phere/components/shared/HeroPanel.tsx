import * as React from "react"
import { cn } from "@/lib/utils"
import type { ReactNode } from "react"

interface HeroPanelProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  gradient?: boolean
  className?: string
  children?: ReactNode
  actions?: ReactNode
}

/**
 * HeroPanel - Premium hero section for key pages like New Analysis
 * Supports gradient backgrounds, icons, and CTAs
 */
export function HeroPanel({
  title,
  subtitle,
  icon,
  gradient = true,
  className,
  children,
  actions,
}: HeroPanelProps) {
  return (
    <div
      className={cn(
        "relative rounded-xl p-8 md:p-10 overflow-hidden",
        gradient && "plinth-hero-gradient text-white",
        !gradient && "bg-card border border-border text-card-foreground",
        className
      )}
    >
      {gradient && (
        <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-transparent" />
      )}
      <div className="relative z-10 space-y-4">
        {icon && (
          <div className="flex items-center gap-3">
            {icon}
            <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
              {title}
            </h1>
          </div>
        )}
        {!icon && (
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight">
            {title}
          </h1>
        )}
        {subtitle && (
          <p
            className={cn(
              "text-base md:text-lg max-w-2xl",
              gradient ? "text-white/90" : "text-muted-foreground"
            )}
          >
            {subtitle}
          </p>
        )}
        {children && <div className="pt-2">{children}</div>}
        {actions && <div className="flex items-center gap-3 pt-2">{actions}</div>}
      </div>
    </div>
  )
}

