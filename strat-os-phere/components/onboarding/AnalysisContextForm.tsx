'use client'

import { useState } from 'react'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Collapsible } from '@/components/ui/collapsible'

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
  const [oneLiner, setOneLiner] = useState('')
  const [showApplyHelper, setShowApplyHelper] = useState(false)

  // Rotating placeholder examples
  const placeholderExamples = [
    "We're building for IT ops—how should we differentiate vs PagerDuty?",
    'Which segment should we enter first in APAC?',
    'Why are we losing deals to monday.com?',
  ]
  const [placeholderIndex, setPlaceholderIndex] = useState(0)

  // Simple regex to detect domain-like strings
  const extractCompanyFromText = (text: string): string | null => {
    // Look for patterns like "vs CompanyName", "CompanyName.com", or standalone capitalized words
    const domainMatch = text.match(/(?:vs|versus|against)\s+([A-Z][a-zA-Z0-9]+(?:\.[a-z]+)?)/i)
    if (domainMatch) return domainMatch[1]
    
    const urlMatch = text.match(/([a-zA-Z0-9-]+\.(?:com|io|co|ai|dev))/i)
    if (urlMatch) return urlMatch[1]
    
    return null
  }

  const handleOneLinerChange = (value: string) => {
    setOneLiner(value)
    setShowApplyHelper(value.trim().length > 0)
  }

  const handleApplyToFields = () => {
    if (!oneLiner.trim()) return

    // Try to extract company name
    const extractedCompany = extractCompanyFromText(oneLiner)
    if (extractedCompany && !companyName.trim()) {
      onCompanyNameChange(extractedCompany)
    }

    // Copy one-liner to decision if empty
    if (!decision.trim()) {
      onDecisionChange(oneLiner.trim())
    }

    // Clear the one-liner after applying
    setOneLiner('')
    setShowApplyHelper(false)
  }

  return (
    <SurfaceCard className="p-6 shadow-md">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-semibold text-foreground mb-2 tracking-tight">
            Describe your situation
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Start with the context for your analysis. We'll help you gather evidence and identify opportunities.
          </p>
        </div>

        {/* One-liner starter field */}
        <div className="space-y-2">
          <label
            htmlFor="oneLiner"
            className="text-sm font-semibold text-foreground"
          >
            In one line, what are you trying to figure out?
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <div className="space-y-2">
            <Textarea
              id="oneLiner"
              value={oneLiner}
              onChange={(e) => handleOneLinerChange(e.target.value)}
              placeholder={placeholderExamples[placeholderIndex]}
              rows={2}
              className="text-base"
              onFocus={() => {
                // Rotate placeholder on focus
                setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length)
              }}
            />
            {showApplyHelper && (
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  We'll use this to pre-fill the fields below.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleApplyToFields}
                >
                  Apply to fields
                </Button>
              </div>
            )}
          </div>
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

        {/* Market / category - now optional with soft warning */}
        <div className="space-y-2">
          <label
            htmlFor="market"
            className="text-sm font-semibold text-foreground"
          >
            Market / category
            <span className="text-muted-foreground font-normal ml-1">
              (optional)
            </span>
          </label>
          <Input
            id="market"
            type="text"
            value={market}
            onChange={(e) => onMarketChange(e.target.value)}
            placeholder="e.g. Project management software, Incident management platforms"
            className="text-base"
          />
          {!market.trim() && (companyName.trim() || decision.trim()) && (
            <p className="text-xs text-muted-foreground">
              Market helps improve competitor recommendations. You can add it later.
            </p>
          )}
        </div>

        {/* Optional details - collapsed by default */}
        {onNotesChange && (
          <Collapsible
            title="Optional details"
            description="Constraints, geography, pricing, ICP"
            defaultOpen={false}
          >
            <div className="space-y-2">
              <label
                htmlFor="notes"
                className="text-sm font-semibold text-foreground"
              >
                Notes / constraints
              </label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => onNotesChange(e.target.value)}
                placeholder="Any additional context, constraints, or considerations..."
                rows={3}
                className="text-sm"
              />
            </div>
          </Collapsible>
        )}
      </div>
    </SurfaceCard>
  )
}

