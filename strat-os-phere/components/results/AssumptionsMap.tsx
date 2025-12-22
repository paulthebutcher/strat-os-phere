'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Assumption } from '@/lib/results/assumptions'
import type { AssumptionUserStance } from '@/lib/results/assumptionsClientState'
import { loadAssumptionStances } from '@/lib/results/assumptionsClientState'
import { cn } from '@/lib/utils'

interface AssumptionsMapProps {
  projectId: string
  assumptions: Assumption[]
  selectedAssumptionId: string | null
  onSelectAssumption: (id: string | null) => void
}

/**
 * Get color for category (using existing design tokens)
 */
function getCategoryColor(category: Assumption['category']): string {
  const colors: Record<Assumption['category'], string> = {
    Market: 'bg-primary/20 border-primary/40 text-primary',
    Buyer: 'bg-info/20 border-info/40 text-info',
    Product: 'bg-success/20 border-success/40 text-success',
    Competition: 'bg-warning/20 border-warning/40 text-warning',
    Evidence: 'bg-muted border-border text-muted-foreground',
    Execution: 'bg-secondary border-border text-secondary-foreground',
  }
  return colors[category] || 'bg-muted border-border text-muted-foreground'
}

/**
 * Get confidence index (0-2 for Low, Medium, High)
 */
function getConfidenceIndex(confidence: Assumption['confidence']): number {
  return confidence === 'High' ? 2 : confidence === 'Medium' ? 1 : 0
}

/**
 * Calculate position within grid cell to avoid collisions
 */
function getPositionOffset(index: number, totalInCell: number): { x: number; y: number } {
  if (totalInCell === 1) return { x: 0, y: 0 }
  
  // Simple modulo pattern for offset
  const row = Math.floor(index / 3)
  const col = index % 3
  const offsetX = (col - 1) * 8 // -8, 0, 8
  const offsetY = row * 8
  
  return { x: offsetX, y: offsetY }
}

export function AssumptionsMap({
  projectId,
  assumptions,
  selectedAssumptionId,
  onSelectAssumption,
}: AssumptionsMapProps) {
  // Load stances from localStorage
  const [stances, setStances] = useState<Record<string, { stance: AssumptionUserStance; note?: string }>>({})
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStances(loadAssumptionStances(projectId))
      
      // Listen for storage changes (when AssumptionsLedger updates)
      const handleStorageChange = () => {
        setStances(loadAssumptionStances(projectId))
      }
      
      window.addEventListener('storage', handleStorageChange)
      // Also listen for custom event from AssumptionsLedger
      window.addEventListener('assumption-stance-updated', handleStorageChange)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('assumption-stance-updated', handleStorageChange)
      }
    }
  }, [projectId])
  // Group assumptions by confidence and impact
  const grid: Record<string, Assumption[]> = {}
  
  assumptions.forEach(assumption => {
    const confIdx = getConfidenceIndex(assumption.confidence)
    const impact = assumption.impact
    const key = `${confIdx}-${impact}`
    
    if (!grid[key]) {
      grid[key] = []
    }
    grid[key].push(assumption)
  })

  // Count disagreed assumptions
  const disagreedCount = Object.values(stances).filter(s => s.stance === 'disagree').length

  if (assumptions.length === 0) {
    return (
      <div className="panel p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Assumptions Map</h2>
        <p className="text-sm text-muted-foreground">
          No assumptions available to visualize.
        </p>
      </div>
    )
  }

  return (
    <div className="panel p-6 space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-1">Assumptions Map</h2>
        <p className="text-xs text-muted-foreground">
          Visualize assumptions by confidence and impact. Click a dot to view details.
        </p>
        {disagreedCount > 0 && (
          <p className="text-xs text-muted-foreground mt-1">
            You disagreed with {disagreedCount} assumption{disagreedCount !== 1 ? 's' : ''}.
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Categories:</span>
          <Badge className={getCategoryColor('Market')}>Market</Badge>
          <Badge className={getCategoryColor('Buyer')}>Buyer</Badge>
          <Badge className={getCategoryColor('Product')}>Product</Badge>
          <Badge className={getCategoryColor('Competition')}>Competition</Badge>
          <Badge className={getCategoryColor('Evidence')}>Evidence</Badge>
          <Badge className={getCategoryColor('Execution')}>Execution</Badge>
        </div>
      </div>

      {/* Map Grid */}
      <div className="relative border border-border rounded-lg p-4 bg-muted/30">
        {/* Y-axis labels (Impact) */}
        <div className="absolute left-0 top-4 bottom-4 flex flex-col justify-between text-xs text-muted-foreground font-medium">
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>

        {/* X-axis labels (Confidence) */}
        <div className="absolute bottom-0 left-12 right-4 flex justify-between text-xs text-muted-foreground font-medium">
          <span>Low</span>
          <span>Medium</span>
          <span>High</span>
        </div>

        {/* Grid container */}
        <div className="ml-12 mt-2 mb-8">
          {/* Grid: 3 columns (confidence) x 5 rows (impact) */}
          <div className="grid grid-cols-3 gap-2" style={{ height: '300px' }}>
            {[2, 1, 0].map(confIdx => {
              return [5, 4, 3, 2, 1].map(impact => {
                const key = `${confIdx}-${impact}`
                const cellAssumptions = grid[key] || []
                
                return (
                  <div
                    key={`${confIdx}-${impact}`}
                    className="relative border border-border/50 rounded"
                  >
                    {cellAssumptions.map((assumption, idx) => {
                      const offset = getPositionOffset(idx, cellAssumptions.length)
                      const stance = stances[assumption.id]?.stance || 'unreviewed'
                      const isSelected = selectedAssumptionId === assumption.id
                      
                      return (
                        <TooltipProvider key={assumption.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={() => onSelectAssumption(isSelected ? null : assumption.id)}
                                className={cn(
                                  'absolute w-3 h-3 rounded-full border-2 transition-all hover:scale-150 hover:z-10',
                                  getCategoryColor(assumption.category),
                                  isSelected && 'ring-2 ring-primary ring-offset-1 scale-125 z-10',
                                  stance === 'disagree' && 'opacity-60',
                                  stance === 'unsure' && 'opacity-80'
                                )}
                                style={{
                                  left: `calc(50% + ${offset.x}px)`,
                                  top: `calc(50% + ${offset.y}px)`,
                                  transform: `translate(-50%, -50%) ${isSelected ? 'scale(1.25)' : ''}`,
                                }}
                                aria-label={assumption.statement}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1">
                                <div className="font-medium text-xs">{assumption.statement}</div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge className={cn('text-xs', getCategoryColor(assumption.category))}>
                                    {assumption.category}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {stance !== 'unreviewed' && `[${stance}]`}
                                  </span>
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )
                    })}
                  </div>
                )
              })
            })}
          </div>
        </div>

        {/* Axis labels */}
        <div className="ml-12 mt-2 text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Impact (Y-axis)</span>
            <span>Confidence (X-axis)</span>
          </div>
        </div>
      </div>

      {/* Selected assumption details */}
      {selectedAssumptionId && (
        <div className="border-t pt-4 mt-4">
          {(() => {
            const assumption = assumptions.find(a => a.id === selectedAssumptionId)
            if (!assumption) return null
            
            const stance = stances[assumption.id]?.stance || 'unreviewed'
            
            return (
              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">{assumption.statement}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={cn('text-xs', getCategoryColor(assumption.category))}>
                        {assumption.category}
                      </Badge>
                      <Badge variant="muted" className="text-xs">
                        {assumption.confidence} Confidence
                      </Badge>
                      <Badge variant="muted" className="text-xs">
                        Impact: {assumption.impact}/5
                      </Badge>
                      {stance !== 'unreviewed' && (
                        <Badge variant={stance === 'disagree' ? 'danger' : stance === 'unsure' ? 'warning' : 'success'} className="text-xs">
                          {stance}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectAssumption(null)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">{assumption.whyItMatters}</p>
                {assumption.relatedOpportunityIds.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    Related: {assumption.relatedOpportunityIds.join(', ')}
                  </div>
                )}
              </div>
            )
          })()}
        </div>
      )}
    </div>
  )
}

