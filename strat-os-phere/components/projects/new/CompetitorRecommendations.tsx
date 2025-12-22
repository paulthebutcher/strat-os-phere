'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { CheckCircle2, X, Plus, Check, XCircle } from 'lucide-react'
import type { CompetitorRecommendation } from '@/lib/projects/new/types'

interface CompetitorRecommendationsProps {
  recommendations: CompetitorRecommendation[]
  onConfirm: (selected: Array<{ name: string; url: string }>) => Promise<void>
  onAddManual?: () => void
  loading?: boolean
}

/**
 * What we'll scrape checklist (informational only)
 */
const SCRAPE_TARGETS = [
  { label: 'Pricing', checked: true },
  { label: 'Docs', checked: true },
  { label: 'Changelog', checked: true },
  { label: 'Jobs', checked: true },
  { label: 'Reviews', checked: true },
]

export function CompetitorRecommendations({
  recommendations,
  onConfirm,
  onAddManual,
  loading = false,
}: CompetitorRecommendationsProps) {
  const [editableRecs, setEditableRecs] = useState<
    Array<CompetitorRecommendation & { selected: boolean; editing?: boolean }>
  >(
    recommendations.map((rec) => ({
      ...rec,
      selected: !!rec.url, // Default to selected if URL is present
    }))
  )

  function handleToggle(index: number) {
    setEditableRecs((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], selected: !updated[index].selected }
      return updated
    })
  }

  function handleEdit(index: number) {
    setEditableRecs((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], editing: true }
      return updated
    })
  }

  function handleSaveEdit(index: number) {
    setEditableRecs((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], editing: false }
      return updated
    })
  }

  function handleUpdateField(
    index: number,
    field: 'name' | 'url' | 'reason',
    value: string
  ) {
    setEditableRecs((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function handleRemove(index: number) {
    setEditableRecs((prev) => prev.filter((_, i) => i !== index))
  }

  async function handleConfirm() {
    const selected = editableRecs
      .filter((rec) => rec.selected && rec.url)
      .map((rec) => ({
        name: rec.name.trim(),
        url: rec.url!,
      }))

    if (selected.length === 0) {
      // This should be handled by the parent, but we can show a message
      return
    }

    await onConfirm(selected)
  }

  const selectedWithUrls = editableRecs.filter(
    (rec) => rec.selected && rec.url
  )

  const canConfirm = selectedWithUrls.length > 0 && !loading

  if (editableRecs.length === 0) {
    return (
      <SurfaceCard className="p-6">
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            No confident competitor suggestions yet.
          </p>
          {onAddManual && (
            <Button variant="outline" onClick={onAddManual} size="sm">
              Add a competitor URL manually
            </Button>
          )}
        </div>
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard className="p-6 space-y-6">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">
          Recommended competitors
        </h3>
        <p className="text-xs text-muted-foreground">
          Review and edit the recommendations below. Only competitors with URLs
          can be scraped automatically.
        </p>
      </div>

      {/* What we'll scrape checklist */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-foreground">
          What we'll scrape:
        </p>
        <div className="flex flex-wrap gap-3">
          {SCRAPE_TARGETS.map((target) => (
            <div
              key={target.label}
              className="flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{target.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommendations list */}
      <div className="space-y-3">
        {editableRecs.map((rec, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 space-y-3 ${
              rec.selected
                ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50/30 dark:bg-indigo-950/20'
                : 'border-border bg-background'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={rec.selected}
                onChange={() => handleToggle(index)}
                className="mt-1 h-4 w-4 border-border text-primary focus:ring-2 focus:ring-ring"
                disabled={loading}
              />
              <div className="flex-1 space-y-2">
                {rec.editing ? (
                  <div className="space-y-2">
                    <Input
                      value={rec.name}
                      onChange={(e) =>
                        handleUpdateField(index, 'name', e.target.value)
                      }
                      placeholder="Competitor name"
                      className="text-sm"
                    />
                    <Input
                      value={rec.url || ''}
                      onChange={(e) =>
                        handleUpdateField(index, 'url', e.target.value)
                      }
                      placeholder="https://example.com"
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSaveEdit(index)}
                      >
                        <Check className="h-3.5 w-3.5 mr-1" />
                        Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-foreground">
                            {rec.name}
                          </p>
                          {rec.confidence && (
                            <span
                              className={`text-xs px-1.5 py-0.5 rounded ${
                                rec.confidence === 'high'
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                  : rec.confidence === 'medium'
                                  ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400'
                              }`}
                            >
                              {rec.confidence}
                            </span>
                          )}
                        </div>
                        {rec.url && (
                          <p className="text-xs text-muted-foreground mt-1 break-all">
                            {rec.url}
                          </p>
                        )}
                        {!rec.url && (
                          <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                            No URL — add one to enable scraping
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1.5">
                          {rec.reason}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(index)}
                          disabled={loading}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemove(index)}
                          disabled={loading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add manual button */}
      {onAddManual && (
        <Button
          variant="outline"
          onClick={onAddManual}
          disabled={loading}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add another URL manually
        </Button>
      )}

      {/* Confirm button */}
      <div className="space-y-2 pt-2 border-t border-border">
        {selectedWithUrls.length === 0 && (
          <p className="text-xs text-destructive">
            Add at least one competitor URL to scrape.
          </p>
        )}
        <Button
          onClick={handleConfirm}
          disabled={!canConfirm}
          className="w-full"
        >
          {loading
            ? 'Scraping...'
            : `Confirm & scrape ${selectedWithUrls.length} competitor${selectedWithUrls.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </SurfaceCard>
  )
}

