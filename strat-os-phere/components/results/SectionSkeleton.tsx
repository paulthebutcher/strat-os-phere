'use client'

import { Badge } from '@/components/ui/badge'

interface SectionSkeletonProps {
  title: string
  description?: string
}

/**
 * Skeleton component shown when an artifact section is still generating
 */
export function SectionSkeleton({ title, description }: SectionSkeletonProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Badge variant="muted" className="gap-1">
          <div className="h-2 w-2 animate-pulse rounded-full bg-primary" />
          Generating…
        </Badge>
      </div>
      <div className="space-y-3">
        <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
        <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
        <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
      </div>
    </div>
  )
}

