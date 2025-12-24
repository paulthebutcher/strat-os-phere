/**
 * GlassPanel
 * 
 * Reusable glass morphism component for marketing pages.
 * Provides consistent "liquid glass" styling with backdrop blur and subtle borders.
 */
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface GlassPanelProps {
  children: ReactNode
  className?: string
  hover?: boolean
}

export function GlassPanel({ children, className, hover = false }: GlassPanelProps) {
  return (
    <div
      className={cn(
        "bg-white/60 backdrop-blur-md border border-black/5 rounded-2xl shadow-sm",
        hover && "transition-all hover:bg-white/70 hover:shadow-md hover:border-black/10",
        className
      )}
    >
      {children}
    </div>
  )
}

