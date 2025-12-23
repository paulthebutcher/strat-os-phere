'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export type ActionState = 'empty' | 'partial' | 'failed'

interface NextBestActionCardProps {
  state: ActionState
  onPrimaryAction?: () => void
  primaryAction?: React.ReactNode
  secondaryAction?: React.ReactNode
  className?: string
}

/**
 * NextBestActionCard - Guidance card for empty/failed/partial states
 * 
 * Shows:
 * - "What's missing"
 * - "Why it matters"
 * - "Next step" (primary button)
 * 
 * Provides default recommendations by state but can be customized via props.
 */
export function NextBestActionCard({
  state,
  onPrimaryAction,
  primaryAction,
  secondaryAction,
  className,
}: NextBestActionCardProps) {
  // Default recommendations by state
  const defaultContent = React.useMemo(() => {
    switch (state) {
      case 'empty':
        return {
          missing: "No competitors added / no run executed",
          why: "We need evidence across competitors to rank bets credibly.",
          nextLabel: "Add competitors",
        }
      case 'partial':
        return {
          missing: "Coverage is incomplete (pricing/docs/changelog/reviews may be missing)",
          why: "Ranking confidence increases when independent sources converge.",
          nextLabel: "Expand evidence coverage",
        }
      case 'failed':
        return {
          missing: "Analysis did not complete",
          why: "We can't generate ranked opportunities without a successful run.",
          nextLabel: "Retry analysis",
        }
    }
  }, [state])

  // Determine primary action content
  const primaryButton = React.useMemo(() => {
    if (primaryAction) {
      return primaryAction
    }
    if (onPrimaryAction) {
      return (
        <Button onClick={onPrimaryAction} variant="brand" size="lg">
          {defaultContent.nextLabel}
        </Button>
      )
    }
    return null
  }, [primaryAction, onPrimaryAction, defaultContent.nextLabel])

  return (
    <Card className={cn('border-border', className)}>
      <CardHeader>
        <CardTitle className="text-base">What's missing</CardTitle>
        <CardDescription className="text-sm leading-normal">
          {defaultContent.missing}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div>
          <p className="text-sm font-medium text-foreground mb-1">
            Why it matters
          </p>
          <p className="text-sm text-muted-foreground leading-normal">
            {defaultContent.why}
          </p>
        </div>
      </CardContent>
      {primaryButton && (
        <CardFooter className="flex flex-col sm:flex-row gap-2">
          {primaryButton}
          {secondaryAction && (
            <div className="flex-shrink-0">
              {secondaryAction}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  )
}

