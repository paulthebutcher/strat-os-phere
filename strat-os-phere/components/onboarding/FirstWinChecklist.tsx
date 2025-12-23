'use client'

import { CheckCircle2, Circle } from 'lucide-react'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { cn } from '@/lib/utils'

interface FirstWinChecklistProps {
  mode: 'guided' | 'default'
  projectId?: string
  inputs?: {
    name?: string
    market?: string
    customer?: string
    goal?: string
    product?: string
  }
  competitorCount?: number
  hasResults?: boolean
}

/**
 * First win checklist that appears across key pages in guided mode.
 * Shows 3-step progress: describe market/customer, add competitors, generate analysis.
 */
export function FirstWinChecklist({
  mode,
  projectId,
  inputs,
  competitorCount = 0,
  hasResults = false,
}: FirstWinChecklistProps) {
  // Only show in guided mode
  if (mode !== 'guided') {
    return null
  }

  // Compute quality score for step 1
  const qualityScore = (() => {
    let score = 0
    if (inputs?.name && inputs.name.length >= 12) score += 25
    if (inputs?.market && inputs.market.length >= 20) score += 25
    if (inputs?.customer && inputs.customer.length >= 15) score += 25
    if (inputs?.goal && inputs.goal.length >= 25) score += 15
    if (inputs?.product && inputs.product.length >= 20) score += 10
    return score
  })()

  const step1Complete = qualityScore >= 40
  const step2Complete = competitorCount >= 3
  const step3Complete = hasResults

  const steps = [
    {
      label: 'Describe the market & customer',
      complete: step1Complete,
    },
    {
      label: 'Add 3 competitors',
      complete: step2Complete,
    },
    {
      label: 'Generate analysis',
      complete: step3Complete,
    },
  ]

  return (
    <SurfaceCard className="p-4 border-indigo-200 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-950/20">
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-foreground">First win checklist</h3>
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div key={idx} className="flex items-center gap-2.5">
              {step.complete ? (
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
              ) : (
                <Circle className="h-4 w-4 text-muted-foreground shrink-0" />
              )}
              <span
                className={cn(
                  'text-sm',
                  step.complete
                    ? 'text-foreground line-through opacity-60'
                    : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </SurfaceCard>
  )
}

