'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Collapsible } from '@/components/ui/collapsible'
import { SectionCard } from '@/components/results/SectionCard'
import { cn } from '@/lib/utils'
import type { NormalizedCitation } from '@/lib/results/evidence'
import { summarizeCitations, computeCoverage, computeConfidence, type CoverageStatus, type ConfidenceLevel } from '@/lib/scoring/evidenceGating'
import type { CitationInput } from '@/lib/scoring/extractEvidenceFromArtifacts'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'
import { deriveEvidenceTrustStats } from '@/lib/evidence/trustStats'
import { EvidenceDrawer } from '@/components/evidence/EvidenceDrawer'
import { EmptyEvidenceState } from '@/components/evidence/EmptyEvidenceState'

interface EvidenceConfidencePanelProps {
  title?: string
  citations: NormalizedCitation[]
  bundle?: NormalizedEvidenceBundle | null
  compact?: boolean
  className?: string
}

/**
 * Converts NormalizedCitation to CitationInput format
 */
function normalizeToInput(citation: NormalizedCitation): CitationInput {
  return {
    url: citation.url,
    sourceType: citation.sourceType,
    date: citation.date?.toISOString(),
  }
}

/**
 * Gets coverage message based on coverage status
 */
function getCoverageMessage(coverage: CoverageStatus): string {
  switch (coverage) {
    case 'insufficient':
      return 'Limited evidence coverage; treat as directional.'
    case 'partial':
      return 'Some evidence coverage; validate before acting.'
    case 'complete':
      return 'Good evidence coverage; suitable for decision support.'
  }
}

/**
 * Extracts hostname from URL
 */
function getHostname(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    // Fallback: try to extract manually
    const match = url.match(/https?:\/\/([^\/]+)/)
    return match ? match[1].replace(/^www\./, '') : url
  }
}

/**
 * Formats date as YYYY-MM-DD
 */
function formatDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Format days since date
 */
function formatDaysAgo(days: number | null): string {
  if (days === null) return 'Unknown'
  if (days === 0) return 'Today'
  if (days === 1) return '1 day ago'
  return `${days} days ago`
}

/**
 * Format date for display
 */
function formatDateDisplay(dateStr: string | null): string {
  if (!dateStr) return 'Unknown'
  try {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return 'Invalid date'
  }
}

/**
 * Evidence & Confidence Panel
 * 
 * Displays confidence level, recency, coverage, and a collapsible sources list.
 * Works with any artifact structure that contains citations.
 * When bundle is provided, uses bundle stats (preferred over citations).
 */
export function EvidenceConfidencePanel({
  title = 'Evidence & confidence',
  citations,
  bundle,
  compact = false,
  className,
}: EvidenceConfidencePanelProps) {
  // If no bundle and no citations, show empty state
  if (!bundle && citations.length === 0) {
    return <EmptyEvidenceState className={className} />
  }

  // Prefer bundle stats if available
  const useBundle = !!bundle
  let stats: {
    total: number
    coverage: number
    recencyLabel: string
    recencyDate: string | null
    byType: Array<{ type: string; count: number }>
  }
  let confidence: ConfidenceLevel
  let coverage: CoverageStatus

  if (useBundle && bundle) {
    const bundleStats = deriveEvidenceTrustStats(bundle)
    stats = {
      total: bundleStats.total,
      coverage: bundleStats.coverage,
      recencyLabel: bundleStats.daysSinceNewest !== null
        ? formatDaysAgo(bundleStats.daysSinceNewest)
        : 'Unknown',
      recencyDate: bundleStats.newestOverallAt,
      byType: bundleStats.byType
        .filter((x) => x.count > 0)
        .map((x) => ({ type: x.type, count: x.count })),
    }

    // Derive confidence from bundle stats
    // High: >= 5 types, >= 20 sources, recent (< 30 days)
    // Moderate: >= 3 types, >= 10 sources, or recent
    // Low: otherwise
    if (
      bundleStats.coverage >= 5 &&
      bundleStats.total >= 20 &&
      bundleStats.daysSinceNewest !== null &&
      bundleStats.daysSinceNewest < 30
    ) {
      confidence = 'high'
    } else if (
      bundleStats.coverage >= 3 ||
      bundleStats.total >= 10 ||
      (bundleStats.daysSinceNewest !== null && bundleStats.daysSinceNewest < 60)
    ) {
      confidence = 'moderate'
    } else {
      confidence = 'low'
    }

    // Derive coverage status
    if (bundleStats.coverage >= 5 && bundleStats.total >= 20) {
      coverage = 'complete'
    } else if (bundleStats.coverage >= 3 || bundleStats.total >= 10) {
      coverage = 'partial'
    } else {
      coverage = 'insufficient'
    }
  } else {
    // Fallback to citation-based stats
    const citationInputs: CitationInput[] = citations.map(normalizeToInput)
    const summary = summarizeCitations(citationInputs)
    coverage = computeCoverage(summary)
    confidence = computeConfidence(summary)

    stats = {
      total: summary.totalCitations,
      coverage: summary.sourceTypes.length,
      recencyLabel: summary.newestCitationDate
        ? (() => {
            try {
              const newest = new Date(summary.newestCitationDate)
              const daysAgo = Math.floor(
                (Date.now() - newest.getTime()) / (1000 * 60 * 60 * 24)
              )
              return formatDaysAgo(daysAgo)
            } catch {
              return 'Unknown'
            }
          })()
        : 'Unknown',
      recencyDate: summary.newestCitationDate ?? null,
      byType: summary.sourceTypes.map((type) => ({
        type,
        count: citationInputs.filter((c) => c.sourceType === type).length,
      })),
    }
  }

  // Map confidence to badge variant
  const confidenceVariant =
    confidence === 'high'
      ? 'success'
      : confidence === 'moderate'
      ? 'warning'
      : 'danger'
  
  return (
    <SectionCard className={cn('space-y-4', className)}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
          {!compact && (
            <p className="text-sm text-muted-foreground">{getCoverageMessage(coverage)}</p>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Badge variant={confidenceVariant} className="text-sm px-3 py-1">
            {confidence.charAt(0).toUpperCase() + confidence.slice(1)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-border">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Recency
          </div>
          <div className="text-sm text-foreground">
            {stats.recencyLabel}
            {stats.recencyDate && (
              <span className="text-muted-foreground ml-1">
                ({formatDateDisplay(stats.recencyDate)})
              </span>
            )}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Total sources
          </div>
          <div className="text-sm text-foreground">
            {stats.total} source{stats.total !== 1 ? 's' : ''}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Source types covered
          </div>
          <div className="text-sm text-foreground">
            {stats.coverage} type{stats.coverage !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Coverage by type */}
      {stats.byType.length > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Coverage by source type
          </div>
          <div className="flex flex-wrap gap-2">
            {stats.byType.map(({ type, count }) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type.replace(/_/g, ' ')}: {count}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* View evidence drawer (bundle) or collapsible sources (citations) */}
      {useBundle && bundle && <EvidenceDrawer bundle={bundle} />}

      {!useBundle && citations.length > 0 && (
        <Collapsible title="View sources" defaultOpen={false}>
          <div className="space-y-4">
            {Object.entries(
              citations.reduce((acc, citation) => {
                if (!acc[citation.sourceType]) {
                  acc[citation.sourceType] = []
                }
                acc[citation.sourceType].push(citation)
                return acc
              }, {} as Record<string, NormalizedCitation[]>)
            )
              .sort((a, b) => b[1].length - a[1].length)
              .map(([type, typeCitations]) => (
                <SourceTypeGroup key={type} type={type} citations={typeCitations} />
              ))}
          </div>
        </Collapsible>
      )}
    </SectionCard>
  )
}

interface SourceTypeGroupProps {
  type: string
  citations: NormalizedCitation[]
}

function SourceTypeGroup({ type, citations }: SourceTypeGroupProps) {
  const [showAll, setShowAll] = useState(false)
  const displayCount = 5
  const hasMore = citations.length > displayCount
  const displayedCitations = showAll ? citations : citations.slice(0, displayCount)
  
  return (
    <div className="space-y-2">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {type.replace(/_/g, ' ')} ({citations.length})
      </h4>
      <ul className="space-y-2">
        {displayedCitations.map((citation, index) => (
          <li key={index} className="text-sm">
            <a
              href={citation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
            >
              {getHostname(citation.url)}
            </a>
            {citation.date && (
              <span className="text-muted-foreground ml-2">
                ({formatDate(citation.date)})
              </span>
            )}
          </li>
        ))}
      </ul>
      {hasMore && (
        <button
          type="button"
          onClick={() => setShowAll(!showAll)}
          className="text-xs text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
        >
          {showAll ? 'Show less' : `Show all ${citations.length} sources`}
        </button>
      )}
    </div>
  )
}

