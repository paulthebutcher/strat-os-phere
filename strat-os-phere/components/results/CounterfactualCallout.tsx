'use client'

import { SectionCard } from '@/components/results/SectionCard'
import { generateCounterfactual } from '@/lib/results/counterfactuals'
import { cn } from '@/lib/utils'

interface CounterfactualCalloutProps {
  opportunity: any
  className?: string
}

/**
 * Counterfactual Callout
 * 
 * Shows "Why this might be wrong" insights for an opportunity.
 * Uses deterministic heuristics to generate counterfactuals.
 */
export function CounterfactualCallout({
  opportunity,
  className,
}: CounterfactualCalloutProps) {
  const counterfactual = generateCounterfactual(opportunity)

  return (
    <SectionCard
      className={cn('border-l-4 border-l-warning/50 bg-warning/5', className)}
    >
      <div className="space-y-3">
        <div>
          <h4 className="text-sm font-semibold text-foreground mb-1">
            Counterfactual
          </h4>
        </div>
        <div>
          <p className="text-sm text-foreground leading-relaxed mb-2">
            <span className="font-medium">Risk:</span> {counterfactual.risk}
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            <span className="font-medium">What would change my mind:</span>{' '}
            {counterfactual.whatWouldChangeMyMind}
          </p>
        </div>
      </div>
    </SectionCard>
  )
}

