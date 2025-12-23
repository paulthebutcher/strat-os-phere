'use client'

import { useState, useEffect } from 'react'
import { Plus, X, ArrowLeft, Search, CheckCircle2, Circle, Loader2 } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type {
  WizardState,
  SelectedCompetitor,
} from '@/lib/onboarding/types'
import { normalizeUrl } from '@/lib/url/normalizeUrl'
// Competitor candidate type (compatible with API response)
type CompetitorCandidate = {
  name: string
  website: string
  domain: string
  confidence: 'high' | 'medium' | 'low'
}

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

  // Search state
  const [searchQuery, setSearchQuery] = useState(state.primaryCompanyName || '')
  const [searchResults, setSearchResults] = useState<CompetitorCandidate[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedCandidateDomains, setSelectedCandidateDomains] = useState<Set<string>>(
    new Set(selectedCompetitors.map(c => {
      try {
        const url = new URL(c.url)
        return url.hostname.replace(/^www\./, '')
      } catch {
        return ''
      }
    }).filter(Boolean))
  )

  const REQUIRED_COMPETITORS = 3
  const hasRequiredCompetitors = selectedCompetitors.length >= REQUIRED_COMPETITORS

  // Search for competitors
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a company name to search')
      return
    }

    setIsSearching(true)
    setError(null)

    try {
      const response = await fetch('/api/competitors/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
        }),
      })

      const data = await response.json()

      if (data.ok && Array.isArray(data.results)) {
        // Convert to old format for compatibility
        setSearchResults(data.results.map((r: any) => ({
          name: r.name,
          website: r.website,
          domain: r.domain,
          confidence: 'medium' as const, // Default confidence
        })))
      } else {
        setSearchResults([])
        if (data.error) {
          setError(data.error)
        }
      }
    } catch (err) {
      console.error('[WizardStep2] Search failed:', err)
      setError('Failed to search for competitors. You can add them manually.')
      setSearchResults([])
    } finally {
      setIsSearching(false)
    }
  }

  // Auto-search on mount if we have a company name and no results yet
  useEffect(() => {
    if (state.primaryCompanyName && searchResults.length === 0 && !isSearching) {
      const performSearch = async () => {
        setIsSearching(true)
        setError(null)

        try {
          const response = await fetch('/api/competitors/suggest', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: state.primaryCompanyName.trim(),
            }),
          })

          const data = await response.json()

          if (data.ok && Array.isArray(data.results)) {
            // Convert to old format for compatibility
            setSearchResults(data.results.map((r: any) => ({
              name: r.name,
              website: r.website,
              domain: r.domain,
              confidence: 'medium' as const, // Default confidence
            })))
          } else {
            setSearchResults([])
          }
        } catch (err) {
          console.error('[WizardStep2] Auto-search failed:', err)
          setSearchResults([])
        } finally {
          setIsSearching(false)
        }
      }

      performSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const handleToggleCandidate = (candidate: CompetitorCandidate) => {
    const isSelected = selectedCandidateDomains.has(candidate.domain)

    if (isSelected) {
      // Remove candidate
      const updatedCompetitors = selectedCompetitors.filter(
        (c) => {
          try {
            const url = new URL(c.url)
            return url.hostname.replace(/^www\./, '') !== candidate.domain
          } catch {
            return true
          }
        }
      )
      const updatedDomains = new Set(selectedCandidateDomains)
      updatedDomains.delete(candidate.domain)

      setSelectedCompetitors(updatedCompetitors)
      setSelectedCandidateDomains(updatedDomains)
    } else {
      // Add candidate
      const competitor: SelectedCompetitor = {
        name: candidate.name,
        url: candidate.website,
      }
      const updatedCompetitors = [...selectedCompetitors, competitor]
      const updatedDomains = new Set(selectedCandidateDomains)
      updatedDomains.add(candidate.domain)

      setSelectedCompetitors(updatedCompetitors)
      setSelectedCandidateDomains(updatedDomains)
    }
  }

  const handleRemoveCompetitor = (url: string) => {
    const updated = selectedCompetitors.filter((c) => c.url !== url)
    setSelectedCompetitors(updated)

    // Extract domain and remove from selected domains
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace(/^www\./, '')
      const updatedDomains = new Set(selectedCandidateDomains)
      updatedDomains.delete(domain)
      setSelectedCandidateDomains(updatedDomains)
    } catch {
      // Ignore URL parsing errors
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

    const competitor: SelectedCompetitor = { name: newCompetitorName.trim(), url }
    const updated = [...selectedCompetitors, competitor]
    setSelectedCompetitors(updated)

    // Extract domain for tracking
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace(/^www\./, '')
      const updatedDomains = new Set(selectedCandidateDomains)
      updatedDomains.add(domain)
      setSelectedCandidateDomains(updatedDomains)
    } catch {
      // Ignore URL parsing errors
    }

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
    onComplete({
      selectedCompetitors,
    })
  }

  const confidenceColors = {
    high: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-400',
    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
    low: 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-400',
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

          {/* Search competitors */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch()
                  }
                }}
                placeholder="Search for competitors (e.g., PagerDuty)"
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                variant="outline"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4" />
                )}
                <span className="ml-2">Search</span>
              </Button>
            </div>
          </div>

          {/* Search results */}
          {isSearching && (
            <div className="py-4 text-sm text-muted-foreground text-center">
              Searching for competitors...
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Search results:
              </p>
              <div className="border border-border rounded-lg divide-y divide-border">
                {searchResults.map((candidate) => {
                  const isSelected = selectedCandidateDomains.has(candidate.domain)
                  return (
                    <div
                      key={candidate.domain}
                      className="flex items-center gap-3 p-3 hover:bg-muted/30 transition-colors cursor-pointer"
                      onClick={() => handleToggleCandidate(candidate)}
                    >
                      <div className="flex-shrink-0">
                        {isSelected ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>

                      {/* Company info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="text-sm font-medium text-foreground">
                            {candidate.name}
                          </div>
                          <Badge
                            className={`text-xs ${confidenceColors[candidate.confidence]}`}
                          >
                            {candidate.confidence}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground truncate">
                          {candidate.domain}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {!isSearching && searchResults.length === 0 && searchQuery && (
            <div className="py-4 text-sm text-muted-foreground text-center">
              No competitors found. Try a different search or add them manually.
            </div>
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
                      onClick={() => handleRemoveCompetitor(competitor.url)}
                      className="ml-2"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add competitor manually */}
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
              Add competitor manually
            </Button>
          )}

          {selectedCompetitors.length < REQUIRED_COMPETITORS && (
            <p className="text-xs text-destructive">
              {REQUIRED_COMPETITORS} competitors are required (currently {selectedCompetitors.length})
            </p>
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
