'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { extractFromPaste, type FormValues } from '@/lib/ui/extractFromPaste'

interface ExtractedValues {
  name?: string
  marketCategory?: string
  targetCustomer?: string
  businessGoal?: string
  product?: string
  geography?: string
  constraints?: string
  nonGoals?: string
}

interface PasteExtractionProps {
  onExtract: (values: ExtractedValues) => void
  currentValues?: Partial<{
    name: string
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

  function handleExtract() {
    if (!pasteText.trim()) return

    const extracted = extractFromPaste(pasteText)
    const valuesToApply: ExtractedValues = {}

    // Only apply if the field is empty or very short
    if (extracted.name && (!currentValues.name || currentValues.name.trim().length < 3)) {
      valuesToApply.name = extracted.name
    }
    if (
      extracted.marketCategory &&
      (!currentValues.marketCategory || currentValues.marketCategory.trim().length < 3)
    ) {
      valuesToApply.marketCategory = extracted.marketCategory
    }
    if (
      extracted.targetCustomer &&
      (!currentValues.targetCustomer || currentValues.targetCustomer.trim().length < 3)
    ) {
      valuesToApply.targetCustomer = extracted.targetCustomer
    }
    if (
      extracted.businessGoal &&
      (!currentValues.goal || currentValues.goal.trim().length < 3)
    ) {
      valuesToApply.businessGoal = extracted.businessGoal
    }
    if (extracted.product && (!currentValues.product || currentValues.product.trim().length < 3)) {
      valuesToApply.product = extracted.product
    }
    if (
      extracted.geography &&
      (!currentValues.geography || currentValues.geography.trim().length < 3)
    ) {
      valuesToApply.geography = extracted.geography
    }

    if (Object.keys(valuesToApply).length > 0) {
      onExtract(valuesToApply)
      setPasteText('')
    }
  }

  function handleClear() {
    setPasteText('')
  }

  return (
    <div className="space-y-3">
      <Textarea
        id="paste-text"
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        placeholder="Paste notes, doc excerpts, bullet points, or a rough description. We'll extract project name, market, customer, goal, product, and geography."
        rows={5}
        className="font-mono text-sm min-h-[140px]"
        maxLength={10000}
      />
      <div className="flex items-center justify-between">
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
      <p className="text-xs text-muted-foreground">
        Don't paste confidential or proprietary info.
      </p>
    </div>
  )
}

