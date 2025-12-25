'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import type { Assumption } from '@/lib/results/assumptions'
import { getQuadrantLabel, getLeverQuadrant } from '@/lib/results/leverQuadrants'
import { useLeverCommitment } from './useLeverCommitment'
import { cn } from '@/lib/utils'

interface LeverCardProps {
  projectId: string
  lever: Assumption
  onClick?: () => void
  compact?: boolean
}

export function LeverCard({ projectId, lever, onClick, compact = false }: LeverCardProps) {
  const quadrant = getLeverQuadrant(lever)
  const quadrantLabel = getQuadrantLabel(quadrant)
  const [commitment, setCommitment] = useLeverCommitment(projectId, lever.id)
  
  // Generate "What this unlocks" text
  const whatThisUnlocks = lever.relatedOpportunityIds.length > 0
    ? `Unlocks confidence in: Top Opportunity`
    : 'Unlocks confidence in your top recommendation'
  
  // Get quadrant badge variant
  const quadrantVariant = 
    quadrant === 'mustProveNow' ? 'warning' :
    quadrant === 'watchClosely' ? 'default' :
    quadrant === 'safeToProceed' ? 'success' :
    'muted'
  
  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md cursor-pointer",
        onClick && "hover:border-primary"
      )}
      onClick={onClick}
    >
      <CardHeader className={compact ? "pb-2" : undefined}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className={cn(
            "font-semibold text-foreground leading-tight",
            compact ? "text-sm" : "text-base"
          )}>
            {lever.statement}
          </h3>
        </div>
        
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={quadrantVariant}>{quadrantLabel}</Badge>
          <Badge variant="muted">{lever.category}</Badge>
          <Badge
            variant={
              lever.confidence === 'High' ? 'success' :
              lever.confidence === 'Medium' ? 'warning' : 'muted'
            }
          >
            {lever.confidence}
          </Badge>
          {lever.sourcesCount > 0 && (
            <span className="text-xs text-muted-foreground">
              {lever.sourcesCount} source{lever.sourcesCount !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </CardHeader>
      
      {!compact && (
        <>
          <CardContent className="space-y-3">
            {/* Why this matters */}
            <div>
              <p className="text-sm text-muted-foreground">{lever.whyItMatters}</p>
            </div>
            
            {/* What this unlocks */}
            <div>
              <p className="text-xs text-muted-foreground">{whatThisUnlocks}</p>
            </div>
          </CardContent>
          
          <CardFooter className="flex items-center gap-2 pt-2" onClick={(e) => e.stopPropagation()}>
            <Button
              size="sm"
              variant={commitment === 'proceed' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation()
                setCommitment(commitment === 'proceed' ? 'unset' : 'proceed')
              }}
            >
              Proceed
            </Button>
            <Button
              size="sm"
              variant={commitment === 'validate' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation()
                setCommitment(commitment === 'validate' ? 'unset' : 'validate')
              }}
            >
              Validate first
            </Button>
            <Button
              size="sm"
              variant={commitment === 'park' ? 'default' : 'outline'}
              onClick={(e) => {
                e.stopPropagation()
                setCommitment(commitment === 'park' ? 'unset' : 'park')
              }}
            >
              Park
            </Button>
          </CardFooter>
        </>
      )}
    </Card>
  )
}

