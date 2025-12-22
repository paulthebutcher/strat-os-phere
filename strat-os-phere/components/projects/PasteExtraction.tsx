'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Collapsible } from '@/components/ui/collapsible'
import {
  extractFromPaste,
  generateProposals,
  type ExtractedFields,
  type ExtractionProposal,
} from './pasteExtract'

interface ExtractedValues {
  market?: string
  targetCustomer?: string
  goal?: string
  constraints?: string
  nonGoals?: string
  product?: string
  geography?: string
}

interface PasteExtractionProps {
  onExtract: (values: ExtractedValues) => void
  currentValues?: Partial<{
    marketCategory: string
    targetCustomer: string
    goal: string
    primaryConstraint: string
    explicitNonGoals: string
    product: string
    geography: string
  }>
}

export function PasteExtraction({
  onExtract,
  currentValues = {},
}: PasteExtractionProps) {
  const [pasteText, setPasteText] = useState('')
  const [proposals, setProposals] = useState<ExtractionProposal[]>([])
  const [selectedProposals, setSelectedProposals] = useState<
    Set<keyof ExtractedFields>
  >(new Set())
  const [showPreview, setShowPreview] = useState(false)

  function handleExtract() {
    if (!pasteText.trim()) return

    const extracted = extractFromPaste(pasteText)
    const currentFormValues: Partial<Record<keyof ExtractedFields, string>> = {
      market: currentValues.marketCategory,
      targetCustomer: currentValues.targetCustomer,
      goal: currentValues.goal,
      primaryConstraint: currentValues.primaryConstraint,
      explicitNonGoals: currentValues.explicitNonGoals,
      product: currentValues.product,
      geography: currentValues.geography,
    }

    const newProposals = generateProposals(extracted, currentFormValues)
    setProposals(newProposals)
    // Auto-select all proposals by default (if destination is empty)
    setSelectedProposals(
      new Set(newProposals.map((p) => p.field))
    )
    setShowPreview(true)
  }

  function handleApply() {
    const valuesToApply: ExtractedValues = {}
    proposals.forEach((proposal) => {
      if (selectedProposals.has(proposal.field)) {
        switch (proposal.field) {
          case 'market':
            valuesToApply.market = proposal.value
            break
          case 'targetCustomer':
            valuesToApply.targetCustomer = proposal.value
            break
          case 'goal':
            valuesToApply.goal = proposal.value
            break
          case 'primaryConstraint':
            valuesToApply.constraints = proposal.value
            break
          case 'explicitNonGoals':
            valuesToApply.nonGoals = proposal.value
            break
          case 'product':
            valuesToApply.product = proposal.value
            break
          case 'geography':
            valuesToApply.geography = proposal.value
            break
        }
      }
    })
    onExtract(valuesToApply)
    setShowPreview(false)
    setPasteText('')
    setProposals([])
    setSelectedProposals(new Set())
  }

  function handleClear() {
    setPasteText('')
    setProposals([])
    setSelectedProposals(new Set())
    setShowPreview(false)
  }

  function toggleProposal(field: keyof ExtractedFields) {
    const newSelected = new Set(selectedProposals)
    if (newSelected.has(field)) {
      newSelected.delete(field)
    } else {
      newSelected.add(field)
    }
    setSelectedProposals(newSelected)
  }

  return (
    <Collapsible
      title="Paste anything (optional)"
      defaultOpen={false}
      className="border border-border rounded-lg p-4 bg-muted/30"
    >
      <div className="space-y-3 pt-2">
        <div>
          <Textarea
            id="paste-text"
            value={pasteText}
            onChange={(e) => setPasteText(e.target.value)}
            placeholder="Paste notes, doc excerpts, bullet points, links, or a rough description. Plinth will extract market, customer, goal, and constraints."
            rows={5}
            className="font-mono text-sm min-h-[140px]"
            maxLength={10000}
          />
          <div className="flex items-center justify-between mt-2">
            <p className="text-xs text-muted-foreground">
              {pasteText.length}/10,000 characters
            </p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExtract}
                disabled={!pasteText.trim()}
              >
                Extract fields
              </Button>
              {pasteText && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                >
                  Clear
                </Button>
              )}
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Don't paste confidential or proprietary info.
          </p>
        </div>

        {showPreview && proposals.length > 0 && (
          <div className="rounded-lg border border-border bg-background p-4 space-y-3">
            <p className="text-xs font-semibold text-foreground">
              Preview changes
            </p>
            <div className="space-y-2">
              {proposals.map((proposal) => (
                <label
                  key={proposal.field}
                  className="flex items-start gap-2 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={selectedProposals.has(proposal.field)}
                    onChange={() => toggleProposal(proposal.field)}
                    className="mt-1 h-4 w-4 border-border text-primary focus:ring-2 focus:ring-ring"
                  />
                  <div className="flex-1">
                    <div className="text-xs font-medium text-foreground">
                      {proposal.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {proposal.value}
                    </div>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                variant="default"
                size="sm"
                onClick={handleApply}
                disabled={selectedProposals.size === 0}
              >
                Apply selected
              </Button>
            </div>
          </div>
        )}

        {showPreview && proposals.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/50 p-3">
            <p className="text-xs text-muted-foreground">
              No new fields found to extract, or all fields are already filled.
            </p>
          </div>
        )}
      </div>
    </Collapsible>
  )
}

