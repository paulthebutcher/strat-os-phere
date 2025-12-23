'use client'

import { useState } from 'react'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

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
  // Rotating placeholder examples for the magic input
  const placeholderExamples = [
    "We're building for IT ops—how should we differentiate vs PagerDuty?",
    'Which segment should we enter first, and why?',
    'Why are we losing deals to Asana?',
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

  // Handle magic input - map to decision field primarily, but try to extract company
  const handleMagicInputChange = (value: string) => {
    // Update decision field (primary mapping)
    onDecisionChange(value)
    
    // Try to extract company name if not already set
    const extractedCompany = extractCompanyFromText(value)
    if (extractedCompany && !companyName.trim()) {
      onCompanyNameChange(extractedCompany)
    }
  }

  // Use decision as the primary "magic input" value
  const magicInputValue = decision

  return (
    <SurfaceCard className="p-6 md:p-8 shadow-md border-t-4 border-t-primary/20">
      <div className="space-y-6">
        {/* Magic input - primary field */}
        <div className="space-y-2">
          <label
            htmlFor="magicInput"
            className="text-sm font-semibold text-foreground"
          >
            What are you trying to decide?
            <span className="text-destructive ml-1">*</span>
          </label>
          <Textarea
            id="magicInput"
            value={magicInputValue}
            onChange={(e) => handleMagicInputChange(e.target.value)}
            placeholder={placeholderExamples[placeholderIndex]}
            rows={3}
            required
            className="text-base"
            onFocus={() => {
              // Rotate placeholder on focus
              setPlaceholderIndex((prev) => (prev + 1) % placeholderExamples.length)
            }}
          />
          <p className="text-xs text-muted-foreground">
            Write it like you'd text a teammate. We'll infer what to research.
          </p>
        </div>

        {/* Progressive disclosure: Add details accordion */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="details" className="border-none">
            <AccordionTrigger className="py-2 hover:no-underline text-sm font-medium text-foreground">
              Add details (recommended)
            </AccordionTrigger>
            <AccordionContent className="pt-4 pb-0 space-y-4">
              {/* Company or product name */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="companyName"
                    className="text-sm font-medium text-foreground"
                  >
                    Company or product name
                    <span className="text-destructive ml-1">*</span>
                  </label>
                  <span className="text-xs text-muted-foreground">Helps us find official sources</span>
                </div>
                <Input
                  id="companyName"
                  type="text"
                  value={companyName}
                  onChange={(e) => onCompanyNameChange(e.target.value)}
                  placeholder="e.g. monday.com, Asana, PagerDuty"
                  required
                  className="text-sm"
                />
              </div>

              {/* Market / category */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="market"
                    className="text-sm font-medium text-foreground"
                  >
                    Market / category
                  </label>
                  <span className="text-xs text-muted-foreground">Improves competitor relevance</span>
                </div>
                <Input
                  id="market"
                  type="text"
                  value={market}
                  onChange={(e) => onMarketChange(e.target.value)}
                  placeholder="e.g. Project management software, Incident management platforms"
                  className="text-sm"
                />
              </div>

              {/* Notes / constraints */}
              {onNotesChange && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="notes"
                      className="text-sm font-medium text-foreground"
                    >
                      Notes / constraints
                    </label>
                    <span className="text-xs text-muted-foreground">Constraints we should respect</span>
                  </div>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => onNotesChange(e.target.value)}
                    placeholder="Any additional context, constraints, or considerations..."
                    rows={3}
                    className="text-sm"
                  />
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </SurfaceCard>
  )
}

