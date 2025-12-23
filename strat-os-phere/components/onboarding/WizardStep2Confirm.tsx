'use client'

import { useState } from 'react'
import { Plus, X, ArrowLeft } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type {
  WizardState,
  SuggestedCompetitor,
  SelectedCompetitor,
} from '@/lib/onboarding/types'
import { normalizeUrl } from '@/lib/url/normalizeUrl'

interface WizardStep2ConfirmProps {
  state: WizardState
  onBack: () => void
  onComplete: (state: Partial<WizardState>) => void
}

export function WizardStep2Confirm({
  state,
  onBack,
  onComplete,
}: WizardStep2ConfirmProps) {
  const [selectedCompetitors, setSelectedCompetitors] = useState<SelectedCompetitor[]>(
    state.selectedCompetitors
  )
  const [newCompetitorName, setNewCompetitorName] = useState('')
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('')
  const [showAddCompetitor, setShowAddCompetitor] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const REQUIRED_COMPETITORS = 3
  const hasRequiredCompetitors = selectedCompetitors.length >= REQUIRED_COMPETITORS

  const handleCompetitorToggle = (competitor: SuggestedCompetitor) => {
    if (!competitor.url) return

    const isSelected = selectedCompetitors.some(
      (c) => c.url === competitor.url
    )

    if (isSelected) {
      setSelectedCompetitors(
        selectedCompetitors.filter((c) => c.url !== competitor.url)
      )
    } else {
      setSelectedCompetitors([
        ...selectedCompetitors,
        { name: competitor.name, url: competitor.url },
      ])
    }
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

    setSelectedCompetitors([
      ...selectedCompetitors,
      { name: newCompetitorName.trim(), url },
    ])
    setNewCompetitorName('')
    setNewCompetitorUrl('')
    setShowAddCompetitor(false)
    setError(null)
  }

  const handleContinue = () => {
    if (!hasRequiredCompetitors) {
      setError(`Please add ${REQUIRED_COMPETITORS} competitors (currently ${selectedCompetitors.length})`)
      return
    }

    // Update state and continue to Step 3
    // Preserve sources and evidenceWindowDays from state, only update selectedCompetitors
    onComplete({
      selectedCompetitors,
    })
  }

  return (
    <div className="space-y-6">
      {/* Edit context link */}
      <div className="flex items-center gap-2 text-sm">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Edit context</span>
        </button>
        <span className="text-muted-foreground">•</span>
        <span className="text-muted-foreground text-xs">
          Adjust your description if needed
        </span>
      </div>

      {/* Competitors section */}
      <SurfaceCard className="p-6 shadow-md">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Add competitors
            </h3>
            <p className="text-sm text-muted-foreground">
              Add {REQUIRED_COMPETITORS}–5 competitors you're often compared against. We'll collect evidence later.
            </p>
            <div className="mt-2 text-xs font-medium text-foreground">
              {selectedCompetitors.length} competitor{selectedCompetitors.length !== 1 ? 's' : ''} added (minimum {REQUIRED_COMPETITORS})
            </div>
          </div>

          {/* Suggested competitors */}
          {state.suggestedCompetitors.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {state.suggestedCompetitors.map((competitor, index) => {
                const isSelected = selectedCompetitors.some(
                  (c) => c.url === competitor.url
                )
                return (
                  <label
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-indigo-400 bg-indigo-50/30 dark:bg-indigo-950/20'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleCompetitorToggle(competitor)}
                      disabled={!competitor.url}
                      className="mt-1 h-4 w-4 rounded border-border text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-foreground">
                        {competitor.name}
                      </div>
                      {competitor.domain && (
                        <div className="text-xs text-muted-foreground">
                          {competitor.domain}
                        </div>
                      )}
                      {competitor.confidence && (
                        <Badge
                          variant={
                            competitor.confidence === 'high'
                              ? 'success'
                              : competitor.confidence === 'medium'
                              ? 'info'
                              : 'muted'
                          }
                          className="mt-1 text-xs"
                        >
                          {competitor.confidence}
                        </Badge>
                      )}
                    </div>
                  </label>
                )
              })}
            </div>
          )}

          {/* Add competitor */}
          {showAddCompetitor ? (
            <div className="space-y-2 p-3 rounded-lg border border-border">
              <Input
                type="text"
                value={newCompetitorName}
                onChange={(e) => setNewCompetitorName(e.target.value)}
                placeholder="Competitor name"
                className="w-full"
                required
              />
              <Input
                type="text"
                value={newCompetitorUrl}
                onChange={(e) => setNewCompetitorUrl(e.target.value)}
                placeholder="Website (optional but recommended)"
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

          {selectedCompetitors.length < REQUIRED_COMPETITORS && (
            <p className="text-xs text-destructive">
              {REQUIRED_COMPETITORS} competitors are required (currently {selectedCompetitors.length})
            </p>
          )}

          {/* Selected competitors list */}
          {selectedCompetitors.length > 0 && (
            <div className="pt-2 border-t border-border">
              <p className="text-xs font-medium text-foreground mb-2">
                Selected competitors:
              </p>
              <div className="space-y-2">
                {selectedCompetitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border border-border bg-muted/30"
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
                      onClick={() => {
                        const updated = selectedCompetitors.filter((_, i) => i !== index)
                        setSelectedCompetitors(updated)
                      }}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </SurfaceCard>

      {/* Error */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
        >
          Back
        </Button>
        <div className="flex items-center gap-4">
          {!hasRequiredCompetitors && (
            <p className="text-xs text-muted-foreground">
              {REQUIRED_COMPETITORS} competitors required (currently {selectedCompetitors.length})
            </p>
          )}
          <Button
            type="button"
            onClick={handleContinue}
            disabled={!hasRequiredCompetitors}
            variant="brand"
            size="lg"
          >
            Continue → Details
          </Button>
        </div>
      </div>
    </div>
  )
}

