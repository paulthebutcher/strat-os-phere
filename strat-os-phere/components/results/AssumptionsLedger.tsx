'use client'

import { useState, useMemo, useEffect, useRef } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import {
  loadAssumptionStances,
  saveAssumptionStance,
  type AssumptionUserStance,
} from '@/lib/results/assumptionsClientState'
import type { Assumption, AssumptionCategory } from '@/lib/results/assumptions'
import { CopySectionButton } from './CopySectionButton'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface AssumptionsLedgerProps {
  projectId: string
  assumptions: Assumption[]
  selectedIds: string[]
  hoverId?: string | null
  onSelectAssumption: (id: string) => void
  onHoverAssumption?: (id: string | null) => void
  onFilterChange?: (filters: { category?: AssumptionCategory | 'all'; search?: string; showOnlyDisagreeUnsure?: boolean }) => void
  filters?: { category?: AssumptionCategory | 'all'; search?: string; showOnlyDisagreeUnsure?: boolean }
  onClearSelection?: () => void
}

/**
 * Get confidence index (0-2 for Low, Medium, High)
 */
function getConfidenceIndex(confidence: Assumption['confidence']): number {
  return confidence === 'High' ? 2 : confidence === 'Medium' ? 1 : 0
}

/**
 * Compute next action based on impact and confidence
 */
function computeNextAction(assumption: Assumption): string {
  const confIdx = getConfidenceIndex(assumption.confidence)
  const isHighImpact = assumption.impact >= 4
  const isHighConfidence = confIdx >= 2
  const isLowConfidence = confIdx <= 0

  if (isHighImpact && isLowConfidence) {
    return 'Validate'
  }
  if (isHighImpact && isHighConfidence) {
    return 'Commit'
  }
  if (assumption.impact <= 2 && isLowConfidence) {
    return 'Defer'
  }
  return 'Monitor'
}

/**
 * Render mini map glyph showing position
 */
function MapGlyph({ assumption }: { assumption: Assumption }) {
  const confIdx = getConfidenceIndex(assumption.confidence)
  // Map confidence (0-2) to x position (0-100%)
  const xPercent = (confIdx / 2) * 100
  // Map impact (1-5) to y position (0-100%, inverted)
  const yPercent = 100 - ((assumption.impact - 1) / 4) * 100

  return (
    <div className="relative w-12 h-12 border border-border rounded bg-muted/30">
      <div
        className="absolute w-2 h-2 rounded-full bg-primary border border-primary"
        style={{
          left: `${xPercent}%`,
          top: `${yPercent}%`,
          transform: 'translate(-50%, -50%)',
        }}
      />
    </div>
  )
}

/**
 * Format assumptions ledger as markdown for export
 */
function formatAssumptionsToMarkdown(assumptions: Assumption[], stances: Record<string, { stance: AssumptionUserStance; note?: string }>): string {
  const lines: string[] = []
  lines.push('# Assumptions Ledger')
  lines.push('')
  lines.push('Assumptions are the levers. Mark what you agree/disagree with to pressure-test strategy.')
  lines.push('')

  // Group by category
  const byCategory = assumptions.reduce((acc, assumption) => {
    if (!acc[assumption.category]) {
      acc[assumption.category] = []
    }
    acc[assumption.category].push(assumption)
    return acc
  }, {} as Record<AssumptionCategory, Assumption[]>)

  for (const [category, categoryAssumptions] of Object.entries(byCategory)) {
    lines.push(`## ${category}`)
    lines.push('')

    for (const assumption of categoryAssumptions) {
      const stance = stances[assumption.id]
      const stanceLabel = stance?.stance === 'agree' ? '✓ Agree' 
        : stance?.stance === 'disagree' ? '✗ Disagree'
        : stance?.stance === 'unsure' ? '? Unsure'
        : '○ Unreviewed'

      lines.push(`### ${assumption.statement} [${stanceLabel}]`)
      lines.push('')
      lines.push(`**Why it matters:** ${assumption.whyItMatters}`)
      lines.push(`**Confidence:** ${assumption.confidence} | **Impact:** ${assumption.impact}/5`)
      if (assumption.sourcesCount > 0) {
        lines.push(`**Sources:** ${assumption.sourcesCount}`)
      }
      if (stance?.note) {
        lines.push(`**Note:** ${stance.note}`)
      }
      if (assumption.relatedOpportunityIds.length > 0) {
        lines.push(`**Related Opportunities:** ${assumption.relatedOpportunityIds.join(', ')}`)
      }
      lines.push('')
    }
  }

  const disagreedCount = Object.values(stances).filter(s => s.stance === 'disagree').length
  const unsureCount = Object.values(stances).filter(s => s.stance === 'unsure').length

  if (disagreedCount > 0 || unsureCount > 0) {
    lines.push('## Summary')
    lines.push('')
    if (disagreedCount > 0) {
      lines.push(`- You disagreed with ${disagreedCount} assumption${disagreedCount !== 1 ? 's' : ''}`)
    }
    if (unsureCount > 0) {
      lines.push(`- You marked ${unsureCount} assumption${unsureCount !== 1 ? 's' : ''} as unsure`)
    }
  }

  return lines.join('\n')
}

export function AssumptionsLedger({ 
  projectId, 
  assumptions,
  selectedIds,
  hoverId,
  onSelectAssumption,
  onHoverAssumption,
  onFilterChange,
  filters: externalFilters,
  onClearSelection,
}: AssumptionsLedgerProps) {
  const [selectedCategory, setSelectedCategory] = useState<AssumptionCategory | 'all'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showOnlyDisagreeUnsure, setShowOnlyDisagreeUnsure] = useState(false)
  const [selectedAssumption, setSelectedAssumption] = useState<Assumption | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())
  const tableRef = useRef<HTMLDivElement>(null)

  // Use external filters if provided, otherwise use internal state
  const filters = externalFilters || {
    category: selectedCategory,
    search: searchQuery,
    showOnlyDisagreeUnsure,
  }

  // Load stances from localStorage
  const [stances, setStances] = useState<Record<string, { stance: AssumptionUserStance; note?: string }>>(() => {
    if (typeof window !== 'undefined') {
      return loadAssumptionStances(projectId)
    }
    return {}
  })

  // Update stance
  const updateStance = (assumptionId: string, stance: AssumptionUserStance) => {
    const currentNote = notes[assumptionId] || stances[assumptionId]?.note || ''
    saveAssumptionStance(projectId, assumptionId, stance, currentNote)
    setStances(prev => ({
      ...prev,
      [assumptionId]: { stance, note: currentNote || undefined },
    }))
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assumption-stance-updated'))
    }
  }

  // Update note
  const updateNote = (assumptionId: string, note: string) => {
    setNotes(prev => ({ ...prev, [assumptionId]: note }))
    const currentStance = stances[assumptionId]?.stance || 'unreviewed'
    saveAssumptionStance(projectId, assumptionId, currentStance, note)
    setStances(prev => ({
      ...prev,
      [assumptionId]: { stance: currentStance, note: note || undefined },
    }))
    
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assumption-stance-updated'))
    }
  }

  // Handle filter changes
  const handleCategoryChange = (category: AssumptionCategory | 'all') => {
    setSelectedCategory(category)
    onFilterChange?.({ ...filters, category })
  }

  const handleSearchChange = (search: string) => {
    setSearchQuery(search)
    onFilterChange?.({ ...filters, search })
  }

  const handleDisagreeUnsureChange = (show: boolean) => {
    setShowOnlyDisagreeUnsure(show)
    onFilterChange?.({ ...filters, showOnlyDisagreeUnsure: show })
  }

  // Filter and sort assumptions (already filtered by parent, but we apply stance filter here)
  const filteredAssumptions = useMemo(() => {
    let filtered = assumptions

    // Disagree/Unsure filter (requires localStorage access)
    if (filters.showOnlyDisagreeUnsure) {
      filtered = filtered.filter(a => {
        const stance = stances[a.id]?.stance
        return stance === 'disagree' || stance === 'unsure'
      })
    }

    // Sort by impact desc, then confidence
    return filtered.sort((a, b) => {
      if (b.impact !== a.impact) {
        return b.impact - a.impact
      }
      const confidenceOrder = { High: 3, Medium: 2, Low: 1 }
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence]
    })
  }, [assumptions, filters.showOnlyDisagreeUnsure, stances])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(assumptions.map(a => a.category))
    return Array.from(cats).sort()
  }, [assumptions])

  // Scroll to selected assumption
  useEffect(() => {
    if (selectedIds.length > 0 && tableRef.current) {
      const firstSelectedId = selectedIds[0]
      const element = document.getElementById(`assumption-row-${firstSelectedId}`)
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' })
          element.classList.add('ring-2', 'ring-primary', 'ring-offset-2')
          setTimeout(() => {
            element.classList.remove('ring-2', 'ring-primary', 'ring-offset-2')
          }, 2000)
        }, 100)
      }
    }
  }, [selectedIds])

  const markdownContent = formatAssumptionsToMarkdown(assumptions, stances)

  if (assumptions.length === 0) {
    return (
      <div className="panel p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Assumptions Ledger</h2>
        <p className="text-sm text-muted-foreground">
          No assumptions available. Generate analysis to see derived assumptions.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="panel p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground mb-1">Assumptions Ledger</h2>
            <p className="text-xs text-muted-foreground">
              Assumptions are the levers. Mark what you agree/disagree with to pressure-test strategy.
            </p>
          </div>
          <CopySectionButton content={markdownContent} label="Export" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="flex items-center gap-2 flex-1 min-w-[200px]">
            <label className="text-xs text-muted-foreground whitespace-nowrap">Search:</label>
            <Input
              type="text"
              placeholder="Search statements..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="text-xs h-8"
            />
          </div>
          
          {/* Category filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Category:</label>
            <select
              value={filters.category || 'all'}
              onChange={(e) => handleCategoryChange(e.target.value as AssumptionCategory | 'all')}
              className="text-xs border rounded px-2 py-1 bg-background h-8"
            >
              <option value="all">All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          
          {/* Disagree/Unsure filter */}
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={filters.showOnlyDisagreeUnsure || false}
              onChange={(e) => handleDisagreeUnsureChange(e.target.checked)}
              className="rounded"
            />
            <span className="text-muted-foreground">Show only: Disagree / Unsure</span>
          </label>

          {/* Clear selection button */}
          {selectedIds.length > 0 && onClearSelection && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onClearSelection}
              className="text-xs h-8"
            >
              Clear selection ({selectedIds.length})
            </Button>
          )}
        </div>

        {/* Summary */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>
            {Object.values(stances).filter(s => s.stance === 'disagree').length} disagreed
          </span>
          <span>
            {Object.values(stances).filter(s => s.stance === 'unsure').length} unsure
          </span>
          <span>
            {Object.values(stances).filter(s => s.stance === 'agree').length} agreed
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto" ref={tableRef}>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">Map</TableHead>
                <TableHead className="w-[100px]">Category</TableHead>
                <TableHead>Statement</TableHead>
                <TableHead className="w-[100px]">Confidence</TableHead>
                <TableHead className="w-[80px]">Impact</TableHead>
                <TableHead className="w-[100px]">Next Action</TableHead>
                <TableHead className="w-[80px]">Sources</TableHead>
                <TableHead className="w-[200px]">Stance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssumptions.map((assumption) => {
                const stance = stances[assumption.id]?.stance || 'unreviewed'
                const note = notes[assumption.id] || stances[assumption.id]?.note || ''
                const isNoteExpanded = expandedNotes.has(assumption.id)
                const isSelected = selectedIds.includes(assumption.id)
                const isHovered = hoverId === assumption.id
                const nextAction = computeNextAction(assumption)

                return (
                  <TableRow
                    key={assumption.id}
                    id={`assumption-row-${assumption.id}`}
                    className={cn(
                      "cursor-pointer",
                      isSelected && "bg-primary/5",
                      isHovered && "bg-primary/10"
                    )}
                    onClick={() => onSelectAssumption(assumption.id)}
                    onMouseEnter={() => onHoverAssumption?.(assumption.id)}
                    onMouseLeave={() => onHoverAssumption?.(null)}
                  >
                    <TableCell>
                      <MapGlyph assumption={assumption} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="muted" className="text-xs">
                        {assumption.category}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{assumption.statement}</div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          assumption.confidence === 'High' ? 'success' :
                          assumption.confidence === 'Medium' ? 'warning' : 'muted'
                        }
                        className="text-xs"
                      >
                        {assumption.confidence}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">{assumption.impact}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map(i => (
                            <div
                              key={i}
                              className={`w-1.5 h-1.5 rounded-full ${
                                i <= assumption.impact ? 'bg-primary' : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          nextAction === 'Validate' ? 'warning' :
                          nextAction === 'Commit' ? 'success' :
                          nextAction === 'Defer' ? 'muted' : 'default'
                        }
                        className="text-xs"
                      >
                        {nextAction}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-muted-foreground">
                        {assumption.sourcesCount > 0 ? assumption.sourcesCount : '—'}
                      </span>
                    </TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center gap-1">
                        <Button
                          size="sm"
                          variant={stance === 'agree' ? 'default' : 'ghost'}
                          className="h-6 px-2 text-xs"
                          onClick={() => updateStance(assumption.id, 'agree')}
                        >
                          Agree
                        </Button>
                        <Button
                          size="sm"
                          variant={stance === 'disagree' ? 'default' : 'ghost'}
                          className="h-6 px-2 text-xs"
                          onClick={() => updateStance(assumption.id, 'disagree')}
                        >
                          Disagree
                        </Button>
                        <Button
                          size="sm"
                          variant={stance === 'unsure' ? 'default' : 'ghost'}
                          className="h-6 px-2 text-xs"
                          onClick={() => updateStance(assumption.id, 'unsure')}
                        >
                          Unsure
                        </Button>
                      </div>
                      {note && (
                        <div className="mt-1 text-xs text-muted-foreground line-clamp-1">
                          {note}
                        </div>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 px-1 text-xs mt-1"
                        onClick={(e) => {
                          e.stopPropagation()
                          setExpandedNotes(prev => {
                            const next = new Set(prev)
                            if (next.has(assumption.id)) {
                              next.delete(assumption.id)
                            } else {
                              next.add(assumption.id)
                            }
                            return next
                          })
                        }}
                      >
                        {isNoteExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                        Note
                      </Button>
                      {isNoteExpanded && (
                        <Textarea
                          value={note}
                          onChange={(e) => updateNote(assumption.id, e.target.value)}
                          placeholder="Add a note..."
                          className="mt-1 text-xs min-h-[60px]"
                          onClick={(e) => e.stopPropagation()}
                        />
                      )}
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>

        {filteredAssumptions.length === 0 && (
          <div className="text-center py-8 text-sm text-muted-foreground">
            <p>No assumptions match the current filters.</p>
            {onClearSelection && (
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  handleCategoryChange('all')
                  handleSearchChange('')
                  handleDisagreeUnsureChange(false)
                  onClearSelection()
                }}
                className="mt-2"
              >
                Clear all filters
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Detail Sheet */}
      <Sheet open={selectedAssumption !== null} onOpenChange={(open) => !open && setSelectedAssumption(null)}>
        <SheetContent side="right" className="w-full sm:max-w-lg">
          {selectedAssumption && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedAssumption.statement}</SheetTitle>
                <SheetDescription>
                  <Badge variant="muted" className="mr-2">
                    {selectedAssumption.category}
                  </Badge>
                  <Badge
                    variant={
                      selectedAssumption.confidence === 'High' ? 'success' :
                      selectedAssumption.confidence === 'Medium' ? 'warning' : 'muted'
                    }
                  >
                    {selectedAssumption.confidence} Confidence
                  </Badge>
                  <Badge variant="muted" className="ml-2">
                    Impact: {selectedAssumption.impact}/5
                  </Badge>
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-4">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Why it matters</h4>
                  <p className="text-sm text-muted-foreground">{selectedAssumption.whyItMatters}</p>
                </div>

                {selectedAssumption.sourcesCount > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Sources</h4>
                    <p className="text-sm text-muted-foreground">
                      {selectedAssumption.sourcesCount} source{selectedAssumption.sourcesCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                )}

                {selectedAssumption.relatedOpportunityIds.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-2">Related Opportunities</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {selectedAssumption.relatedOpportunityIds.map((oppId, idx) => (
                        <li key={idx}>
                          <a
                            href={`#${oppId}`}
                            className="text-primary hover:underline"
                            onClick={() => setSelectedAssumption(null)}
                          >
                            {oppId}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-2">Your stance</h4>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={stances[selectedAssumption.id]?.stance === 'agree' ? 'default' : 'outline'}
                      onClick={() => updateStance(selectedAssumption.id, 'agree')}
                    >
                      Agree
                    </Button>
                    <Button
                      size="sm"
                      variant={stances[selectedAssumption.id]?.stance === 'disagree' ? 'default' : 'outline'}
                      onClick={() => updateStance(selectedAssumption.id, 'disagree')}
                    >
                      Disagree
                    </Button>
                    <Button
                      size="sm"
                      variant={stances[selectedAssumption.id]?.stance === 'unsure' ? 'default' : 'outline'}
                      onClick={() => updateStance(selectedAssumption.id, 'unsure')}
                    >
                      Unsure
                    </Button>
                  </div>
                  <Textarea
                    value={notes[selectedAssumption.id] || stances[selectedAssumption.id]?.note || ''}
                    onChange={(e) => updateNote(selectedAssumption.id, e.target.value)}
                    placeholder="Add a note about this assumption..."
                    className="mt-2 text-sm"
                  />
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </>
  )
}
