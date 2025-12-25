'use client'

import { useMemo } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { Assumption } from '@/lib/results/assumptions'
import { 
  deriveDecisionSensitivity, 
  getLeverQuadrant, 
  getQuadrantLabel,
  computeQuadrantCounts,
  type LeverQuadrant 
} from '@/lib/results/leverQuadrants'
import { cn } from '@/lib/utils'

interface LeversActionMatrixProps {
  projectId: string
  levers: Assumption[]
  selectedId?: string | null
  hoverId?: string | null
  onSelectLever: (id: string) => void
  onHoverLever?: (id: string | null) => void
}

/**
 * Get confidence index (0-2 for Low, Medium, High)
 */
function getConfidenceIndex(confidence: Assumption['confidence']): number {
  return confidence === 'High' ? 2 : confidence === 'Medium' ? 1 : 0
}

/**
 * Get quadrant color for point
 */
function getQuadrantColor(quadrant: LeverQuadrant): string {
  switch (quadrant) {
    case 'mustProveNow':
      return 'bg-warning border-warning'
    case 'watchClosely':
      return 'bg-primary border-primary'
    case 'safeToProceed':
      return 'bg-success border-success'
    case 'ignoreForNow':
      return 'bg-muted border-border'
  }
}

/**
 * Get category ring style (for point border/ring)
 */
function getCategoryRingStyle(category: Assumption['category']): string {
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
 * Deterministic jitter based on lever ID
 */
function getJitterPosition(id: string, index: number, totalInCell: number): { x: number; y: number } {
  if (totalInCell === 1) return { x: 0, y: 0 }
  
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    const char = id.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash
  }
  
  const angle = (Math.abs(hash) % 360) * (Math.PI / 180)
  const radius = 8 + (index % 3) * 4
  const x = Math.cos(angle) * radius
  const y = Math.sin(angle) * radius
  
  return { x, y }
}

export function LeversActionMatrix({
  projectId,
  levers,
  selectedId,
  hoverId,
  onSelectLever,
  onHoverLever,
}: LeversActionMatrixProps) {
  // Group levers by confidence and decision sensitivity
  const grid = useMemo(() => {
    const g: Record<string, Assumption[]> = {}
    levers.forEach(lever => {
      const confIdx = getConfidenceIndex(lever.confidence)
      const sensitivity = deriveDecisionSensitivity(lever)
      const key = `${confIdx}-${sensitivity}`
      if (!g[key]) {
        g[key] = []
      }
      g[key].push(lever)
    })
    return g
  }, [levers])

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
  const quadrantCounts = useMemo(() => computeQuadrantCounts(levers), [levers])

  if (levers.length === 0) {
    return (
      <div className="panel p-6">
        <p className="text-sm text-muted-foreground">
          No levers available to visualize.
        </p>
      </div>
    )
  }

  return (
    <div className="panel p-6 space-y-4">
      {/* Quadrant Legend with Counts */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground font-medium">Quadrants:</span>
          <Badge variant="warning" className="text-xs">
            Must Prove Now ({quadrantCounts.mustProveNow})
          </Badge>
          <Badge variant="default" className="text-xs">
            Watch Closely ({quadrantCounts.watchClosely})
          </Badge>
          <Badge variant="success" className="text-xs">
            Safe to Proceed ({quadrantCounts.safeToProceed})
          </Badge>
          <Badge variant="muted" className="text-xs">
            Ignore for Now ({quadrantCounts.ignoreForNow})
          </Badge>
        </div>
      </div>

      {/* Map Grid */}
      <div className="relative border border-border rounded-lg p-4 bg-muted/30">
        {/* Y-axis labels (Decision Sensitivity) */}
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
          {/* Grid: 3 columns (confidence) x 5 rows (decision sensitivity) */}
          <div className="grid grid-cols-3 gap-2" style={{ height: '300px' }}>
            {[2, 1, 0].map(confIdx => {
              return [5, 4, 3, 2, 1].map(sensitivity => {
                const key = `${confIdx}-${sensitivity}`
                const cellLevers = grid[key] || []
                const cellCount = cellCounts.counts[key] || 0
                const heatIntensity = cellCounts.maxCount > 0 
                  ? Math.min(cellCount / cellCounts.maxCount, 1) 
                  : 0
                
                const heatClass = heatIntensity > 0.6 ? 'bg-primary/20' 
                  : heatIntensity > 0.3 ? 'bg-primary/10' 
                  : heatIntensity > 0 ? 'bg-primary/5' 
                  : ''
                
                return (
                  <div
                    key={`${confIdx}-${sensitivity}`}
                    className={cn("relative border border-border/50 rounded", heatClass)}
                  >
                    {cellLevers.map((lever, idx) => {
                      const jitter = getJitterPosition(lever.id, idx, cellLevers.length)
                      const quadrant = getLeverQuadrant(lever)
                      const isSelected = selectedId === lever.id
                      const isHovered = hoverId === lever.id
                      
                      return (
                        <TooltipProvider key={lever.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation()
                                  onSelectLever(lever.id)
                                }}
                                onMouseEnter={() => onHoverLever?.(lever.id)}
                                onMouseLeave={() => onHoverLever?.(null)}
                                className={cn(
                                  'absolute w-3 h-3 rounded-full transition-all hover:scale-150 hover:z-10',
                                  getQuadrantColor(quadrant),
                                  getCategoryRingStyle(lever.category),
                                  isSelected && 'ring-2 ring-primary ring-offset-1 scale-125 z-10',
                                  isHovered && 'ring-2 ring-primary/50 ring-offset-1 scale-110 z-10'
                                )}
                                style={{
                                  left: `calc(50% + ${jitter.x}px)`,
                                  top: `calc(50% + ${jitter.y}px)`,
                                  transform: `translate(-50%, -50%)`,
                                }}
                                aria-label={lever.statement}
                              />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs">
                              <div className="space-y-1">
                                <div className="font-medium text-xs line-clamp-2">{lever.statement}</div>
                                <div className="flex items-center gap-2 text-xs flex-wrap">
                                  <Badge variant="muted" className="text-xs">
                                    {lever.category}
                                  </Badge>
                                  <Badge variant="muted" className="text-xs">
                                    {getQuadrantLabel(quadrant)}
                                  </Badge>
                                  <span className="text-muted-foreground">
                                    {lever.confidence}
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

        {/* Quadrant callouts */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Must Prove Now (low confidence, high sensitivity) - Top Left */}
          <div className="absolute top-2 left-12 text-xs">
            <div className="bg-warning/20 border border-warning/40 rounded px-2 py-1">
              <div className="font-medium text-warning">Must Prove Now</div>
              <div className="text-muted-foreground">{quadrantCounts.mustProveNow}</div>
            </div>
          </div>
          
          {/* Watch Closely (medium confidence, medium sensitivity) - Center */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs">
            <div className="bg-primary/20 border border-primary/40 rounded px-2 py-1">
              <div className="font-medium text-primary">Watch Closely</div>
              <div className="text-muted-foreground">{quadrantCounts.watchClosely}</div>
            </div>
          </div>
          
          {/* Safe to Proceed (high confidence, low sensitivity) - Bottom Right */}
          <div className="absolute bottom-8 right-4 text-xs">
            <div className="bg-success/20 border border-success/40 rounded px-2 py-1">
              <div className="font-medium text-success">Safe to Proceed</div>
              <div className="text-muted-foreground">{quadrantCounts.safeToProceed}</div>
            </div>
          </div>
          
          {/* Ignore for Now (low sensitivity) - Bottom Left */}
          <div className="absolute bottom-8 left-12 text-xs">
            <div className="bg-muted/40 border border-border rounded px-2 py-1">
              <div className="font-medium text-muted-foreground">Ignore for Now</div>
              <div className="text-muted-foreground">{quadrantCounts.ignoreForNow}</div>
            </div>
          </div>
        </div>

        {/* Axis labels */}
        <div className="ml-12 mt-2 text-xs text-muted-foreground">
          <div className="flex justify-between mb-1">
            <span>Decision Sensitivity (Y-axis)</span>
            <span>Confidence (X-axis)</span>
          </div>
        </div>
      </div>
    </div>
  )
}

