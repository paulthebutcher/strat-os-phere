import { Shield } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OpportunityV3Item } from '@/lib/schemas/opportunityV3'

interface HardToCopyCalloutProps {
  opportunity: OpportunityV3Item
  className?: string
}

/**
 * Prominent callout showing why an opportunity is hard to copy
 * Uses tradeoffs.why_competitors_wont_follow if available, otherwise derives fallback
 */
export function HardToCopyCallout({
  opportunity,
  className,
}: HardToCopyCalloutProps) {
  // Prefer tradeoffs.why_competitors_wont_follow if available
  const whyWontFollow =
    opportunity.tradeoffs?.why_competitors_wont_follow &&
    Array.isArray(opportunity.tradeoffs.why_competitors_wont_follow) &&
    opportunity.tradeoffs.why_competitors_wont_follow.length > 0
      ? opportunity.tradeoffs.why_competitors_wont_follow
      : null

  // Fallback: derive from scoring breakdown defensibility if high
  let fallbackMessage: string | null = null
  if (!whyWontFollow && opportunity.scoring?.breakdown) {
    const defensibility = opportunity.scoring.breakdown.defensibility
    if (typeof defensibility === 'number' && defensibility >= 7) {
      fallbackMessage = 'Strong structural advantages make this difficult for competitors to replicate quickly.'
    }
  }

  // Final fallback if no data
  if (!whyWontFollow && !fallbackMessage) {
    return (
      <div
        className={cn(
          'rounded-md border border-border bg-muted/30 p-4',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 shrink-0 text-muted-foreground mt-0.5" />
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Hard to copy because
            </h3>
            <p className="text-sm text-muted-foreground italic">
              Not enough evidence yet — add competitor citations or regenerate.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Show why_competitors_wont_follow if available
  if (whyWontFollow && whyWontFollow.length > 0) {
    return (
      <div
        className={cn(
          'rounded-md border-l-4 border-primary/50 bg-muted/30 p-4',
          className
        )}
      >
        <div className="flex items-start gap-3">
          <Shield className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <div className="flex-1 space-y-2">
            <h3 className="text-sm font-semibold text-foreground">
              Hard to copy because
            </h3>
            <ul className="space-y-1.5">
              {whyWontFollow.map((reason, index) => (
                <li
                  key={index}
                  className="flex items-start gap-2 text-sm text-foreground leading-relaxed"
                >
                  <span className="text-primary mt-1 shrink-0">·</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    )
  }

  // Show fallback message
  return (
    <div
      className={cn(
        'rounded-md border-l-4 border-primary/50 bg-muted/30 p-4',
        className
      )}
    >
      <div className="flex items-start gap-3">
        <Shield className="h-5 w-5 shrink-0 text-primary mt-0.5" />
        <div className="flex-1 space-y-2">
          <h3 className="text-sm font-semibold text-foreground">
            Hard to copy because
          </h3>
          <p className="text-sm text-foreground leading-relaxed">
            {fallbackMessage}
          </p>
        </div>
      </div>
    </div>
  )
}

