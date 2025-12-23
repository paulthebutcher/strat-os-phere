/**
 * FeatureGrid
 * 
 * Premium feature cards grid component. Renders feature items with icon,
 * title, description, and optional "proof" chip.
 */
import { ReactNode } from "react"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FeatureItem {
  icon: LucideIcon
  title: string
  description: string
  proof?: string
}

interface FeatureGridProps {
  items: FeatureItem[]
  columns?: 2 | 3 | 4
  className?: string
}

export function FeatureGrid({ items, columns = 3, className }: FeatureGridProps) {
  const gridClasses = {
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }

  return (
    <div className={cn("grid gap-6", gridClasses[columns], className)}>
      {items.map((item, index) => {
        const Icon = item.icon
        return (
          <div
            key={index}
            className={cn(
              "panel p-6 rounded-2xl border border-border-subtle",
              "bg-surface shadow-sm hover:shadow-md transition-all",
              "hover:border-accent-primary/30 hover:-translate-y-0.5"
            )}
          >
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent-primary/10">
                <Icon className="h-6 w-6 text-accent-primary" />
              </div>
              {item.proof && (
                <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-accent-primary/10 text-accent-primary border border-accent-primary/20">
                  {item.proof}
                </span>
              )}
            </div>
            <h3 className="mb-2 text-base font-semibold text-text-primary">
              {item.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              {item.description}
            </p>
          </div>
        )
      })}
    </div>
  )
}

