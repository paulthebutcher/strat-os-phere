'use client'

import { useState, useEffect } from 'react'
import { Plus, X, CheckCircle2, Circle, Search } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { TryDraft } from '@/lib/tryDraft'
import { normalizeUrl } from '@/lib/url/normalizeUrl'
import { CompetitorLogo } from '@/components/competitors/CompetitorLogo'
import {
  rankCompetitorCandidates,
  type CompetitorCandidate,
  type RankedCandidate,
} from '@/lib/ux/rankCompetitorCandidates'
import { cn } from '@/lib/utils'

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
  const [urlError, setUrlError] = useState<string | null>(null)
  const [nameError, setNameError] = useState<string | null>(null)
  
  // Search state
  const [searchQuery, setSearchQuery] = useState(draft.primaryCompanyName || '')
  const [rawCandidates, setRawCandidates] = useState<CompetitorCandidate[]>([])
  const [rankedCandidates, setRankedCandidates] = useState<RankedCandidate[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
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

  // Rank candidates when raw candidates change
  useEffect(() => {
    if (rawCandidates.length > 0) {
      const ranked = rankCompetitorCandidates(rawCandidates)
      setRankedCandidates(ranked)
      
      // Dev-only diagnostics
      if (process.env.NODE_ENV === 'development') {
        console.log('[Step2] Candidates ranked:', {
          total: ranked.length,
          top3: ranked.slice(0, 3).map(c => ({
            name: c.name,
            domain: c.domain,
            score: c.score,
            reasons: c.reasons,
          })),
        })
      }
    } else {
      setRankedCandidates([])
    }
  }, [rawCandidates])

  // Search for competitors with graceful degradation
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setError('Please enter a company name to search')
      return
    }

    setLoadingCandidates(true)
    setError(null)
    setSearchError(null)

    try {
      const response = await fetch('/api/competitors/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
          market: draft.marketCategory,
        }),
      })

      const data = await response.json()

      // Handle both API response formats (backward compatible)
      let candidates: CompetitorCandidate[] = []
      
      if (data.results && Array.isArray(data.results)) {
        // New API format: { ok, results, error? }
        if (data.ok && data.results.length > 0) {
          // Convert new format to CompetitorCandidate format
          candidates = data.results.map((r: any) => ({
            name: r.name,
            website: r.website,
            domain: r.domain,
            confidence: 'medium' as const, // Default confidence for new API
          }))
        } else if (data.error) {
          setSearchError('Suggestions unavailable — add competitors manually.')
        }
      } else if (data.candidates && Array.isArray(data.candidates)) {
        // Legacy format: { candidates }
        candidates = data.candidates
      }

      setRawCandidates(candidates)

      // Dev-only diagnostics
      if (process.env.NODE_ENV === 'development') {
        console.log('[Step2] Competitor search results:', {
          query: searchQuery,
          candidateCount: candidates.length,
          exampleDomains: candidates.slice(0, 5).map((c: CompetitorCandidate) => c.domain),
        })
      }
    } catch (err) {
      console.error('[TryStep2] Failed to search competitors:', err)
      setRawCandidates([])
      setSearchError('Suggestions unavailable — add competitors manually.')
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

  const handleToggleCandidate = (candidate: RankedCandidate | CompetitorCandidate) => {
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

  // Normalize URL on blur for manual add
  const handleUrlBlur = () => {
    const url = newCompetitorUrl.trim()
    if (url) {
      const normalized = normalizeUrl(url)
      if (!normalized.ok) {
        setUrlError(normalized.reason)
      } else {
        setUrlError(null)
        // Update to normalized URL
        try {
          const urlObj = new URL(normalized.url)
          // Normalize to root domain (strip path/query)
          const rootUrl = `https://${urlObj.hostname}`
          setNewCompetitorUrl(rootUrl)
        } catch {
          setNewCompetitorUrl(normalized.url)
        }
      }
    } else {
      setUrlError(null)
    }
  }

  // Validate name on blur
  const handleNameBlur = () => {
    if (!newCompetitorName.trim()) {
      setNameError('Name is required')
    } else {
      setNameError(null)
    }
  }

  const handleAddCompetitor = () => {
    // Clear previous errors
    setError(null)
    setNameError(null)
    setUrlError(null)

    // Validate name
    if (!newCompetitorName.trim()) {
      setNameError('Name is required')
      return
    }

    // Validate and normalize URL
    let url = newCompetitorUrl.trim()
    if (!url) {
      setUrlError('Website is required')
      return
    }

    const normalized = normalizeUrl(url)
    if (!normalized.ok) {
      setUrlError(normalized.reason)
      return
    }
    
    // Normalize to root domain
    try {
      const urlObj = new URL(normalized.url)
      url = `https://${urlObj.hostname}`
    } catch {
      url = normalized.url
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
    setNameError(null)
    setUrlError(null)
  }

  // Select top N candidates
  const handleSelectTopN = (n: number) => {
    const topN = rankedCandidates.slice(0, n)
    for (const candidate of topN) {
      const normalizedDomain = candidate.domain.toLowerCase()
      if (!selectedCandidateDomains.has(normalizedDomain)) {
        handleToggleCandidate(candidate)
      }
    }
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
              {selectedCompetitors.map((competitor, index) => {
                let domain = ''
                try {
                  const url = new URL(competitor.url)
                  domain = url.hostname.replace(/^www\./, '')
                } catch {
                  domain = competitor.url
                }
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <CompetitorLogo
                        domain={domain}
                        website={competitor.url}
                        name={competitor.name}
                        size={32}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-foreground">
                          {competitor.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {domain}
                        </div>
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
                )
              })}
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
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Finding companies (filtering listicles)…
              </div>
              {/* Skeleton rows */}
              <div className="border border-border rounded-lg divide-y divide-border">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <div className="w-5 h-5 rounded-full bg-muted animate-pulse" />
                    <div className="w-8 h-8 rounded bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                      <div className="h-3 w-24 bg-muted animate-pulse rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : searchError ? (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-sm text-muted-foreground mb-2">{searchError}</p>
              <p className="text-xs text-muted-foreground">
                Manual entry is available below.
              </p>
            </div>
          ) : rankedCandidates.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-foreground">
                  Competitor companies:
                </p>
                {rankedCandidates.length >= 5 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSelectTopN(5)}
                    className="text-xs"
                  >
                    Select all (top 5)
                  </Button>
                )}
              </div>
              <div className="border border-border rounded-lg divide-y divide-border">
                {rankedCandidates.map((candidate) => {
                  const normalizedDomain = candidate.domain.toLowerCase()
                  const isSelected = selectedCandidateDomains.has(normalizedDomain)
                  const isTopRanked = rankedCandidates.indexOf(candidate) < 3
                  
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
                      
                      {/* Logo */}
                      <CompetitorLogo
                        domain={candidate.domain}
                        website={candidate.website}
                        name={candidate.name}
                        size={32}
                      />
                      
                      {/* Company info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-sm font-medium text-foreground">
                            {candidate.name}
                          </div>
                          {isTopRanked && 'score' in candidate && candidate.score > 70 && (
                            <Badge variant="success" className="text-xs">
                              High confidence
                            </Badge>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {candidate.domain}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ) : searchQuery && rankedCandidates.length === 0 && !loadingCandidates ? (
            <div className="rounded-lg border border-border bg-muted/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">
                No eligible company websites found. Try a shorter query or a known competitor name.
              </p>
            </div>
          ) : null}

          {/* Add competitor */}
          {showAddCompetitor ? (
            <div className="space-y-3 p-3 rounded-lg border border-border">
              <div className="space-y-1">
                <Input
                  type="text"
                  value={newCompetitorName}
                  onChange={(e) => {
                    setNewCompetitorName(e.target.value)
                    if (nameError) setNameError(null)
                  }}
                  onBlur={handleNameBlur}
                  placeholder="Competitor name *"
                  className={cn('w-full', nameError && 'border-destructive')}
                  required
                />
                {nameError && (
                  <p className="text-xs text-destructive">{nameError}</p>
                )}
              </div>
              <div className="space-y-1">
                <Input
                  type="text"
                  value={newCompetitorUrl}
                  onChange={(e) => {
                    setNewCompetitorUrl(e.target.value)
                    if (urlError) setUrlError(null)
                  }}
                  onBlur={handleUrlBlur}
                  placeholder="Website (e.g., pagerduty.com or https://pagerduty.com) *"
                  className={cn('w-full', urlError && 'border-destructive')}
                  required
                />
                {urlError ? (
                  <p className="text-xs text-destructive">{urlError}</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Will be normalized to root domain
                  </p>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAddCompetitor}
                  disabled={!newCompetitorName.trim() || !newCompetitorUrl.trim()}
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
                    setNameError(null)
                    setUrlError(null)
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

