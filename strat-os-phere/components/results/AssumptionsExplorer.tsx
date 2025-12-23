'use client'

import { useState, useMemo, useCallback } from 'react'
import { AssumptionsMap } from './AssumptionsMap'
import { AssumptionsLedger } from './AssumptionsLedger'
import type { Assumption, AssumptionCategory } from '@/lib/results/assumptions'

interface AssumptionsExplorerProps {
  projectId: string
  assumptions: Assumption[]
}

interface Filters {
  category?: AssumptionCategory | 'all'
  stance?: 'agree' | 'disagree' | 'unsure' | 'unreviewed' | 'all'
  search?: string
  confidence?: [number, number] // [min, max] where 0=Low, 1=Medium, 2=High
  impact?: [number, number] // [min, max] where 1-5
  showOnlyDisagreeUnsure?: boolean
}

/**
 * AssumptionsExplorer - Unified container for Map and Ledger
 * 
 * Manages:
 * - Filter state (category, stance, search, confidence, impact)
 * - Selection state (selected assumption IDs)
 * - Hover state (for cross-highlighting)
 * - Filtered assumptions derived from filters
 */
export function AssumptionsExplorer({
  projectId,
  assumptions,
}: AssumptionsExplorerProps) {
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [hoverId, setHoverId] = useState<string | null>(null)
  const [filters, setFilters] = useState<Filters>({
    category: 'all',
    stance: 'all',
    search: '',
    showOnlyDisagreeUnsure: false,
  })

  // Derive filtered assumptions from filters
  const filteredAssumptions = useMemo(() => {
    let filtered = assumptions

    // Category filter
    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(a => a.category === filters.category)
    }

    // Search filter (statement text)
    if (filters.search && filters.search.trim()) {
      const searchLower = filters.search.toLowerCase().trim()
      filtered = filtered.filter(a => 
        a.statement.toLowerCase().includes(searchLower) ||
        a.whyItMatters.toLowerCase().includes(searchLower)
      )
    }

    // Confidence filter
    if (filters.confidence) {
      const [minConf, maxConf] = filters.confidence
      filtered = filtered.filter(a => {
        const confIdx = a.confidence === 'High' ? 2 : a.confidence === 'Medium' ? 1 : 0
        return confIdx >= minConf && confIdx <= maxConf
      })
    }

    // Impact filter
    if (filters.impact) {
      const [minImpact, maxImpact] = filters.impact
      filtered = filtered.filter(a => a.impact >= minImpact && a.impact <= maxImpact)
    }

    // Stance filter (handled in ledger via localStorage, but we can pre-filter if needed)
    // Note: stance filtering is complex because it requires localStorage, so we'll handle it in the ledger

    return filtered
  }, [assumptions, filters])

  // Handle map click - select assumption(s)
  const handleMapClick = useCallback((id: string | string[]) => {
    const ids = Array.isArray(id) ? id : [id]
    setSelectedIds(prev => {
      // If clicking the same assumption, deselect it
      if (ids.length === 1 && prev.includes(ids[0])) {
        return prev.filter(i => i !== ids[0])
      }
      // Otherwise, replace selection with clicked assumption(s)
      return ids
    })
  }, [])

  // Handle ledger row hover
  const handleLedgerHover = useCallback((id: string | null) => {
    setHoverId(id)
  }, [])

  // Handle ledger row click
  const handleLedgerClick = useCallback((id: string) => {
    setSelectedIds(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id)
      }
      return [...prev, id]
    })
  }, [])

  // Update filters from ledger
  const handleFilterChange = useCallback((newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }, [])

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setSelectedIds([])
    setHoverId(null)
  }, [])

  return (
    <div className="space-y-6">
      {/* Map */}
      <AssumptionsMap
        projectId={projectId}
        assumptions={filteredAssumptions}
        selectedIds={selectedIds}
        hoverId={hoverId}
        onSelectAssumption={handleMapClick}
        onHoverAssumption={setHoverId}
      />

      {/* Ledger */}
      <AssumptionsLedger
        projectId={projectId}
        assumptions={filteredAssumptions}
        selectedIds={selectedIds}
        hoverId={hoverId}
        onSelectAssumption={handleLedgerClick}
        onHoverAssumption={handleLedgerHover}
        onFilterChange={handleFilterChange}
        filters={filters}
        onClearSelection={handleClearSelection}
      />
    </div>
  )
}

