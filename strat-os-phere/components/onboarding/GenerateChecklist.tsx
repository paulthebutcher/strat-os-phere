'use client'

import { CheckCircle2, Circle } from 'lucide-react'

interface GenerateChecklistProps {
  hasDecision: boolean
  hasMarket: boolean
  competitorCount: number
  requiredCompetitors: number
}

export function GenerateChecklist({
  hasDecision,
  hasMarket,
  competitorCount,
  requiredCompetitors,
}: GenerateChecklistProps) {
  const hasEnoughCompetitors = competitorCount >= requiredCompetitors

  return (
    <div className="space-y-2 text-sm">
      <div className="flex items-center gap-2">
        {hasDecision ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className={hasDecision ? 'text-foreground' : 'text-muted-foreground'}>
          Add your decision
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {hasMarket ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className={hasMarket ? 'text-foreground' : 'text-muted-foreground'}>
          Add market
        </span>
      </div>
      
      <div className="flex items-center gap-2">
        {hasEnoughCompetitors ? (
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
        ) : (
          <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
        <span className={hasEnoughCompetitors ? 'text-foreground' : 'text-muted-foreground'}>
          Add {requiredCompetitors} competitors ({competitorCount}/{requiredCompetitors})
        </span>
      </div>
    </div>
  )
}

