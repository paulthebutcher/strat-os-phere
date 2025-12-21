'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'

interface ExtractedValues {
  market?: string
  targetCustomer?: string
  goal?: string
  constraints?: string
  nonGoals?: string
}

interface PasteExtractionProps {
  onExtract: (values: ExtractedValues) => void
}

export function PasteExtraction({ onExtract }: PasteExtractionProps) {
  const [pasteText, setPasteText] = useState('')
  const [isExtracting, setIsExtracting] = useState(false)
  const [extracted, setExtracted] = useState<ExtractedValues | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleExtract() {
    if (!pasteText.trim()) return

    setIsExtracting(true)
    setError(null)

    try {
      const response = await fetch('/api/projects/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pasteText }),
      })

      if (!response.ok) {
        throw new Error('Extraction failed')
      }

      const data = await response.json()
      setExtracted(data)
      onExtract(data)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to extract information'
      )
    } finally {
      setIsExtracting(false)
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <label
          htmlFor="paste-text"
          className="text-sm font-semibold text-foreground"
        >
          Paste context (optional)
        </label>
        <p className="text-xs text-muted-foreground mt-1 mb-2">
          Paste notes, docs, PRDs, or research summaries. We'll extract key
          details as suggestions.
        </p>
        <Textarea
          id="paste-text"
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="Paste any relevant context..."
          rows={4}
          className="font-mono text-sm"
          maxLength={10000}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-muted-foreground">
            {pasteText.length}/10,000 characters
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleExtract}
            disabled={!pasteText.trim() || isExtracting}
          >
            {isExtracting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin mr-2" />
                Extracting...
              </>
            ) : (
              'Extract'
            )}
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2">
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        </div>
      )}

      {extracted && (
        <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">
            Extracted suggestions (review and edit):
          </p>
          <div className="space-y-1 text-xs text-muted-foreground">
            {extracted.market && <p>• Market: {extracted.market}</p>}
            {extracted.targetCustomer && (
              <p>• Target customer: {extracted.targetCustomer}</p>
            )}
            {extracted.goal && <p>• Business goal: {extracted.goal}</p>}
            {extracted.constraints && (
              <p>• Constraints: {extracted.constraints}</p>
            )}
            {extracted.nonGoals && (
              <p>• Non-goals: {extracted.nonGoals}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

