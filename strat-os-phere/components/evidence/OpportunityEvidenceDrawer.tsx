'use client'

import * as React from 'react'
import { ExternalLink } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { formatSourceType } from '@/lib/ux/evidenceStrength'
import { cn } from '@/lib/utils'

/**
 * Citation type for EvidenceDrawer
 * Matches OpportunityV1 Citation schema but with optional fields
 */
export interface EvidenceDrawerCitation {
  url: string
  sourceType: string
  excerpt: string
  evidenceId?: string
  retrievedAt?: string
  label?: string
}

interface EvidenceDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  opportunityTitle: string
  citations: EvidenceDrawerCitation[]
  onAddEvidenceHref?: string
}

/**
 * Extract domain from URL
 */
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    // If URL parsing fails, try to extract domain manually
    const match = url.match(/https?:\/\/(?:www\.)?([^\/]+)/)
    return match ? match[1] : url
  }
}

/**
 * Truncate text to approximately maxLength characters
 */
function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trim() + '...'
}

/**
 * OpportunityEvidenceDrawer - Displays citations for an opportunity
 * 
 * Shows a drawer with a list of citations including:
 * - Domain (derived from URL)
 * - Type (sourceType)
 * - Label/title if available (else domain)
 * - Excerpt (truncated to ~200 chars)
 * - Link to open source in new tab
 */
export function OpportunityEvidenceDrawer({
  open,
  onOpenChange,
  opportunityTitle,
  citations,
  onAddEvidenceHref,
}: EvidenceDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Evidence for {opportunityTitle}</SheetTitle>
          <SheetDescription>
            Citations supporting this opportunity. Click "Open source" to view the original evidence.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {citations.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              No citations available for this opportunity.
            </div>
          ) : (
            <>
              {citations.map((citation, index) => {
                const domain = extractDomain(citation.url)
                const displayLabel = citation.label || domain
                const excerpt = truncateText(citation.excerpt, 200)

                return (
                  <div
                    key={citation.evidenceId || index}
                    className="rounded-lg border border-border bg-surface p-4 space-y-3"
                  >
                    {/* Header row: Domain, Type, Link */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-foreground truncate">
                            {displayLabel}
                          </span>
                          <Badge variant="secondary" className="text-xs shrink-0">
                            {formatSourceType(citation.sourceType)}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {domain}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        asChild
                        className="shrink-0"
                      >
                        <a
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1.5"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Open source</span>
                        </a>
                      </Button>
                    </div>

                    {/* Excerpt */}
                    <p className="text-sm text-foreground leading-relaxed">
                      {excerpt}
                    </p>

                    {/* Optional metadata */}
                    {(citation.retrievedAt || citation.evidenceId) && (
                      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                        {citation.retrievedAt && (
                          <div>
                            Retrieved: {new Date(citation.retrievedAt).toLocaleDateString()}
                          </div>
                        )}
                        {citation.evidenceId && (
                          <div className="font-mono text-xs opacity-70">
                            ID: {citation.evidenceId}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </>
          )}
        </div>

        {/* Add evidence guidance */}
        {onAddEvidenceHref && (
          <div className="mt-6 pt-6 border-t border-border">
            <div className="rounded-lg bg-muted/30 border border-border p-4 space-y-3">
              <p className="text-sm font-medium text-foreground">
                Improve evidence coverage
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Add more competitors or expand evidence sources to strengthen this opportunity.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href={onAddEvidenceHref}>Add evidence</a>
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
