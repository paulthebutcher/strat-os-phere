'use client'

import { useState } from 'react'
import { Plus, X } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { TryDraft } from '@/lib/tryDraft'
import { normalizeUrl } from '@/lib/url/normalizeUrl'

interface TryStep2ConfirmProps {
  draft: TryDraft
  onBack: () => void
  onSeeResults: () => void
  onUpdateDraft: (updates: Partial<TryDraft>) => void
}

// Pre-defined competitor examples
const EXAMPLE_COMPETITORS = [
  { name: 'Monday', url: 'https://monday.com' },
  { name: 'PagerDuty', url: 'https://pagerduty.com' },
  { name: 'Greenhouse', url: 'https://greenhouse.io' },
]

export function TryStep2Confirm({
  draft,
  onBack,
  onSeeResults,
  onUpdateDraft,
}: TryStep2ConfirmProps) {
  const [selectedCompetitors, setSelectedCompetitors] = useState(
    draft.selectedCompetitors || []
  )
  const [newCompetitorName, setNewCompetitorName] = useState('')
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('')
  const [showAddCompetitor, setShowAddCompetitor] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleAddExampleCompetitor = (competitor: {
    name: string
    url: string
  }) => {
    const isAlreadyAdded = selectedCompetitors.some(
      (c) => c.url === competitor.url
    )
    if (isAlreadyAdded) {
      return
    }

    const updated = [...selectedCompetitors, competitor]
    setSelectedCompetitors(updated)
    onUpdateDraft({ selectedCompetitors: updated })
  }

  const handleRemoveCompetitor = (url: string) => {
    const updated = selectedCompetitors.filter((c) => c.url !== url)
    setSelectedCompetitors(updated)
    onUpdateDraft({ selectedCompetitors: updated })
  }

  const handleAddCompetitor = () => {
    if (!newCompetitorName.trim()) {
      setError('Please enter a competitor name')
      return
    }

    let url = newCompetitorUrl.trim()
    if (url) {
      const normalized = normalizeUrl(url)
      if (!normalized.ok) {
        setError(`Invalid URL: ${normalized.reason}`)
        return
      }
      url = normalized.url
    } else {
      // If no URL, create a placeholder
      url = `https://${newCompetitorName.toLowerCase().replace(/\s+/g, '')}.com`
    }

    const competitor = { name: newCompetitorName.trim(), url }
    const updated = [...selectedCompetitors, competitor]
    setSelectedCompetitors(updated)
    onUpdateDraft({ selectedCompetitors: updated })
    setNewCompetitorName('')
    setNewCompetitorUrl('')
    setShowAddCompetitor(false)
    setError(null)
  }

  const canSeeResults = selectedCompetitors.length >= 1

  return (
    <div className="space-y-6">
      {/* Summary card */}
      <SurfaceCard className="p-6 shadow-md">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            Analysis summary
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">We'll analyze: </span>
              <span className="font-medium text-foreground">
                {draft.primaryCompanyName}
              </span>
            </div>
            {draft.contextText && (
              <div>
                <span className="text-muted-foreground">Context: </span>
                <span className="text-foreground">{draft.contextText}</span>
              </div>
            )}
            {draft.marketCategory && (
              <div>
                <span className="text-muted-foreground">Market: </span>
                <span className="text-foreground">{draft.marketCategory}</span>
              </div>
            )}
            {draft.targetCustomer && (
              <div>
                <span className="text-muted-foreground">For: </span>
                <span className="text-foreground">{draft.targetCustomer}</span>
              </div>
            )}
          </div>
        </div>
      </SurfaceCard>

      {/* Competitors section */}
      <SurfaceCard className="p-6 shadow-md">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Competitors
            </h3>
            <p className="text-sm text-muted-foreground">
              Add competitors to compare. You can add more after signing in.
            </p>
          </div>

          {/* Selected competitors */}
          {selectedCompetitors.length > 0 && (
            <div className="space-y-2">
              {selectedCompetitors.map((competitor, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground">
                      {competitor.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {competitor.url}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveCompetitor(competitor.url)}
                    className="ml-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Example competitors */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">
              Quick add examples:
            </p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_COMPETITORS.map((example) => {
                const isAdded = selectedCompetitors.some(
                  (c) => c.url === example.url
                )
                return (
                  <Button
                    key={example.url}
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddExampleCompetitor(example)}
                    disabled={isAdded}
                  >
                    {isAdded ? (
                      <>
                        <span className="mr-1">✓</span>
                        {example.name}
                      </>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        {example.name}
                      </>
                    )}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Add competitor */}
          {showAddCompetitor ? (
            <div className="space-y-2 p-3 rounded-lg border border-border">
              <Input
                type="text"
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
                placeholder="Competitor name"
                className="w-full"
              />
              <Input
                type="text"
                value={newCompetitorUrl}
                onChange={(e) => setNewCompetitorUrl(e.target.value)}
                placeholder="URL (optional)"
                className="w-full"
              />
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCompetitor}
                  disabled={!newCompetitorName.trim()}
                >
                  Add
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAddCompetitor(false)
                    setNewCompetitorName('')
                    setNewCompetitorUrl('')
                    setError(null)
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddCompetitor(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add competitor
            </Button>
          )}

          {selectedCompetitors.length === 0 && (
            <p className="text-xs text-muted-foreground">
              Add at least one competitor to continue. You can add more after
              signing in.
            </p>
          )}

          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}
        </div>
      </SurfaceCard>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onSeeResults}
            disabled={!canSeeResults}
          >
            Skip competitors
          </Button>
          <Button
            type="button"
            onClick={onSeeResults}
            disabled={!canSeeResults}
            size="lg"
            variant="brand"
          >
            See Results
          </Button>
        </div>
      </div>
    </div>
  )
}

