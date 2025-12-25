/**
 * SectionHeader
 * 
 * Reusable section header component with eyebrow, title, and subhead.
 * Mobile-responsive typography and spacing.
 */
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionHeaderProps {
  eyebrow?: string
  title: string
  subhead?: string | ReactNode
  className?: string
  align?: "left" | "center" | "right"
}

export function SectionHeader({
  eyebrow,
  title,
  subhead,
  className,
  align = "left",
}: SectionHeaderProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center mx-auto",
    right: "text-right ml-auto",
  }

  return (
    <div className={cn("space-y-3 sm:space-y-4", alignClasses[align], className)}>
      {eyebrow && (
        <p className="text-xs sm:text-sm font-medium text-text-secondary uppercase tracking-wide">
          {eyebrow}
        </p>
      )}
      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight text-text-primary lg:whitespace-nowrap">
        {title}
      </h2>
      {subhead && (
        <div className="text-base sm:text-lg text-text-secondary leading-relaxed max-w-2xl">
          {typeof subhead === "string" ? <p>{subhead}</p> : subhead}
        </div>
      )}
    </div>
  )
}

