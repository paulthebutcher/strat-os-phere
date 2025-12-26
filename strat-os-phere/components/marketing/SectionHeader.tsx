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
        <p className="editorial-kicker">
          {eyebrow}
        </p>
      )}
      <h2 className={cn(
        "editorial-section-headline",
        align === "center" && "mx-auto",
        align === "right" && "ml-auto"
      )}>
        {title}
      </h2>
      {subhead && (
        <div className="editorial-body max-w-[65ch]">
          {typeof subhead === "string" ? <p>{subhead}</p> : subhead}
        </div>
      )}
    </div>
  )
}

