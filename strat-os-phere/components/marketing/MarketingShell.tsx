/**
 * MarketingShell
 * 
 * Narrative frame wrapper for marketing pages. Provides consistent max width,
 * generous vertical rhythm, section spacing, and background treatment.
 * Sets up "hero rail" + "content rail" patterns used across sections.
 */
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MarketingShellProps {
  children: ReactNode
  className?: string
}

export function MarketingShell({ children, className }: MarketingShellProps) {
  return (
    <div className={cn("min-h-screen w-full", className)}>
      <div className="relative w-full">
        {/* Subtle background grid overlay - CSS only */}
        <div 
          className="fixed inset-0 opacity-[0.015] pointer-events-none z-0"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px',
          }}
        />
        {/* Gradient spotlight behind hero - CSS only */}
        <div 
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `
              radial-gradient(ellipse 1200px 800px at 50% -200px, 
                hsl(var(--marketing-gradient-start) / 0.08) 0%,
                transparent 50%
              )
            `,
          }}
        />
        {/* Content wrapper with relative positioning */}
        <div className="relative z-10">
          {children}
        </div>
      </div>
    </div>
  )
}

