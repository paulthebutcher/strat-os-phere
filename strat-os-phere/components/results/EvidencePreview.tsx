'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { SafeBadge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { paths } from '@/lib/routes'
import { cn } from '@/lib/utils'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'
import { ExternalLink } from 'lucide-react'
import { PlinthIconDirect } from '@/components/ui/PlinthIcon'

interface EvidencePreviewProps {
  evidenceBundle?: NormalizedEvidenceBundle | null
  coverage?: { totalSources?: number; evidenceTypesPresent?: string[] }
  projectId: string
  className?: string
}

/**
 * EvidencePreview Component
 * 
 * Always renders something - either real sources or skeleton placeholders.
 * Never shows "Evidence unavailable" in red.
 */
export function EvidencePreview({
  evidenceBundle,
  coverage,
  projectId,
  className,
}: EvidencePreviewProps) {
  // Get top 3 sources from bundle
  const topSources = evidenceBundle?.items?.slice(0, 3) ?? []

  // Determine state
  const hasSources = topSources.length > 0
  const hasAnySources = coverage?.totalSources ? coverage.totalSources > 0 : false

  return (
    <Card className={cn('evidence-block', className)}>
      <CardHeader>
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <PlinthIconDirect name="evidence" size={16} className="text-foreground/70" />
          Evidence Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {hasSources ? (
          // Show real sources
          <div className="space-y-3">
            {topSources.map((source) => (
              <div
                key={source.id}
                className="flex items-start justify-between gap-3 p-3 rounded-md border border-border-subtle bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <SafeBadge kind="chip" className="text-xs">
                      {source.type}
                    </SafeBadge>
                    {source.domain && (
                      <span className="text-xs text-muted-foreground truncate">
                        {source.domain}
                      </span>
                    )}
                  </div>
                  {source.title && (
                    <h4 className="text-sm font-medium text-foreground mb-1 line-clamp-2">
                      {source.title}
                    </h4>
                  )}
                  {source.snippet && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {source.snippet}
                    </p>
                  )}
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Open source"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            ))}
            {coverage?.totalSources && coverage.totalSources > topSources.length && (
              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link href={paths.evidence(projectId)}>
                    View all evidence ({coverage.totalSources} {coverage.totalSources === 1 ? 'source' : 'sources'})
                  </Link>
                </Button>
              </div>
            )}
          </div>
        ) : hasAnySources ? (
          // Sources found but not ready yet - show skeleton with message
          <div className="space-y-3">
            <div className="p-4 bg-muted/30 rounded-lg border border-border-subtle">
              <p className="text-sm text-foreground mb-2 font-medium">
                Sources found. Preparing citations.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We only attach sources once they pass relevance checks.
              </p>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md border border-border-subtle">
                <Skeleton className="h-4 w-16" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={paths.evidence(projectId)}>
                  Retry evidence collection
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          // No sources yet - show skeleton with message
          <div className="space-y-3">
            <div className="p-4 bg-muted/30 rounded-lg border border-border-subtle">
              <p className="text-sm text-foreground mb-2 font-medium">
                Evidence collection in progress
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We're gathering sources from competitor sites, reviews, and documentation.
                This decision will sharpen as evidence completes.
              </p>
            </div>
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 p-3 rounded-md border border-border-subtle">
                <Skeleton className="h-4 w-16" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-full" />
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Button asChild variant="outline" size="sm" className="w-full">
                <Link href={paths.competitors(projectId)}>
                  Fetch more evidence
                </Link>
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

