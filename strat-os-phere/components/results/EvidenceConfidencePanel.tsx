'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Collapsible } from '@/components/ui/collapsible'
import { SectionCard } from '@/components/results/SectionCard'
import { cn } from '@/lib/utils'
import type { NormalizedCitation } from '@/lib/results/evidence'
import { summarizeCitations, computeCoverage, computeConfidence, type CoverageStatus, type ConfidenceLevel } from '@/lib/scoring/evidenceGating'
import type { CitationInput } from '@/lib/scoring/extractEvidenceFromArtifacts'

interface EvidenceConfidencePanelProps {
  title?: string
  citations: NormalizedCitation[]
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
 * Evidence & Confidence Panel
 * 
 * Displays confidence level, recency, coverage, and a collapsible sources list.
 * Works with any artifact structure that contains citations.
 */
export function EvidenceConfidencePanel({
  title = 'Evidence & confidence',
  citations,
  compact = false,
  className,
}: EvidenceConfidencePanelProps) {
  // Convert NormalizedCitation to CitationInput format
  const citationInputs: CitationInput[] = citations.map(normalizeToInput)
  
  // Use new gating functions
  const summary = summarizeCitations(citationInputs)
  const coverage = computeCoverage(summary)
  const confidence = computeConfidence(summary)
  
  // Map confidence to badge variant
  const confidenceVariant = 
    confidence === 'high' 
      ? 'success' 
      : confidence === 'moderate' 
      ? 'warning' 
      : 'danger'
  
  // Group citations by source type
  const citationsByType: Record<string, NormalizedCitation[]> = {}
  for (const citation of citations) {
    if (!citationsByType[citation.sourceType]) {
      citationsByType[citation.sourceType] = []
    }
    citationsByType[citation.sourceType].push(citation)
  }
  
  // Sort source types by count (descending)
  const sourceTypes = Object.keys(citationsByType).sort(
    (a, b) => citationsByType[b].length - citationsByType[a].length
  )
  
  // Generate recency label
  let recencyLabel: string
  if (summary.newestCitationDate) {
    try {
      const newest = new Date(summary.newestCitationDate)
      const now = new Date()
      const daysAgo = Math.floor((now.getTime() - newest.getTime()) / (1000 * 60 * 60 * 24))
      recencyLabel = `Most evidence from last ${daysAgo} days`
    } catch {
      recencyLabel = 'Evidence dates unavailable'
    }
  } else {
    recencyLabel = 'Evidence dates unavailable'
  }
  
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
          <div className="text-sm text-foreground">{recencyLabel}</div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Total citations
          </div>
          <div className="text-sm text-foreground">
            {summary.totalCitations} citation{summary.totalCitations !== 1 ? 's' : ''}
          </div>
        </div>
        <div>
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
            Source types
          </div>
          <div className="text-sm text-foreground">
            {summary.sourceTypes.length} type{summary.sourceTypes.length !== 1 ? 's' : ''}
            {summary.sourceTypes.length > 0 && (
              <span className="text-muted-foreground ml-1">
                ({summary.sourceTypes.join(', ')})
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Coverage by type */}
      {sourceTypes.length > 0 && (
        <div className="pt-2 border-t border-border">
          <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Coverage by source type
          </div>
          <div className="flex flex-wrap gap-2">
            {sourceTypes.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {type.replace(/_/g, ' ')}: {citationsByType[type].length}
              </Badge>
            ))}
          </div>
        </div>
      )}
      
      {/* View sources - collapsible */}
      {citations.length > 0 && (
        <Collapsible title="View sources" defaultOpen={false}>
          <div className="space-y-4">
            {sourceTypes.map((type) => (
              <SourceTypeGroup
                key={type}
                type={type}
                citations={citationsByType[type]}
              />
            ))}
          </div>
        </Collapsible>
      )}
      
      {citations.length === 0 && (
        <div className="text-sm text-muted-foreground text-center py-4">
          No evidence yet. Citations will appear here once analysis is generated.
        </div>
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

