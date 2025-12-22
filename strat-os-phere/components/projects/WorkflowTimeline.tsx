import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ReadinessItem } from '@/lib/ui/readiness'

interface WorkflowTimelineProps {
  readinessItems: ReadinessItem[]
}

/**
 * Simple 3-step workflow timeline showing current progress
 */
export function WorkflowTimeline({ readinessItems }: WorkflowTimelineProps) {
  // Map readiness items to workflow steps
  const basicsComplete = readinessItems.find((i) => i.id === 'basics')?.status === 'complete'
  const competitorsComplete = readinessItems.find((i) => i.id === 'competitors')?.status === 'complete'
  const evidenceComplete = readinessItems.find((i) => i.id === 'evidence')?.status === 'complete'
  const canGenerate = basicsComplete && competitorsComplete && evidenceComplete

  const steps = [
    {
      id: 'define',
      label: 'Define project',
      complete: basicsComplete,
      current: basicsComplete && !competitorsComplete && !evidenceComplete,
    },
    {
      id: 'competitors',
      label: 'Add competitors + evidence',
      complete: competitorsComplete && evidenceComplete,
      current: basicsComplete && (competitorsComplete || evidenceComplete) && !canGenerate,
    },
    {
      id: 'generate',
      label: 'Generate opportunities',
      complete: canGenerate,
      current: canGenerate && !competitorsComplete && !evidenceComplete, // This step is "current" when ready to generate
    },
  ]

  // Find the current active step (first incomplete step, or last step if all complete)
  const activeStepIndex = steps.findIndex((s) => !s.complete)
  const currentStepIndex = activeStepIndex === -1 ? steps.length - 1 : activeStepIndex

  return (
    <div className="panel p-6">
      <h3 className="text-base font-semibold text-foreground mb-4">Workflow</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
        
        {/* Steps */}
        <div className="relative space-y-6">
          {steps.map((step, index) => {
            const isComplete = step.complete
            const isCurrent = index === currentStepIndex
            const isPast = index < currentStepIndex

            return (
              <div key={step.id} className="relative flex items-start gap-4">
                {/* Step indicator */}
                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background border-2 border-border">
                  {isComplete || isPast ? (
                    <Check className="h-4 w-4 text-success" />
                  ) : (
                    <div
                      className={cn(
                        'h-3 w-3 rounded-full',
                        isCurrent
                          ? 'bg-primary'
                          : 'bg-muted'
                      )}
                    />
                  )}
                </div>

                {/* Step label */}
                <div className="flex-1 pt-1">
                  <p
                    className={cn(
                      'text-sm font-medium',
                      isComplete || isCurrent
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {step.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

