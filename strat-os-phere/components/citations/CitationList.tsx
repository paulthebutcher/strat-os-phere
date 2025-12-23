/**
 * PR6: Standardized Citation List Component
 * 
 * Renders citations in a consistent, safe way across the application.
 * Handles missing fields gracefully and supports multiple display variants.
 */

import { normalizeCitations } from '@/lib/citations/normalize'
import type { Citation } from '@/lib/citations/types'
import { formatHost, formatDate } from '@/lib/citations/utils'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

type CitationListProps = {
  /** Accept unknown so old data can pass through */
  citations: unknown
  /** Display variant */
  variant?: 'inline' | 'panel' | 'compact'
  /** Maximum number of citations to display */
  max?: number
  /** Additional className */
  className?: string
}

/**
 * Derives confidence label from 0-1 confidence value
 */
function getConfidenceLabel(confidence?: number): string | null {
  if (confidence === undefined) return null
  
  if (confidence >= 0.8) return 'High'
  if (confidence >= 0.5) return 'Med'
  return 'Low'
}

/**
 * Gets confidence variant for badge
 */
function getConfidenceVariant(confidence?: number): 'success' | 'warning' | 'danger' | 'secondary' {
  if (confidence === undefined) return 'secondary'
  
  if (confidence >= 0.8) return 'success'
  if (confidence >= 0.5) return 'warning'
  return 'danger'
}

/**
 * Truncates text to a maximum length
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Single citation item component
 */
function CitationItem({ citation, variant }: { citation: Citation; variant: 'inline' | 'panel' | 'compact' }) {
  const hostname = formatHost(citation.url)
  const displayTitle = citation.title ? truncate(citation.title, variant === 'compact' ? 30 : 50) : hostname
  
  const isInline = variant === 'inline'
  const isCompact = variant === 'compact'
  
  return (
    <div className={cn(
      'flex items-start gap-2',
      isInline ? 'inline-flex' : 'block',
      isCompact && 'text-sm'
    )}>
      <a
        href={citation.url}
        target="_blank"
        rel="noreferrer noopener"
        className={cn(
          'text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded',
          isCompact && 'text-sm'
        )}
      >
        {displayTitle}
      </a>
      
      {/* Metadata: evidence type, dates, confidence */}
      <div className={cn('flex items-center gap-2 flex-wrap', isInline && 'inline-flex')}>
        {/* Evidence type badge */}
        {citation.evidenceType && (
          <Badge variant="secondary" className="text-xs px-1.5 py-0">
            {citation.evidenceType.replace(/_/g, ' ')}
          </Badge>
        )}
        
        {/* Dates */}
        {citation.publishedAt && (
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            Published: {formatDate(citation.publishedAt) || citation.publishedAt}
          </span>
        )}
        {citation.retrievedAt && !citation.publishedAt && (
          <span className="text-muted-foreground text-xs whitespace-nowrap">
            Retrieved: {formatDate(citation.retrievedAt) || citation.retrievedAt}
          </span>
        )}
        
        {/* Confidence badge (subtle) */}
        {citation.confidence !== undefined && !isCompact && (
          <Badge variant={getConfidenceVariant(citation.confidence)} className="text-xs px-1.5 py-0">
            {getConfidenceLabel(citation.confidence)}
          </Badge>
        )}
      </div>
    </div>
  )
}

/**
 * CitationList Component
 * 
 * Accepts citations in any shape and normalizes them for rendering.
 * Handles empty states, deduplication, and missing fields safely.
 */
export function CitationList({ citations, variant = 'panel', max, className }: CitationListProps) {
  // Normalize citations
  const normalized = normalizeCitations(citations)
  
  // Apply max limit if specified
  const displayCitations = max !== undefined ? normalized.slice(0, max) : normalized
  
  // Handle empty state (only show for panel variant)
  if (normalized.length === 0) {
    if (variant === 'panel') {
      return (
        <div className={cn('text-sm text-muted-foreground', className)}>
          No citations available
        </div>
      )
    }
    return null
  }
  
  const isInline = variant === 'inline'
  const isCompact = variant === 'compact'
  
  if (isInline) {
    // Inline: comma-separated links
    return (
      <span className={cn('inline-flex flex-wrap items-center gap-1', className)}>
        {displayCitations.map((citation, index) => {
          const hostname = formatHost(citation.url)
          const displayTitle = citation.title ? truncate(citation.title, 30) : hostname
          return (
            <span key={citation.url}>
              <a
                href={citation.url}
                target="_blank"
                rel="noreferrer noopener"
                className="text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded text-xs"
              >
                {displayTitle}
              </a>
              {index < displayCitations.length - 1 && (
                <span className="text-muted-foreground mx-1">,</span>
              )}
            </span>
          )
        })}
        {max !== undefined && normalized.length > max && (
          <span className="text-muted-foreground text-sm">
            (+{normalized.length - max} more)
          </span>
        )}
      </span>
    )
  }
  
  // Panel/compact: vertical list
  return (
    <div className={cn('space-y-2', className)}>
      {displayCitations.map((citation) => (
        <CitationItem key={citation.url} citation={citation} variant={variant} />
      ))}
      {max !== undefined && normalized.length > max && (
        <div className="text-sm text-muted-foreground pt-1">
          +{normalized.length - max} more citation{normalized.length - max !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

