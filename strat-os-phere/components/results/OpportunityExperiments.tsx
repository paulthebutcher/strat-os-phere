'use client'

import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { FlaskConical } from 'lucide-react'
import { deriveExperiments } from '@/lib/results/deriveExperiments'
import { Badge } from '@/components/ui/badge'

interface OpportunityExperimentsProps {
  opportunity: OpportunityV3Item
}

/**
 * OpportunityExperiments - Maps opportunity to concrete experiments users can run.
 * Uses deterministic pattern matching (no AI calls).
 */
export function OpportunityExperiments({
  opportunity,
}: OpportunityExperimentsProps) {
  const experiments = deriveExperiments(opportunity)
  
  if (experiments.length === 0) {
    return null
  }
  
  const getEffortVariant = (effort: 'Low' | 'Medium' | 'High'): 'default' | 'secondary' | 'muted' => {
    switch (effort) {
      case 'Low':
        return 'default'
      case 'Medium':
        return 'secondary'
      case 'High':
        return 'muted'
      default:
        return 'default'
    }
  }
  
  return (
    <div className="rounded-lg bg-muted/30 border border-border p-4">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="experiments" className="border-none">
          <AccordionTrigger className="py-2 hover:no-underline">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold text-foreground">
                Recommended experiments
              </span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-4">
            <div className="space-y-4">
              {experiments.map((experiment, index) => (
                <div key={index} className="space-y-2 pb-3 border-b border-border last:border-b-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <h5 className="text-sm font-medium text-foreground flex-1">
                      {experiment.name}
                    </h5>
                    <Badge variant={getEffortVariant(experiment.effortLevel)} className="text-xs shrink-0">
                      {experiment.effortLevel}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1.5 text-sm">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground mb-0.5">
                        What to build/test
                      </p>
                      <p className="text-foreground leading-relaxed">
                        {experiment.whatToBuild}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                          Primary metric
                        </p>
                        <p className="text-foreground text-xs">
                          {experiment.primaryMetric}
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-xs font-medium text-muted-foreground mb-0.5">
                          Time to signal
                        </p>
                        <p className="text-foreground text-xs">
                          {experiment.timeToSignal}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-2 mt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  Derived from public signals. Treat as directional starting points.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

