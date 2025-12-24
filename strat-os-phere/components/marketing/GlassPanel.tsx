/**
 * GlassPanel
 * 
 * Reusable glass morphism component for marketing pages.
 * Provides consistent "liquid glass" styling with backdrop blur and subtle borders.
 * Variants: default, strong (hero frame), nav (floating nav)
 */
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlassPanelProps {
  children: ReactNode
  className?: string
  variant?: "default" | "strong" | "nav"
  hover?: boolean
}

export function GlassPanel({ 
  children, 
  className, 
  variant = "default",
  hover = false 
}: GlassPanelProps) {
  const baseClasses = "backdrop-blur-md border rounded-2xl"
  
  const variantClasses = {
    default: "bg-white/55 border-white/40 shadow-soft",
    strong: "bg-white/70 border-white/50 shadow-md",
    nav: "bg-white/60 border-white/40 shadow-sm",
  }
  
  const hoverClasses = hover 
    ? "transition-all hover:bg-white/75 hover:shadow-md hover:border-white/60"
    : ""

  return (
    <div
      className={cn(
        baseClasses,
        variantClasses[variant],
        hoverClasses,
        className
      )}
    >
      {children}
    </div>
  )
}

