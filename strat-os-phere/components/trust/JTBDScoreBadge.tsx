'use client'

import * as React from 'react'
import { Info } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { computeJTBDScore } from '@/lib/scoring/jtbdScore'
import type { JtbdItem } from '@/lib/schemas/jtbd'
import { cn } from '@/lib/utils'

export interface JTBDScoreBadgeProps {
  jtbd: JtbdItem | null | undefined
  className?: string
  variant?: 'default' | 'compact'
}

/**
 * JTBDScoreBadge - Displays completeness/quality score for JTBD items
 * 
 * Shows:
 * - Numeric score (X.X/10) if input is sufficient
 * - "Insufficient" if input is insufficient
 * - "Why this score?" dialog with detailed breakdown
 * 
 * Note: This is an "input quality" score, not evidence-backed yet.
 * Citations/tags will be added in a future PR.
 */
export function JTBDScoreBadge({
  jtbd,
  className,
  variant = 'default',
}: JTBDScoreBadgeProps) {
  const scoreResult = React.useMemo(
    () => computeJTBDScore(jtbd),
    [jtbd]
  )

  const { isSufficient, score10, scoreLabel, reasons } = scoreResult

  // Badge content
  const badgeContent = isSufficient && score10 !== undefined ? (
    <span className="font-semibold">{score10.toFixed(1)}/10</span>
  ) : (
    <span className="text-muted-foreground">Insufficient</span>
  )

  // Badge variant based on score
  const badgeVariant = isSufficient && score10 !== undefined
    ? score10 >= 8
      ? 'success'
      : score10 >= 6
      ? 'info'
      : score10 >= 4
      ? 'warning'
      : 'secondary'
    : 'muted'

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <Badge variant={badgeVariant} className="text-xs">
          {badgeContent}
        </Badge>
        <Dialog>
          <DialogTrigger asChild>
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Why this score?"
            >
              <Info className="h-3.5 w-3.5" />
            </button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Completeness Score Details</DialogTitle>
              <DialogDescription>
                {isSufficient
                  ? `Score: ${score10?.toFixed(1)}/10 (${scoreLabel})`
                  : 'Input is insufficient to compute a score'}
              </DialogDescription>
            </DialogHeader>
            <ScoreDetails reasons={reasons} isSufficient={isSufficient} />
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Badge variant={badgeVariant} className="text-xs">
        {badgeContent}
      </Badge>
      <Dialog>
        <DialogTrigger asChild>
          <button
            type="button"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Why this score?"
          >
            <Info className="h-3.5 w-3.5" />
            <span>Why this score?</span>
          </button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Completeness Score Details</DialogTitle>
            <DialogDescription>
              {isSufficient
                ? `Score: ${score10?.toFixed(1)}/10 (${scoreLabel})`
                : 'Input is insufficient to compute a score'}
            </DialogDescription>
          </DialogHeader>
          <ScoreDetails reasons={reasons} isSufficient={isSufficient} />
        </DialogContent>
      </Dialog>
    </div>
  )
}

/**
 * ScoreDetails - Renders detailed breakdown of score reasons
 */
function ScoreDetails({
  reasons,
  isSufficient,
}: {
  reasons: ReturnType<typeof computeJTBDScore>['reasons']
  isSufficient: boolean
}) {
  const {
    hasWho,
    hasContext,
    outcomesCount,
    constraintsCount,
    statementLength,
    failedChecks,
  } = reasons

  // Compute component scores for display
  const outcomesScore = Math.min(outcomesCount, 3)
  const constraintsScore = Math.min(constraintsCount, 2)
  const whoContextScore = (hasWho ? 1 : 0) + (hasContext ? 1 : 0)
  
  // Statement quality score
  let statementScore = 0
  if (statementLength >= 120) {
    statementScore = 3
  } else if (statementLength >= 80) {
    statementScore = 2
  } else if (statementLength >= 40) {
    statementScore = 1
  }

  const totalScore = outcomesScore + constraintsScore + whoContextScore + statementScore

  return (
    <div className="space-y-6 text-sm">
      {/* Summary */}
      {!isSufficient && (
        <div className="rounded-lg border border-warning/20 bg-warning/10 px-4 py-3">
          <p className="font-medium text-warning mb-2">Insufficient input to score yet</p>
          <p className="text-muted-foreground text-xs mb-3">
            Complete the required fields to get a completeness score.
          </p>
          {failedChecks.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-xs text-muted-foreground">
              {failedChecks.map((check, idx) => (
                <li key={idx}>{check}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Input Fields */}
      <div>
        <h4 className="font-semibold mb-2">Input Fields</h4>
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Who:</span>
            <span className="font-medium">{hasWho ? 'Present' : 'Missing'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Context:</span>
            <span className="font-medium">{hasContext ? 'Present' : 'Missing'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Desired outcomes:</span>
            <span className="font-medium">{outcomesCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Constraints:</span>
            <span className="font-medium">{constraintsCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Statement length:</span>
            <span className="font-medium">{statementLength} chars</span>
          </div>
        </div>
      </div>

      {/* Score Breakdown */}
      {isSufficient && (
        <div>
          <h4 className="font-semibold mb-2">Score Breakdown</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Outcomes score:</span>
              <span className="font-medium">{outcomesScore}/3</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Constraints score:</span>
              <span className="font-medium">{constraintsScore}/2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Who/Context score:</span>
              <span className="font-medium">{whoContextScore}/2</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Statement quality:</span>
              <span className="font-medium">{statementScore}/3</span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total score:</span>
                <span className="font-medium">{totalScore.toFixed(1)}/10</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Requirements */}
      <div>
        <h4 className="font-semibold mb-2">Requirements</h4>
        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Min statement length:</span>
            <span className="font-medium">40 chars</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Min desired outcomes:</span>
            <span className="font-medium">1</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Need context or who:</span>
            <span className="font-medium">Yes</span>
          </div>
        </div>
      </div>

      {/* Note about evidence */}
      <div className="rounded-lg border border-border/50 bg-muted/30 px-4 py-3">
        <p className="text-xs text-muted-foreground">
          <strong className="font-medium text-foreground">Note:</strong> This is a completeness score based on input quality. Evidence-backed scoring with citations will be added in a future update.
        </p>
      </div>
    </div>
  )
}

