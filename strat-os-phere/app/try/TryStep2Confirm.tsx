'use client'

import { useState, useEffect } from 'react'
import { Plus, X, CheckCircle2, Circle, Search } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { TryDraft } from '@/lib/tryDraft'
import { normalizeUrl } from '@/lib/url/normalizeUrl'

// Competitor candidate type from API
type CompetitorCandidate = {
  name: string
  website: string // canonical root, e.g. https://opsgenie.com
  domain: string // opsgenie.com
  confidence: 'high' | 'medium' | 'low'
}

// Generate seed URLs for evidence scraping
function generateSeedUrls(website: string, domain: string): string[] {
  const seeds: string[] = [website]
  
  // Extract base URL from website (protocol + domain)
  let baseUrl: string
  try {
    const urlObj = new URL(website)
    baseUrl = `${urlObj.protocol}//${urlObj.hostname}`
  } catch {
    // Fallback to https if parsing fails
    baseUrl = `https://${domain}`
  }
  
  // Add common vendor-owned pages (deterministic, no scraping)
  const commonPaths = ['/pricing', '/docs', '/documentation', '/security', '/changelog', '/release-notes']
  for (const path of commonPaths) {
    // Ensure path starts with /
    const normalizedPath = path.startsWith('/') ? path : `/${path}`
    seeds.push(`${baseUrl}${normalizedPath}`)
  }
  
  return seeds
}

interface TryStep2ConfirmProps {
  draft: TryDraft
  onBack: () => void
  onSeeResults: () => void
  onUpdateDraft: (updates: Partial<TryDraft>) => void
}

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
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(draft.primaryCompanyName || '')
  const [candidates, setCandidates] = useState<CompetitorCandidate[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [selectedCandidateDomains, setSelectedCandidateDomains] = useState<Set<string>>(
    new Set(selectedCompetitors.map(c => {
      try {
        const url = new URL(c.url)
        return url.hostname.replace(/^www\./, '').toLowerCase()
      } catch {
        return ''
      }
    }).filter(Boolean))
  )

  // Dev-only diagnostic logging
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Step2] Component mounted - using new competitor search API')
      if (candidates.length > 0) {
        console.log('[Step2] Candidates loaded:', {
          count: candidates.length,
          exampleDomains: candidates.slice(0, 3).map(c => c.domain),
        })
      }
    }
  }, [candidates.length])

  // Search for competitors
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a company name to search')
      return
    }

    setLoadingCandidates(true)
    setError(null)

    try {
      const response = await fetch('/api/competitors/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: searchQuery.trim(),
          market: draft.marketCategory,
          ideaOrContext: draft.contextText,
          limit: 12,
        }),
      })

      const data = await response.json()

      if (data.candidates && Array.isArray(data.candidates)) {
        setCandidates(data.candidates)

        // Dev-only diagnostics
        if (process.env.NODE_ENV === 'development') {
          console.log('[Step2] Competitor search results:', {
            query: searchQuery,
            candidateCount: data.candidates.length,
            exampleDomains: data.candidates.slice(0, 5).map((c: CompetitorCandidate) => c.domain),
            confidenceBreakdown: {
              high: data.candidates.filter((c: CompetitorCandidate) => c.confidence === 'high').length,
              medium: data.candidates.filter((c: CompetitorCandidate) => c.confidence === 'medium').length,
              low: data.candidates.filter((c: CompetitorCandidate) => c.confidence === 'low').length,
            },
          })
        }
      } else {
        setCandidates([])
        if (data.error) {
          console.log('[TryStep2] Search returned error:', data.error)
        }
      }
    } catch (err) {
      console.error('[TryStep2] Failed to search competitors:', err)
      setCandidates([])
      setError('Failed to search for competitors. You can add them manually.')
    } finally {
      setLoadingCandidates(false)
    }
  }

  // Auto-search on mount if we have a company name
  useEffect(() => {
    if (draft.primaryCompanyName && searchQuery && !loadingCandidates) {
      // Trigger search on mount with the prefilled company name
      handleSearch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run on mount

  const handleToggleCandidate = (candidate: CompetitorCandidate) => {
    const normalizedDomain = candidate.domain.toLowerCase()
    const isSelected = selectedCandidateDomains.has(normalizedDomain)
    
    if (isSelected) {
      // Remove candidate
      const updatedCompetitors = selectedCompetitors.filter(
        (c) => {
          try {
            const url = new URL(c.url)
            return url.hostname.replace(/^www\./, '').toLowerCase() !== normalizedDomain
          } catch {
            return true
          }
        }
      )
      const updatedDomains = new Set(selectedCandidateDomains)
      updatedDomains.delete(normalizedDomain)
      
      setSelectedCompetitors(updatedCompetitors)
      setSelectedCandidateDomains(updatedDomains)
      
      // Update seed URLs
      const updatedSeedUrls = (draft.evidenceSeedUrls || []).filter(
        (seed) => seed.competitorDomain.toLowerCase() !== normalizedDomain
      )
      onUpdateDraft({
        selectedCompetitors: updatedCompetitors,
        evidenceSeedUrls: updatedSeedUrls,
      })
    } else {
      // Add candidate
      const competitor = {
        name: candidate.name,
        url: candidate.website,
      }
      const updatedCompetitors = [...selectedCompetitors, competitor]
      const updatedDomains = new Set(selectedCandidateDomains)
      updatedDomains.add(normalizedDomain)
      
      setSelectedCompetitors(updatedCompetitors)
      setSelectedCandidateDomains(updatedDomains)
      
      // Generate and add seed URLs
      const seedUrls = generateSeedUrls(candidate.website, candidate.domain)
      const existingSeedUrls = draft.evidenceSeedUrls || []
      const updatedSeedUrls = [
        ...existingSeedUrls.filter((seed) => seed.competitorDomain.toLowerCase() !== normalizedDomain),
        {
          competitorDomain: normalizedDomain,
          urls: seedUrls,
        },
      ]
      
      onUpdateDraft({
        selectedCompetitors: updatedCompetitors,
        evidenceSeedUrls: updatedSeedUrls,
      })
    }
  }

  const handleRemoveCompetitor = (url: string) => {
    const updated = selectedCompetitors.filter((c) => c.url !== url)
    setSelectedCompetitors(updated)
    
    // Extract domain and remove from seed URLs
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace(/^www\./, '').toLowerCase()
      const updatedDomains = new Set(selectedCandidateDomains)
      updatedDomains.delete(domain)
      setSelectedCandidateDomains(updatedDomains)
      
      const existingSeedUrls = draft.evidenceSeedUrls || []
      const updatedSeedUrls = existingSeedUrls.filter(
        (seed) => seed.competitorDomain.toLowerCase() !== domain
      )
      onUpdateDraft({
        selectedCompetitors: updated,
        evidenceSeedUrls: updatedSeedUrls,
      })
    } catch {
      onUpdateDraft({ selectedCompetitors: updated })
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

    const competitor = { name: newCompetitorName.trim(), url }
    const updated = [...selectedCompetitors, competitor]
    setSelectedCompetitors(updated)
    
    // Extract domain and generate seed URLs
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace(/^www\./, '').toLowerCase()
      const normalizedDomain = domain.toLowerCase()
      const updatedDomains = new Set(selectedCandidateDomains)
      updatedDomains.add(normalizedDomain)
      setSelectedCandidateDomains(updatedDomains)
      
      // Generate seed URLs for manually added competitor
      const seedUrls = generateSeedUrls(url, domain)
      const existingSeedUrls = draft.evidenceSeedUrls || []
      const updatedSeedUrls = [
        ...existingSeedUrls.filter((seed) => seed.competitorDomain.toLowerCase() !== normalizedDomain),
        {
          competitorDomain: normalizedDomain,
          urls: seedUrls,
        },
      ]
      onUpdateDraft({
        selectedCompetitors: updated,
        evidenceSeedUrls: updatedSeedUrls,
      })
    } catch {
      onUpdateDraft({ selectedCompetitors: updated })
    }
    
    setNewCompetitorName('')
    setNewCompetitorUrl('')
    setShowAddCompetitor(false)
    setError(null)
  }

  // Allow proceeding without competitors (optional)
  const canSeeResults = true

  return (
    <div className="space-y-6">
      {/* Dev-only badge */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground text-center">
          Step2: company-only
        </div>
      )}

      {/* Summary card */}
      <SurfaceCard className="p-6 shadow-md">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            You entered
          </h3>
          <div className="space-y-2 text-sm">
            {draft.mode && (
              <div>
                <span className="text-muted-foreground">Mode: </span>
                <span className="font-medium text-foreground capitalize">
                  {draft.mode}
                </span>
              </div>
            )}
            <div>
              <span className="text-muted-foreground">
                {draft.mode === 'market'
                  ? 'Market: '
                  : draft.mode === 'idea'
                    ? 'Idea: '
                    : 'Company: '}
              </span>
              <span className="font-medium text-foreground">
                {draft.primaryCompanyName || draft.marketCategory}
              </span>
            </div>
            {draft.contextText && (
              <div>
                <span className="text-muted-foreground">Decision context: </span>
                <span className="text-foreground">{draft.contextText}</span>
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
              Optional: add 1–3 competitors for sharper results. You can add more after signing in.
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

          {/* Search for competitors */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch()
                  }
                }}
                placeholder="Search for competitors..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={loadingCandidates || !searchQuery.trim()}
              >
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>

          {/* Competitor candidates */}
          {loadingCandidates ? (
            <div className="py-4 text-sm text-muted-foreground">
              Searching for competitors...
            </div>
          ) : candidates.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Competitor companies:
              </p>
              <div className="border border-border rounded-lg divide-y divide-border">
                {candidates.map((candidate) => {
                  const normalizedDomain = candidate.domain.toLowerCase()
                  const isSelected = selectedCandidateDomains.has(normalizedDomain)
                  const confidenceColors = {
                    high: 'bg-green-100 text-green-800 border-green-200',
                    medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                    low: 'bg-gray-100 text-gray-800 border-gray-200',
                  }
                  
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
          ) : searchQuery && candidates.length === 0 && !loadingCandidates ? (
            <div className="py-4 text-sm text-muted-foreground">
              No competitors found. Try a different search or add them manually below.
            </div>
          ) : null}

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


          {/* Error */}
          {error && (
            <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
              <p className="text-sm font-medium text-destructive">{error}</p>
            </div>
          )}
        </div>
      </SurfaceCard>

      {/* Privacy reassurance */}
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-medium text-foreground">Privacy:</span> We'll never market to you using this email—only send a magic link to access your results securely.
        </p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button
          type="button"
          onClick={onSeeResults}
          size="lg"
          variant="brand"
        >
          See Results
        </Button>
      </div>
    </div>
  )
}

