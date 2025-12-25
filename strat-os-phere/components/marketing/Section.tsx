/**
 * Section
 * 
 * Premium reusable section component with consistent typography, spacing,
 * and responsive layout. Handles eyebrow, title, description, and children content.
 */
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface SectionProps {
  eyebrow?: string
  title?: string
  description?: string
  children: ReactNode
  align?: "left" | "center" | "right"
  tone?: "default" | "muted" | "accent"
  className?: string
  id?: string
}

export function Section({
  eyebrow,
  title,
  description,
  children,
  align = "center",
  tone = "default",
  className,
  id,
}: SectionProps) {
  const alignClasses = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }

  const toneClasses = {
    default: "bg-background",
    muted: "bg-surface-muted/30",
    accent: "bg-surface-muted/50",
  }

  return (
    <section
      id={id}
      className={cn(
        "w-full py-12 sm:py-16 md:py-24 lg:py-32",
        toneClasses[tone],
        className?.includes("border-t-0") ? "" : "border-t border-border-subtle",
        className
      )}
    >
      <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl")}>
        {/* Header section */}
        {(eyebrow || title || description) && (
          <div className={cn("mb-8 sm:mb-12 md:mb-16", alignClasses[align])}>
            {eyebrow && (
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-accent-primary mb-2 sm:mb-3">
                {eyebrow}
              </p>
            )}
            {title && (
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight text-text-primary mb-3 sm:mb-4 leading-tight lg:whitespace-nowrap">
                {title}
              </h2>
            )}
            {description && (
              <p className={cn(
                "text-sm sm:text-base md:text-lg leading-relaxed text-text-secondary line-clamp-3 sm:line-clamp-none",
                align === "center" ? "max-w-3xl mx-auto" : "max-w-3xl"
              )}>
                {description}
              </p>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className={align === "center" ? "" : alignClasses[align]}>
          {children}
        </div>
      </div>
    </section>
  )
}

