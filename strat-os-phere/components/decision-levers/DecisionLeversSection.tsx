'use client'

import { useState, useMemo, useCallback, useEffect } from 'react'
import { LeversActionMatrix } from './LeversActionMatrix'
import { LeverCard } from './LeverCard'
import { LeverDrawer } from './LeverDrawer'
import { CopySectionButton } from '../results/CopySectionButton'
import type { Assumption } from '@/lib/results/assumptions'
import { 
  getLeverQuadrant, 
  getActionPriority,
  getQuadrantLabel,
  computeQuadrantCounts,
} from '@/lib/results/leverQuadrants'

interface DecisionLeversSectionProps {
  projectId: string
  levers: Assumption[]
}

/**
 * Format levers section as markdown for export
 */
function formatLeversToMarkdown(levers: Assumption[]): string {
  const lines: string[] = []
  lines.push('# Decision Levers')
  lines.push('')
  lines.push('Levers are the beliefs that change what you should do next. Validate the few that block action.')
  lines.push('')
  
  const quadrantCounts = computeQuadrantCounts(levers)
  
  lines.push('## Summary')
  lines.push('')
  lines.push(`- Must Prove Now: ${quadrantCounts.mustProveNow}`)
  lines.push(`- Watch Closely: ${quadrantCounts.watchClosely}`)
  lines.push(`- Safe to Proceed: ${quadrantCounts.safeToProceed}`)
  lines.push(`- Ignore for Now: ${quadrantCounts.ignoreForNow}`)
  lines.push('')
  
  // Sort by action priority
  const sorted = [...levers].sort((a, b) => {
    const priorityA = getActionPriority(getLeverQuadrant(a))
    const priorityB = getActionPriority(getLeverQuadrant(b))
    return priorityA - priorityB
  })
  
  lines.push('## Levers')
  lines.push('')
  
  sorted.forEach((lever, idx) => {
    const quadrant = getLeverQuadrant(lever)
    const quadrantLabel = getQuadrantLabel(quadrant)
    
    lines.push(`### ${idx + 1}. ${lever.statement}`)
    lines.push('')
    lines.push(`**Quadrant:** ${quadrantLabel}`)
    lines.push(`**Category:** ${lever.category}`)
    lines.push(`**Confidence:** ${lever.confidence}`)
    lines.push(`**Why it matters:** ${lever.whyItMatters}`)
    if (lever.sourcesCount > 0) {
      lines.push(`**Sources:** ${lever.sourcesCount}`)
    }
    lines.push('')
  })
  
  return lines.join('\n')
}

export function DecisionLeversSection({ projectId, levers }: DecisionLeversSectionProps) {
  const [selectedLeverId, setSelectedLeverId] = useState<string | null>(null)
  const [hoverLeverId, setHoverLeverId] = useState<string | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  // Get selected lever
  const selectedLever = useMemo(() => {
    return levers.find(l => l.id === selectedLeverId) || null
  }, [levers, selectedLeverId])
  
  // Sort levers by action priority
  const sortedLevers = useMemo(() => {
    return [...levers].sort((a, b) => {
      const priorityA = getActionPriority(getLeverQuadrant(a))
      const priorityB = getActionPriority(getLeverQuadrant(b))
      return priorityA - priorityB
    })
  }, [levers])
  
  // Get "Must Prove Now" levers (blocking action)
  const blockingLevers = useMemo(() => {
    return sortedLevers.filter(lever => getLeverQuadrant(lever) === 'mustProveNow').slice(0, 2)
  }, [sortedLevers])
  
  const quadrantCounts = useMemo(() => computeQuadrantCounts(levers), [levers])
  
  const handleLeverClick = useCallback((leverId: string) => {
    setSelectedLeverId(leverId)
    setDrawerOpen(true)
  }, [])
  
  const handleCardClick = useCallback((leverId: string) => {
    handleLeverClick(leverId)
  }, [handleLeverClick])
  
  const handleMatrixClick = useCallback((leverId: string) => {
    handleLeverClick(leverId)
  }, [handleLeverClick])
  
  // Listen for custom event to open drawer from DecisionBrief
  useEffect(() => {
    const handleOpenLeverDrawer = (event: CustomEvent<{ leverId: string }>) => {
      const { leverId } = event.detail
      if (levers.find(l => l.id === leverId)) {
        setSelectedLeverId(leverId)
        setDrawerOpen(true)
      }
    }
    
    window.addEventListener('open-lever-drawer', handleOpenLeverDrawer as EventListener)
    return () => {
      window.removeEventListener('open-lever-drawer', handleOpenLeverDrawer as EventListener)
    }
  }, [levers])
  
  const markdownContent = formatLeversToMarkdown(levers)
  
  if (levers.length === 0) {
    return (
      <div className="panel p-6">
        <h2 className="text-lg font-semibold text-foreground mb-2">Decision Levers</h2>
        <p className="text-sm text-muted-foreground">
          No levers available. Generate analysis to see decision levers.
        </p>
      </div>
    )
  }
  
  return (
    <>
      <div id="decision-levers" className="space-y-6">
        {/* Header */}
        <div className="panel p-6">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-lg font-semibold text-foreground mb-1">Decision Levers</h2>
              <p className="text-xs text-muted-foreground">
                Levers are the beliefs that change what you should do next. Validate the few that block action.
              </p>
            </div>
            <CopySectionButton content={markdownContent} label="Export" />
          </div>
        </div>
        
        {/* Blocking Action Summary */}
        {blockingLevers.length > 0 ? (
          <div className="panel p-4 border-l-4 border-warning bg-warning/5">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              Blocking Action
            </h3>
            <p className="text-sm text-muted-foreground mb-3">
              {blockingLevers.length} lever{blockingLevers.length !== 1 ? 's are' : ' is'} blocking action on your top recommendation.
            </p>
            <div className="space-y-2">
              {blockingLevers.map(lever => (
                <div key={lever.id} className="panel-muted p-3">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {lever.statement}
                  </p>
                  <button
                    onClick={() => handleCardClick(lever.id)}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Validate first →
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="panel p-4 border-l-4 border-success bg-success/5">
            <h3 className="text-sm font-semibold text-foreground mb-2">
              No Critical Levers Blocking Action
            </h3>
            <p className="text-sm text-muted-foreground">
              No critical levers blocking action. Proceed with the top recommendation.
            </p>
          </div>
        )}
        
        {/* Action Matrix */}
        <LeversActionMatrix
          projectId={projectId}
          levers={levers}
          selectedId={selectedLeverId}
          hoverId={hoverLeverId}
          onSelectLever={handleMatrixClick}
          onHoverLever={setHoverLeverId}
        />
        
        {/* Levers Queue (Cards) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-foreground">Levers Queue</h3>
            <p className="text-xs text-muted-foreground">
              Sorted by action priority
            </p>
          </div>
          
          <div className="grid gap-4 md:grid-cols-2">
            {sortedLevers.map(lever => (
              <LeverCard
                key={lever.id}
                projectId={projectId}
                lever={lever}
                onClick={() => handleCardClick(lever.id)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Lever Drawer */}
      <LeverDrawer
        projectId={projectId}
        lever={selectedLever}
        open={drawerOpen}
        onOpenChange={(open) => {
          setDrawerOpen(open)
          if (!open) {
            setSelectedLeverId(null)
          }
        }}
      />
    </>
  )
}

