'use client'

import { useState, useEffect, useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Assumption } from '@/lib/results/assumptions'
import type { AssumptionUserStance } from '@/lib/results/assumptionsClientState'
import { loadAssumptionStances } from '@/lib/results/assumptionsClientState'
import { cn } from '@/lib/utils'

interface AssumptionsMapProps {
  projectId: string
  assumptions: Assumption[]
  selectedIds: string[]
  hoverId?: string | null
  onSelectAssumption: (id: string | string[]) => void
  onHoverAssumption?: (id: string | null) => void
}

/**
 * Get confidence index (0-2 for Low, Medium, High)
 */
function getConfidenceIndex(confidence: Assumption['confidence']): number {
  return confidence === 'High' ? 2 : confidence === 'Medium' ? 1 : 0
}

/**
 * Get stance color (for point color)
 */
function getStanceColor(stance: AssumptionUserStance): string {
  switch (stance) {
    case 'agree':
      return 'bg-success border-success'
    case 'disagree':
      return 'bg-destructive border-destructive'
    case 'unsure':
      return 'bg-warning border-warning'
    default:
      return 'bg-muted border-border'
  }
}

/**
 * Get category ring style (for point border/ring)
 */
function getCategoryRingStyle(category: Assumption['category']): string {
  // Use border thickness to encode category
  const ringStyles: Record<Assumption['category'], string> = {
    Market: 'border-2',
    Buyer: 'border-[1.5px]',
    Product: 'border-[2.5px]',
    Competition: 'border-[1px]',
    Evidence: 'border-[3px]',
    Execution: 'border-[1.5px]',
  }
  return ringStyles[category] || 'border-2'
}

/**
 * Deterministic jitter based on assumption ID
 */
function getJitterPosition(id: string, index: number, totalInCell: number): { x: number; y: number } {
  if (totalInCell === 1) return { x: 0, y: 0 }
  
  // Use hash of ID for deterministic positioning
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  // Use hash to create consistent offset
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180)
  const radius = 8 + (index % 3) * 4 // Vary radius slightly
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  
  return { x, y }
}

/**
 * Compute quadrant counts
 */
function computeQuadrantCounts(assumptions: Assumption[]): {
  risks: number // High impact, Low confidence
  coreBets: number // High impact, High confidence
  ignore: number // Low impact, Low confidence
  smallWins: number // Low impact, High confidence
} {
  let risks = 0
  let coreBets = 0
  let ignore = 0
  let smallWins = 0

  assumptions.forEach(a => {
    const confIdx = getConfidenceIndex(a.confidence)
    const isHighImpact = a.impact >= 4
    const isHighConfidence = confIdx >= 2
    const isLowImpact = a.impact <= 2
    const isLowConfidence = confIdx <= 0

    if (isHighImpact && isLowConfidence) risks++
    else if (isHighImpact && isHighConfidence) coreBets++
    else if (isLowImpact && isLowConfidence) ignore++
    else if (isLowImpact && isHighConfidence) smallWins++
  })

  return { risks, coreBets, ignore, smallWins }
}

export function AssumptionsMap({
  projectId,
  assumptions,
  selectedIds,
  hoverId,
  onSelectAssumption,
  onHoverAssumption,
}: AssumptionsMapProps) {
  // Load stances from localStorage
  const [stances, setStances] = useState<Record<string, { stance: AssumptionUserStance; note?: string }>>({})
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setStances(loadAssumptionStances(projectId))
      
      const handleStorageChange = () => {
        setStances(loadAssumptionStances(projectId))
      }
      
      window.addEventListener('storage', handleStorageChange)
      window.addEventListener('assumption-stance-updated', handleStorageChange)
      
      return () => {
        window.removeEventListener('storage', handleStorageChange)
        window.removeEventListener('assumption-stance-updated', handleStorageChange)
      }
    }
  }, [projectId])

  // Group assumptions by confidence and impact
  const grid = useMemo(() => {
    const g: Record<string, Assumption[]> = {}
    assumptions.forEach(assumption => {
      const confIdx = getConfidenceIndex(assumption.confidence)
      const impact = assumption.impact
      const key = `${confIdx}-${impact}`
      if (!g[key]) {
        g[key] = []
      }
      g[key].push(assumption)
    })
    return g
  }, [assumptions])

  // Compute cell counts for heat shading
  const cellCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    Object.keys(grid).forEach(key => {
      counts[key] = grid[key].length
    })
    const maxCount = Math.max(...Object.values(counts), 1)
    return { counts, maxCount }
  }, [grid])

  // Compute quadrant counts
  const quadrantCounts = useMemo(() => computeQuadrantCounts(assumptions), [assumptions])

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
          Visualize assumptions by confidence and impact. Click a dot or cluster to filter the ledger.
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
          <span className="text-muted-foreground">Stance:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-success border border-success" />
            <span className="text-muted-foreground">Agree</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-destructive border border-destructive" />
            <span className="text-muted-foreground">Disagree</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-warning border border-warning" />
            <span className="text-muted-foreground">Unsure</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded-full bg-muted border border-border" />
            <span className="text-muted-foreground">Unreviewed</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground">Category (ring thickness):</span>
          <Badge variant="muted" className="text-xs border-2">Market</Badge>
          <Badge variant="muted" className="text-xs border-[1.5px]">Buyer</Badge>
          <Badge variant="muted" className="text-xs border-[2.5px]">Product</Badge>
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
                const cellCount = cellCounts.counts[key] || 0
                const heatIntensity = cellCounts.maxCount > 0 
                  ? Math.min(cellCount / cellCounts.maxCount, 1) 
                  : 0
                
                // Heat shading based on count
                const heatClass = heatIntensity > 0.6 ? 'bg-primary/20' 
                  : heatIntensity > 0.3 ? 'bg-primary/10' 
                  : heatIntensity > 0 ? 'bg-primary/5' 
                  : ''
                
                return (
                  <div
                    key={`${confIdx}-${impact}`}
                    className={cn("relative border border-border/50 rounded", heatClass)}
                  >
                    {cellAssumptions.map((assumption, idx) => {
                      const jitter = getJitterPosition(assumption.id, idx, cellAssumptions.length)
                      const stance = stances[assumption.id]?.stance || 'unreviewed'
                      const isSelected = selectedIds.includes(assumption.id)
                      const isHovered = hoverId === assumption.id
                      
                      return (
                        <TooltipProvider key={assumption.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  // If clicking in a dense cell, select all in that cell
                                  if (cellAssumptions.length > 3) {
                                    onSelectAssumption(cellAssumptions.map(a => a.id))
                                  } else {
                                    onSelectAssumption(assumption.id)
                                  }
                                }}
                                onMouseEnter={() => onHoverAssumption?.(assumption.id)}
                                onMouseLeave={() => onHoverAssumption?.(null)}
                                className={cn(
                                  'absolute w-3 h-3 rounded-full transition-all hover:scale-150 hover:z-10',
                                  getStanceColor(stance),
                                  getCategoryRingStyle(assumption.category),
                                  isSelected && 'ring-2 ring-primary ring-offset-1 scale-125 z-10',
                                  isHovered && 'ring-2 ring-primary/50 ring-offset-1 scale-110 z-10',
                                  stance === 'disagree' && 'opacity-60',
                                  stance === 'unsure' && 'opacity-80'
                                )}
                                style={{
                                  left: `calc(50% + ${jitter.x}px)`,
                                  top: `calc(50% + ${jitter.y}px)`,
                                  transform: `translate(-50%, -50%)`,
                                }}
                                aria-label={assumption.statement}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1">
                                <div className="font-medium text-xs">{assumption.statement}</div>
                                <div className="flex items-center gap-2 text-xs">
                                  <Badge variant="muted" className="text-xs">
                                    {assumption.category}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    Impact: {assumption.impact}/5
                                  </span>
                                  <span className="text-muted-foreground">
                                    {assumption.confidence} Confidence
                                  </span>
                                  {stance !== 'unreviewed' && (
                                    <span className="text-muted-foreground">
                                      [{stance}]
                                    </span>
                                  )}
                                  {assumption.sourcesCount > 0 && (
                                    <span className="text-muted-foreground">
                                      {assumption.sourcesCount} source{assumption.sourcesCount !== 1 ? 's' : ''}
                                    </span>
                                  )}
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

        {/* Quadrant callouts */}
        <div className="absolute inset-0 pointer-events-none">
          {/* High Impact / Low Confidence (Risks) - Top Left */}
          <div className="absolute top-2 left-12 text-xs">
            <div className="bg-warning/20 border border-warning/40 rounded px-2 py-1">
              <div className="font-medium text-warning">Risks</div>
              <div className="text-muted-foreground">{quadrantCounts.risks}</div>
            </div>
          </div>
          
          {/* High Impact / High Confidence (Core Bets) - Top Right */}
          <div className="absolute top-2 right-4 text-xs">
            <div className="bg-success/20 border border-success/40 rounded px-2 py-1">
              <div className="font-medium text-success">Core Bets</div>
              <div className="text-muted-foreground">{quadrantCounts.coreBets}</div>
            </div>
          </div>
          
          {/* Low Impact / Low Confidence (Ignore) - Bottom Left */}
          <div className="absolute bottom-8 left-12 text-xs">
            <div className="bg-muted/40 border border-border rounded px-2 py-1">
              <div className="font-medium text-muted-foreground">Ignore</div>
              <div className="text-muted-foreground">{quadrantCounts.ignore}</div>
            </div>
          </div>
          
          {/* Low Impact / High Confidence (Small Wins) - Bottom Right */}
          <div className="absolute bottom-8 right-4 text-xs">
            <div className="bg-info/20 border border-info/40 rounded px-2 py-1">
              <div className="font-medium text-info">Small Wins</div>
              <div className="text-muted-foreground">{quadrantCounts.smallWins}</div>
            </div>
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
    </div>
  )
}
