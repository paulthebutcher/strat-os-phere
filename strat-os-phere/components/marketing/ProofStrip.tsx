/**
 * ProofStrip
 * 
 * Horizontal credibility strip with 3-4 proof points.
 * Displays trust/principles copy as "proof points" with icons.
 */
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface ProofPoint {
  icon: LucideIcon
  label: string
  description?: string
}

interface ProofStripProps {
  items: ProofPoint[]
  className?: string
}

export function ProofStrip({ items, className }: ProofStripProps) {
  return (
    <div className={cn("w-full py-8 md:py-12 border-t border-border-subtle bg-background", className)}>
      <div className="mx-auto w-full px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {items.map((item, index) => {
            const Icon = item.icon
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center space-y-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent-primary/10">
                  <Icon className="h-5 w-5 text-accent-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {item.label}
                  </p>
                  {item.description && (
                    <p className="text-xs text-text-secondary mt-1">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

