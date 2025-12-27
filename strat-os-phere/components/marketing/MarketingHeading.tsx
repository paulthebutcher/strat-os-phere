/**
 * MarketingHeading
 * 
 * Safe, reusable component for large marketing headlines that prevents
 * descender clipping. Ensures proper line-height and bottom padding.
 * 
 * Usage:
 * - For hero/section headlines (h1/h2)
 * - Automatically handles descender protection
 * - Supports optional accent spans for colored words
 */
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface MarketingHeadingProps {
  /** The heading element type */
  as?: "h1" | "h2"
  /** The headline text */
  children: ReactNode
  /** Optional span for colored/accented word */
  accent?: ReactNode
  /** Additional className */
  className?: string
  /** Size variant */
  size?: "large" | "xlarge"
}

export function MarketingHeading({
  as: Component = "h2",
  children,
  accent,
  className,
  size = "large",
}: MarketingHeadingProps) {
  const sizeClasses = {
    large: "text-4xl sm:text-5xl md:text-6xl lg:text-7xl",
    xlarge: "text-5xl sm:text-6xl md:text-7xl lg:text-8xl",
  }

  return (
    <Component
      className={cn(
        "font-bold tracking-tight text-text-primary",
        "leading-[1.1] pb-[0.12em]",
        "overflow-visible",
        sizeClasses[size],
        className
      )}
    >
      {children}
      {accent && <span className="editorial-gradient-text">{accent}</span>}
    </Component>
  )
}

