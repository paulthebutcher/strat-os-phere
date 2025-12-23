'use client'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface AnalysisContextFormProps {
  companyName: string
  decision: string
  market: string
  notes?: string
  onCompanyNameChange: (value: string) => void
  onDecisionChange: (value: string) => void
  onMarketChange: (value: string) => void
  onNotesChange?: (value: string) => void
}

export function AnalysisContextForm({
  companyName,
  decision,
  market,
  notes = '',
  onCompanyNameChange,
  onDecisionChange,
  onMarketChange,
  onNotesChange,
}: AnalysisContextFormProps) {
  return (
    <SurfaceCard className="p-6 md:p-8 shadow-md">
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2 tracking-tight">
            Describe your situation
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            Start with the context for your analysis. We'll help you gather evidence and identify opportunities.
          </p>
        </div>

        {/* Company or product name */}
        <div className="space-y-2">
          <label
            htmlFor="companyName"
            className="text-sm font-semibold text-foreground"
          >
            Company or product name
            <span className="text-destructive ml-1">*</span>
          </label>
          <Input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="e.g. monday.com, Asana, PagerDuty"
            required
            className="text-base"
          />
        </div>

        {/* Decision */}
        <div className="space-y-2">
          <label
            htmlFor="decision"
            className="text-sm font-semibold text-foreground"
          >
            What decision are you making?
            <span className="text-destructive ml-1">*</span>
          </label>
          <Textarea
            id="decision"
            value={decision}
            onChange={(e) => onDecisionChange(e.target.value)}
            placeholder="e.g., Which segment should we enter? What should we build next? Why are we losing deals?"
            rows={3}
            required
            className="text-base"
          />
        </div>

        {/* Market / category */}
        <div className="space-y-2">
          <label
            htmlFor="market"
            className="text-sm font-semibold text-foreground"
          >
            Market / category
            <span className="text-destructive ml-1">*</span>
          </label>
          <Input
            id="market"
            type="text"
            value={market}
            onChange={(e) => onMarketChange(e.target.value)}
            placeholder="e.g. Project management software, Incident management platforms"
            required
            className="text-base"
          />
        </div>

        {/* Optional notes */}
        {onNotesChange && (
          <div className="space-y-2">
            <label
              htmlFor="notes"
              className="text-sm font-semibold text-foreground"
            >
              Notes / constraints
              <span className="text-muted-foreground font-normal ml-1">
                (optional)
              </span>
            </label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => onNotesChange(e.target.value)}
              placeholder="Any additional context, constraints, or considerations..."
              rows={2}
              className="text-sm"
            />
          </div>
        )}
      </div>
    </SurfaceCard>
  )
}

