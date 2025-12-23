'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card } from '@/components/ui/card'
import type { NormalizedEvidenceBundle, NormalizedEvidenceType } from '@/lib/evidence/types'
import { summarizeEvidenceBundle } from '@/lib/evidence/evidenceReport'
import type { EvidenceClaim, ClaimsByType } from '@/lib/evidence/claims/types'

const LABEL: Record<NormalizedEvidenceType, string> = {
  pricing: 'Pricing',
  docs: 'Docs',
  reviews: 'Reviews',
  jobs: 'Jobs',
  changelog: 'Changelog',
  blog: 'Blog',
  community: 'Community',
  security: 'Security',
  other: 'Other',
}

interface EvidenceDrawerProps {
  bundle?: NormalizedEvidenceBundle
  claimsByType?: ClaimsByType
  maxClaimsPerType?: number
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EvidenceDrawer({ 
  bundle, 
  claimsByType,
  maxClaimsPerType = 10,
  open,
  onOpenChange,
}: EvidenceDrawerProps) {
  // If claims are provided, use them; otherwise fall back to bundle
  const useClaims = Boolean(claimsByType)
  
  const report = React.useMemo(() => {
    if (bundle) {
      return summarizeEvidenceBundle(bundle)
    }
    // Generate report from claims if no bundle
    if (claimsByType) {
      const allClaims = Object.values(claimsByType).flat()
      return {
        totalSources: allClaims.length,
        countsByType: Object.fromEntries(
          Object.entries(claimsByType).map(([type, claims]) => [type, claims.length])
        ) as Record<NormalizedEvidenceType, number>,
        firstPartyCount: 0, // Would need competitor domains to compute
        thirdPartyCount: allClaims.length,
        unknownPartyCount: 0,
        recency: {
          mostRecentRetrievedAt: allClaims
            .map(c => c.retrievedAt || c.publishedAt)
            .filter(Boolean)
            .sort()
            .reverse()[0] || null,
          oldestRetrievedAt: null,
          publishedAtCoverage: 0,
        },
        topDomains: [],
        missingTypes: [],
        coverage: 0,
      }
    }
    return null
  }, [bundle, claimsByType])
  
  const grouped = React.useMemo(() => {
    if (useClaims && claimsByType) {
      // Group claims by type (already grouped, but convert to Map for consistency)
      const m = new Map<NormalizedEvidenceType, EvidenceClaim[]>()
      for (const [type, claims] of Object.entries(claimsByType)) {
        // Take top N ranked claims per type
        const topClaims = claims.slice(0, maxClaimsPerType)
        if (topClaims.length > 0) {
          m.set(type as NormalizedEvidenceType, topClaims)
        }
      }
      return m
    }
    
    if (bundle) {
      // Original bundle-based grouping
      const m = new Map<NormalizedEvidenceType, typeof bundle.items>()
      for (const item of bundle.items) {
        const t = item.type ?? 'other'
        if (!m.has(t)) {
          m.set(t, [])
        }
        m.get(t)!.push(item)
      }
      return m
    }
    
    return new Map()
  }, [bundle, claimsByType, useClaims, maxClaimsPerType])

  const types = Array.from(grouped.keys()).sort((a, b) => {
    // Sort by count (descending), then by label
    const aCount = grouped.get(a)?.length ?? 0
    const bCount = grouped.get(b)?.length ?? 0
    if (aCount !== bCount) return bCount - aCount
    const aLabel = LABEL[a as NormalizedEvidenceType] || a
    const bLabel = LABEL[b as NormalizedEvidenceType] || b
    return aLabel.localeCompare(bLabel)
  })

  // Compute recency message
  const recencyMessage = React.useMemo(() => {
    if (!report?.recency.mostRecentRetrievedAt) return null
    try {
      const mostRecent = new Date(report.recency.mostRecentRetrievedAt)
      const daysAgo = Math.floor((Date.now() - mostRecent.getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo === 0) return 'Today'
      if (daysAgo === 1) return '1 day ago'
      return `${daysAgo} days ago`
    } catch {
      return null
    }
  }, [report?.recency.mostRecentRetrievedAt])

  // Compute first-party ratio
  const firstPartyRatio = React.useMemo(() => {
    if (!report) return null
    const total = report.firstPartyCount + report.thirdPartyCount
    if (total === 0) return null
    return Math.round((report.firstPartyCount / total) * 100)
  }, [report?.firstPartyCount, report?.thirdPartyCount])
  
  const totalItems = React.useMemo(() => {
    if (useClaims && claimsByType) {
      return Object.values(claimsByType).flat().length
    }
    return bundle?.items.length ?? 0
  }, [useClaims, claimsByType, bundle])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {open === undefined && (
        <DialogTrigger asChild>
          <Button variant="secondary">View evidence</Button>
        </DialogTrigger>
      )}

      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Evidence</DialogTitle>
          <div className="text-sm text-muted-foreground">
            {totalItems} source{totalItems !== 1 ? 's' : ''} captured
            {bundle?.company && ` • ${bundle.company}`}
          </div>
        </DialogHeader>

        {/* Coverage, Recency, First-party stats */}
        {report && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4 border-b border-border">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Coverage
              </div>
              <div className="text-sm text-foreground">
                {Object.values(report.countsByType).filter(c => c > 0).length} / {Object.keys(report.countsByType).length} types
              </div>
            </div>
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Recency
            </div>
            <div className="text-sm text-foreground">
              {recencyMessage ? (
                <Badge variant="secondary" className="text-xs">
                  Most evidence from {recencyMessage}
                </Badge>
              ) : (
                <span className="text-muted-foreground">Unknown</span>
              )}
            </div>
          </div>
          {firstPartyRatio !== null && (
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                First-party ratio
              </div>
              <div className="text-sm text-foreground">
                <Badge variant="secondary" className="text-xs">
                  {firstPartyRatio}% first-party
                </Badge>
              </div>
            </div>
          )}
          </div>
        )}

        {types.length === 0 ? (
          <div className="py-8 text-sm text-muted-foreground text-center">
            No evidence captured yet.
          </div>
        ) : (
          <Accordion type="multiple" className="w-full">
            {types.map((t) => {
              const items = grouped.get(t)!
              return (
                <AccordionItem key={t} value={t}>
                  <AccordionTrigger>
                    <div className="flex items-center gap-2">
                      <span>{LABEL[t as NormalizedEvidenceType] || t}</span>
                      <Badge variant="secondary">{items.length}</Badge>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3">
                      {useClaims ? (
                        // Render claims
                        (items as EvidenceClaim[]).map((claim) => (
                          <Card key={claim.id} className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate mb-1">
                                  {claim.title ?? claim.domain ?? claim.url}
                                </div>
                                <p className="text-sm text-foreground mb-2">
                                  {claim.claimText}
                                </p>
                                <a
                                  href={claim.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-primary hover:underline break-all"
                                >
                                  {claim.canonicalUrl}
                                </a>
                                {claim.excerpt && (
                                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                    {claim.excerpt}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
                                {claim.confidence && (
                                  <Badge variant="secondary" className="text-xs mb-1">
                                    {claim.confidence}
                                  </Badge>
                                )}
                                {claim.publishedAt && (
                                  <div>
                                    Published:{' '}
                                    {new Date(claim.publishedAt).toLocaleDateString()}
                                  </div>
                                )}
                                {claim.retrievedAt && (
                                  <div>
                                    Retrieved:{' '}
                                    {new Date(claim.retrievedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : bundle ? (
                        // Render original items
                        (items as typeof bundle.items).map((it) => (
                          <Card key={it.id} className="p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0 flex-1">
                                <div className="font-medium truncate mb-1">
                                  {it.title ?? it.domain ?? it.url}
                                </div>
                                <a
                                  href={it.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-sm text-primary hover:underline break-all"
                                >
                                  {it.url}
                                </a>
                                {it.snippet && (
                                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                    {it.snippet}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-col items-end gap-1 text-xs text-muted-foreground shrink-0">
                                {it.publishedAt && (
                                  <div>
                                    Published:{' '}
                                    {new Date(it.publishedAt).toLocaleDateString()}
                                  </div>
                                )}
                                {it.retrievedAt && (
                                  <div>
                                    Retrieved:{' '}
                                    {new Date(it.retrievedAt).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))
                      ) : null}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        )}
      </DialogContent>
    </Dialog>
  )
}

