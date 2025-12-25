'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import type { AppBadgeVariant } from '@/components/ui/badgeVariants'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { SectionCard } from '@/components/results/SectionCard'
import { EmptyEvidenceState } from './EmptyEvidenceState'
import type { EvidenceTableItem } from '@/lib/hooks/useProjectEvidence'
import { cn } from '@/lib/utils'

interface EvidenceTableProps {
  items: EvidenceTableItem[]
  density?: 'full' | 'compact'
  className?: string
  projectId?: string
}

/**
 * Format date for display
 */
function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—'
  try {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  } catch {
    return '—'
  }
}

/**
 * Format impact as visual indicator
 */
function formatImpact(impact: number): string {
  // Return as number (0-10)
  return impact.toFixed(1)
}

/**
 * Get strength badge variant
 */
function getStrengthVariant(strength: EvidenceTableItem['strength']): AppBadgeVariant {
  const s = strength?.toLowerCase();

  if (s === 'strong') return 'success';
  if (s === 'directional') return 'warning'; // or "neutral" depending on your semantics
  if (s === 'weak' || s === 'low') return 'neutral';
  return 'secondary';
}

/**
 * Truncate text for compact mode
 */
function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength - 3) + '...'
}

/**
 * Evidence Table Component
 * 
 * Displays evidence in a table format, sorted by impact first.
 * Supports full and compact density variants.
 */
export function EvidenceTable({
  items,
  density = 'full',
  className,
  projectId,
}: EvidenceTableProps) {
  // If no items, show empty state
  if (items.length === 0) {
    return <EmptyEvidenceState className={className} projectId={projectId} />
  }
  
  const isCompact = density === 'compact'
  const displayItems = useMemo(() => {
    // In compact mode, show fewer items
    return isCompact ? items.slice(0, 10) : items
  }, [items, isCompact])
  
  return (
    <SectionCard className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Evidence {isCompact ? '' : '(Highest Impact First)'}
          </h3>
          {!isCompact && (
            <p className="text-sm text-muted-foreground mt-1">
              {items.length} evidence source{items.length !== 1 ? 's' : ''} sorted by impact
            </p>
          )}
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={isCompact ? 'w-[40%]' : 'w-[35%]'}>Evidence</TableHead>
              <TableHead className="w-[10%] text-center">Impact</TableHead>
              <TableHead className="w-[15%]">Strength</TableHead>
              <TableHead className={isCompact ? 'w-[20%]' : 'w-[15%]'}>Source</TableHead>
              {!isCompact && <TableHead className="w-[15%]">Linked to</TableHead>}
              <TableHead className={isCompact ? 'w-[15%]' : 'w-[10%]'}>Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayItems.map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-foreground">
                      {isCompact ? truncate(item.evidence, 60) : item.evidence}
                    </div>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        {item.domain || new URL(item.url).hostname}
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                      </a>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <span className="font-semibold text-foreground">{formatImpact(item.impact)}</span>
                </TableCell>
                <TableCell>
                  <Badge variant={getStrengthVariant(item.strength)} className="text-xs">
                    {item.strength}
                  </Badge>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground capitalize">
                    {item.source.replace(/_/g, ' ')}
                  </span>
                </TableCell>
                {!isCompact && (
                  <TableCell>
                    {item.linkedTo ? (
                      <span className="text-sm text-foreground">{item.linkedTo}</span>
                    ) : (
                      <span className="text-sm text-muted-foreground">—</span>
                    )}
                  </TableCell>
                )}
                <TableCell>
                  <span className="text-sm text-muted-foreground">{formatDate(item.date)}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {isCompact && items.length > 10 && (
        <div className="text-center pt-2 border-t border-border">
          <Link
            href={projectId ? `/projects/${projectId}/evidence` : '#'}
            className="text-sm text-primary hover:underline"
          >
            View all {items.length} evidence sources
          </Link>
        </div>
      )}
    </SectionCard>
  )
}

