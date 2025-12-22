'use client'

import { useState, useMemo, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
  selectedAssumptionId?: string | null
  onSelectAssumption?: (id: string | null) => void
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
  selectedAssumptionId,
  onSelectAssumption,
}: AssumptionsLedgerProps) {
  const [selectedCategory, setSelectedCategory] = useState<AssumptionCategory | 'all'>('all')
  const [showOnlyDisagreeUnsure, setShowOnlyDisagreeUnsure] = useState(false)
  const [selectedAssumption, setSelectedAssumption] = useState<Assumption | null>(null)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set())

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
    
    // Dispatch custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assumption-stance-updated'))
    }
  }

  // Listen for external selection changes
  useEffect(() => {
    if (selectedAssumptionId && onSelectAssumption) {
      const assumption = assumptions.find(a => a.id === selectedAssumptionId)
      if (assumption) {
        setSelectedAssumption(assumption)
      }
    }
  }, [selectedAssumptionId, assumptions, onSelectAssumption])

  // Update note
  const updateNote = (assumptionId: string, note: string) => {
    setNotes(prev => ({ ...prev, [assumptionId]: note }))
    const currentStance = stances[assumptionId]?.stance || 'unreviewed'
    saveAssumptionStance(projectId, assumptionId, currentStance, note)
    setStances(prev => ({
      ...prev,
      [assumptionId]: { stance: currentStance, note: note || undefined },
    }))
    
    // Dispatch custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('assumption-stance-updated'))
    }
  }

  // Filter and sort assumptions
  const filteredAssumptions = useMemo(() => {
    let filtered = assumptions

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(a => a.category === selectedCategory)
    }

    // Disagree/Unsure filter
    if (showOnlyDisagreeUnsure) {
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
  }, [assumptions, selectedCategory, showOnlyDisagreeUnsure, stances])

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(assumptions.map(a => a.category))
    return Array.from(cats).sort()
  }, [assumptions])

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
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">Category:</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value as AssumptionCategory | 'all')}
              className="text-xs border rounded px-2 py-1 bg-background"
            >
              <option value="all">All</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={showOnlyDisagreeUnsure}
              onChange={(e) => setShowOnlyDisagreeUnsure(e.target.checked)}
              className="rounded"
            />
            <span className="text-muted-foreground">Show only: Disagree / Unsure</span>
          </label>
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
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Category</TableHead>
                <TableHead>Statement</TableHead>
                <TableHead className="w-[100px]">Confidence</TableHead>
                <TableHead className="w-[80px]">Impact</TableHead>
                <TableHead className="w-[80px]">Sources</TableHead>
                <TableHead className="w-[200px]">Stance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAssumptions.map((assumption) => {
                const stance = stances[assumption.id]?.stance || 'unreviewed'
                const note = notes[assumption.id] || stances[assumption.id]?.note || ''
                const isNoteExpanded = expandedNotes.has(assumption.id)

                return (
                  <TableRow
                    key={assumption.id}
                    id={`assumption-row-${assumption.id}`}
                    className={cn(
                      "cursor-pointer",
                      selectedAssumptionId === assumption.id && "bg-primary/5"
                    )}
                    onClick={() => {
                      setSelectedAssumption(assumption)
                      if (onSelectAssumption) {
                        onSelectAssumption(assumption.id)
                      }
                    }}
                  >
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
            No assumptions match the current filters.
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

