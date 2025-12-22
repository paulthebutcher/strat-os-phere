import { cn } from '@/lib/utils'

/**
 * Skeleton card component for loading states
 * Matches the visual structure of panel cards used throughout the app
 */
export function SkeletonCard({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'panel p-6 space-y-4 animate-pulse',
        className
      )}
    >
      <div className="space-y-2">
        <div className="h-5 bg-muted rounded w-3/4" />
        <div className="h-4 bg-muted rounded w-1/2" />
      </div>
      <div className="space-y-3">
        <div className="h-4 bg-muted rounded" />
        <div className="h-4 bg-muted rounded w-5/6" />
        <div className="h-4 bg-muted rounded w-4/6" />
      </div>
    </div>
  )
}

/**
 * Skeleton table rows for loading competitor lists and similar data tables
 */
export function SkeletonTable({ rows = 3 }: { rows?: number }) {
  return (
    <div className="panel divide-y divide-border-subtle">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="px-4 py-3 space-y-2 animate-pulse">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-muted rounded w-1/4" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
            <div className="h-8 bg-muted rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Generic skeleton line for inline loading states
 */
export function SkeletonLine({ width = 'full', className }: { width?: string; className?: string }) {
  return (
    <div
      className={cn(
        'h-4 bg-muted rounded animate-pulse',
        width === 'full' ? 'w-full' : width,
        className
      )}
    />
  )
}

