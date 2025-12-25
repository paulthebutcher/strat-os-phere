/**
 * FeatureList
 * 
 * Reusable feature list component for scannable bullet points.
 * Mobile-responsive: stacks on mobile, can be grid on desktop.
 */
import { ReactNode } from "react"
import { cn } from "@/lib/utils"

interface FeatureItem {
  title?: string
  content: string | ReactNode
}

interface FeatureListProps {
  items: FeatureItem[]
  variant?: "bullets" | "grid" | "stacked"
  columns?: 1 | 2 | 3 | 4
  className?: string
}

export function FeatureList({
  items,
  variant = "bullets",
  columns = 1,
  className,
}: FeatureListProps) {
  const gridCols = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  }

  if (variant === "bullets") {
    return (
      <ul className={cn("space-y-2 sm:space-y-3", className)}>
        {items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 sm:gap-3">
            <span className="text-primary mt-1.5 shrink-0">•</span>
            <div className="flex-1 min-w-0">
              {item.title && (
                <span className="font-medium text-text-primary">{item.title}: </span>
              )}
              <span className="text-sm sm:text-base text-text-secondary leading-relaxed">
                {typeof item.content === "string" ? item.content : item.content}
              </span>
            </div>
          </li>
        ))}
      </ul>
    )
  }

  if (variant === "grid") {
    return (
      <div className={cn("grid gap-4 sm:gap-6", gridCols[columns], className)}>
        {items.map((item, idx) => (
          <div key={idx} className="space-y-1">
            {item.title && (
              <h3 className="text-sm sm:text-base font-semibold text-text-primary">
                {item.title}
              </h3>
            )}
            <p className="text-sm text-text-secondary leading-relaxed">
              {typeof item.content === "string" ? item.content : item.content}
            </p>
          </div>
        ))}
      </div>
    )
  }

  // Stacked variant
  return (
    <div className={cn("space-y-4 sm:space-y-6", className)}>
      {items.map((item, idx) => (
        <div key={idx} className="space-y-1">
          {item.title && (
            <h3 className="text-sm sm:text-base font-semibold text-text-primary">
              {item.title}
            </h3>
          )}
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            {typeof item.content === "string" ? item.content : item.content}
          </p>
        </div>
      ))}
    </div>
  )
}

