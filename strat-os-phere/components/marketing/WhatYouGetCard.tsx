/**
 * What You Get Card
 * 
 * Reusable card component with consistent structure:
 * - Title
 * - Description (1-2 lines, clamped)
 * - Fixed-size preview block
 */
import { cn } from "@/lib/utils"

interface WhatYouGetCardProps {
  title: string
  description: string
  Preview: React.ComponentType
}

export function WhatYouGetCard({ title, description, Preview }: WhatYouGetCardProps) {
  return (
    <div className={cn(
      "group rounded-2xl border border-border-subtle bg-surface",
      "shadow-sm hover:shadow-md hover:border-accent-primary/30",
      "transition-all duration-200 hover:-translate-y-[1px]",
      "flex flex-col h-full"
    )}>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-lg font-semibold tracking-tight text-text-primary">
          {title}
        </h3>
        <p className={cn(
          "mt-2 text-sm leading-6 text-text-secondary",
          "line-clamp-2"
        )}>
          {description}
        </p>

        {/* Preview block: same size for all cards */}
        <div className={cn(
          "mt-5 rounded-xl border border-border-subtle",
          "bg-surface-muted/30 p-4",
          "group-hover:border-accent-primary/30 transition-colors"
        )}>
          <div className="h-[140px] md:h-[140px] w-full overflow-hidden flex items-center justify-center">
            <Preview />
          </div>
        </div>
      </div>
    </div>
  )
}

