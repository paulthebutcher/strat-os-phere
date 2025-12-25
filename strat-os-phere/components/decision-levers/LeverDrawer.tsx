'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import type { Assumption } from '@/lib/results/assumptions'
import { getQuadrantLabel, getLeverQuadrant } from '@/lib/results/leverQuadrants'
import { useLeverCommitment } from './useLeverCommitment'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LeverDrawerProps {
  projectId: string
  lever: Assumption | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

/**
 * Validation plan actions (static templates)
 */
const VALIDATION_ACTIONS = [
  {
    id: 'interview',
    label: 'Interview 10 target customers',
    description: 'Log results',
    href: null, // Would route to interviews page if it exists
    actionType: 'interview' as const,
  },
  {
    id: 'reviews',
    label: 'Scan reviews for mentions',
    description: 'Open Evidence filter',
    href: null, // Will be constructed from projectId
    actionType: 'evidence' as const,
  },
  {
    id: 'competitive',
    label: 'Competitive check',
    description: 'Open Competitors',
    href: null, // Will be constructed from projectId
    actionType: 'competitors' as const,
  },
] as const

export function LeverDrawer({ projectId, lever, open, onOpenChange }: LeverDrawerProps) {
  const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())
  
  if (!lever) return null
  
  const quadrant = getLeverQuadrant(lever)
  const quadrantLabel = getQuadrantLabel(quadrant)
  const [commitment, setCommitment] = useLeverCommitment(projectId, lever.id)
  const showValidationPlan = commitment === 'validate'
  
  // Build validation action hrefs
  const validationActions = VALIDATION_ACTIONS.map(action => ({
    ...action,
    href: action.actionType === 'evidence'
      ? `/projects/${projectId}/evidence`
      : action.actionType === 'competitors'
      ? `/projects/${projectId}/competitors`
      : null,
  }))
  
  const handleActionComplete = (actionId: string) => {
    setCompletedActions(prev => {
      const next = new Set(prev)
      if (next.has(actionId)) {
        next.delete(actionId)
      } else {
        next.add(actionId)
      }
      return next
    })
  }
  
  // Generate "What this unlocks" text
  const whatThisUnlocks = lever.relatedOpportunityIds.length > 0
    ? `Unlocks confidence in: Top Opportunity`
    : 'Unlocks confidence in your top recommendation'
  
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
        {lever && (
          <>
            <SheetHeader>
              <SheetTitle className="text-lg">{lever.statement}</SheetTitle>
              <SheetDescription>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <Badge variant="muted">{quadrantLabel}</Badge>
                  <Badge variant="muted">{lever.category}</Badge>
                  <Badge
                    variant={
                      lever.confidence === 'High' ? 'success' :
                      lever.confidence === 'Medium' ? 'warning' : 'muted'
                    }
                  >
                    {lever.confidence} Confidence
                  </Badge>
                  {lever.sourcesCount > 0 && (
                    <Badge variant="muted">
                      {lever.sourcesCount} source{lever.sourcesCount !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </SheetDescription>
            </SheetHeader>

            <div className="mt-6 space-y-6">
              {/* Why it matters */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">Why it matters</h4>
                <p className="text-sm text-muted-foreground">{lever.whyItMatters}</p>
              </div>

              {/* What this unlocks */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">What this unlocks</h4>
                <p className="text-sm text-muted-foreground">{whatThisUnlocks}</p>
              </div>

              {/* Validation Plan (expanded when "Validate first" is selected) */}
              {showValidationPlan && (
                <div className="border-t border-border pt-4">
                  <h4 className="text-sm font-semibold text-foreground mb-3">Validation plan</h4>
                  <div className="space-y-3">
                    {validationActions.map((action) => {
                      const isCompleted = completedActions.has(action.id)
                      const canStart = action.href !== null
                      
                      return (
                        <div
                          key={action.id}
                          className={cn(
                            "panel p-3 border rounded-md",
                            isCompleted && "opacity-60"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <button
                                  type="button"
                                  onClick={() => handleActionComplete(action.id)}
                                  className="flex-shrink-0 mt-0.5"
                                >
                                  <CheckCircle2
                                    className={cn(
                                      "h-4 w-4 transition-colors",
                                      isCompleted
                                        ? "text-success fill-success"
                                        : "text-muted-foreground"
                                    )}
                                  />
                                </button>
                                <span className={cn(
                                  "text-sm font-medium",
                                  isCompleted && "line-through"
                                )}>
                                  {action.label}
                                </span>
                              </div>
                              <p className="text-xs text-muted-foreground ml-6">
                                {action.description}
                              </p>
                            </div>
                            {canStart && !isCompleted && (
                              <Link href={action.href!}>
                                <Button size="sm" variant="outline" className="shrink-0">
                                  Start
                                </Button>
                              </Link>
                            )}
                            {isCompleted && (
                              <Badge variant="success" className="shrink-0">Done</Badge>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Commitment buttons */}
              <div className="border-t border-border pt-4">
                <h4 className="text-sm font-semibold text-foreground mb-3">Your commitment</h4>
                <div className="flex flex-col gap-2">
                  <Button
                    variant={commitment === 'proceed' ? 'default' : 'outline'}
                    onClick={() => setCommitment(commitment === 'proceed' ? 'unset' : 'proceed')}
                    className="justify-start"
                  >
                    Proceed
                  </Button>
                  <Button
                    variant={commitment === 'validate' ? 'default' : 'outline'}
                    onClick={() => setCommitment(commitment === 'validate' ? 'unset' : 'validate')}
                    className="justify-start"
                  >
                    Validate first
                  </Button>
                  <Button
                    variant={commitment === 'park' ? 'default' : 'outline'}
                    onClick={() => setCommitment(commitment === 'park' ? 'unset' : 'park')}
                    className="justify-start"
                  >
                    Park
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}

