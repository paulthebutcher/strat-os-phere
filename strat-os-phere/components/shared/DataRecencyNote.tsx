import { Info } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DataRecencyNoteProps {
  /**
   * Custom message override
   */
  message?: string
  /**
   * Custom className
   */
  className?: string
}

/**
 * Note component explaining data recency/freshness policy
 * Reuses existing "last 90 days" messaging in a consistent style
 */
export function DataRecencyNote({
  message = 'Insights derived from publicly available information from the past 90 days, including marketing materials, reviews, pricing, changelogs, and documentation.',
  className,
}: DataRecencyNoteProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-md bg-muted/50 border border-border px-3 py-2',
        className
      )}
    >
      <Info className="h-4 w-4 shrink-0 mt-0.5 text-muted-foreground" />
      <p className="text-xs text-muted-foreground leading-relaxed">{message}</p>
    </div>
  )
}

