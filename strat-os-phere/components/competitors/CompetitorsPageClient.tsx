'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Plus, CheckCircle2, Circle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CompetitorCard } from '@/components/competitors/CompetitorCard'
import { CompetitorForm } from '@/components/competitors/CompetitorForm'
import { AddCompetitorDrawer } from '@/components/competitors/AddCompetitorDrawer'
import { EmptyState } from '@/components/shared/EmptyState'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  MAX_COMPETITORS_PER_PROJECT,
  MIN_COMPETITORS_FOR_ANALYSIS,
} from '@/lib/constants'
import type { Competitor } from '@/lib/supabase/types'
import { addCompetitorFromSearch } from '@/app/projects/[projectId]/competitors/actions'
import { normalizeUrl, toDisplayDomain } from '@/lib/url/normalizeUrl'
import { normalizeDomain } from '@/lib/competitors/domainFilters'

interface CompetitorsPageClientProps {
  projectId: string
  competitors: Competitor[]
  competitorCount: number
  readyForAnalysis: boolean
  remainingToReady: number
}

type CompetitorCandidate = {
  name: string
  url: string
  domain: string
  score: number
  reason?: string
}

export function CompetitorsPageClient({
  projectId,
  competitors,
  competitorCount,
  readyForAnalysis,
  remainingToReady,
}: CompetitorsPageClientProps) {
  const router = useRouter()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CompetitorCandidate[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [addingCompetitor, setAddingCompetitor] = useState<string | null>(null)
  
  // Manual add state
  const [showManualAdd, setShowManualAdd] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualUrl, setManualUrl] = useState('')
  const [manualError, setManualError] = useState<string | null>(null)

  const isAtMax = competitorCount >= MAX_COMPETITORS_PER_PROJECT

  // Track which domains are already added
  const existingDomains = new Set(
    competitors
      .map((c) => {
        if (!c.url) return null
        try {
          return toDisplayDomain(c.url).toLowerCase()
        } catch {
          return null
        }
      })
      .filter(Boolean) as string[]
  )

  // Search for competitors
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchError('Please enter a search query')
      return
    }

    setIsSearching(true)
    setSearchError(null)

    try {
      const response = await fetch('/api/competitors/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: searchQuery.trim(),
        }),
      })

      const data = await response.json()

      if (data.ok && Array.isArray(data.candidates)) {
        setSearchResults(data.candidates)
        if (data.candidates.length === 0) {
          setSearchError(
            data.error || 'No clean company domains found. Try a specific company name or remove "alternatives" from your query.'
          )
        }
      } else {
        setSearchResults([])
        setSearchError(data.error || 'Couldn\'t fetch suggestions. Try again.')
      }
    } catch (err) {
      console.error('[CompetitorsPage] Search failed:', err)
      setSearchResults([])
      setSearchError('Couldn\'t fetch suggestions. Try again.')
    } finally {
      setIsSearching(false)
    }
  }

  // Add competitor from search result
  const handleAddFromSearch = async (result: CompetitorCandidate) => {
    if (isAtMax) {
      setSearchError(`You can add up to ${MAX_COMPETITORS_PER_PROJECT} competitors`)
      return
    }

    const normalizedDomain = result.domain.toLowerCase()
    if (existingDomains.has(normalizedDomain)) {
      setSearchError('This competitor is already added')
      return
    }

    setAddingCompetitor(result.domain)
    setSearchError(null)

    try {
      const response = await addCompetitorFromSearch(projectId, {
        name: result.name,
        url: result.url,
      })

      if (response.success) {
        // Refresh to get updated list
        router.refresh()
        // Remove from search results
        setSearchResults((prev) =>
          prev.filter((r) => r.domain !== result.domain)
        )
        // Update existing domains
        existingDomains.add(normalizedDomain)
        setSearchError(null)
      } else {
        if (response.message?.includes('already')) {
          setSearchError('Already added')
        } else {
          setSearchError(response.message || 'Failed to add competitor')
        }
      }
    } catch (err) {
      console.error('[CompetitorsPage] Add failed:', err)
      setSearchError('Failed to add competitor. Please try again.')
    } finally {
      setAddingCompetitor(null)
    }
  }

  // Validate URL for manual add
  const validateManualUrl = (url: string): string | null => {
    if (!url.trim()) {
      return null // URL is optional
    }
    const normalized = normalizeUrl(url)
    if (!normalized.ok) {
      return normalized.reason
    }
    return null
  }

  // Add competitor manually
  const handleManualAdd = async () => {
    if (!manualName.trim()) {
      setManualError('Please enter a competitor name')
      return
    }

    if (isAtMax) {
      setManualError(`You can add up to ${MAX_COMPETITORS_PER_PROJECT} competitors`)
      return
    }

    // Validate URL if provided
    const urlError = validateManualUrl(manualUrl)
    if (urlError) {
      setManualError(`Invalid URL: ${urlError}`)
      return
    }

    let url = manualUrl.trim()
    if (url) {
      const normalized = normalizeUrl(url)
      if (!normalized.ok) {
        setManualError(`Invalid URL: ${normalized.reason}`)
        return
      }
      url = normalized.url
    } else {
      // URL is optional but recommended
      url = `https://${manualName.toLowerCase().replace(/\s+/g, '')}.com`
    }

    // Check for duplicate
    const normalizedDomain = normalizeDomain(url)
    if (existingDomains.has(normalizedDomain)) {
      setManualError('This competitor is already added')
      return
    }

    setManualError(null)

    try {
      const response = await addCompetitorFromSearch(projectId, {
        name: manualName.trim(),
        url,
      })

      if (response.success) {
        router.refresh()
        setManualName('')
        setManualUrl('')
        setShowManualAdd(false)
      } else {
        setManualError(response.message || 'Failed to add competitor')
      }
    } catch (err) {
      console.error('[CompetitorsPage] Manual add failed:', err)
      setManualError('Failed to add competitor. Please try again.')
    }
  }

  if (competitorCount === 0) {
    return (
      <>
        <section className="space-y-6">
          <EmptyState
            title="Add competitors to map the landscape"
            description="Add a handful of real alternatives so the analysis has something concrete to compare against."
            footer={
              <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground text-left" role="list">
                <li>Add {MIN_COMPETITORS_FOR_ANALYSIS}–{MAX_COMPETITORS_PER_PROJECT} competitors</li>
                <li>Search for companies or add them manually</li>
                <li>Generate exec-ready insights</li>
              </ul>
            }
          />

          {/* Search section */}
          <div className="panel px-6 py-5 space-y-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-text-secondary">
                Search for competitors
              </h3>
              <p className="text-xs text-muted-foreground">
                Search for competitor companies. We only show primary company websites (no listicles).
              </p>
            </div>

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
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>

            {/* Search results */}
            {isSearching && (
              <div className="py-4 text-sm text-muted-foreground text-center">
                Searching for competitors...
              </div>
            )}

            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-secondary">
                  Search results:
                </p>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((result) => {
                        const isAdded = existingDomains.has(result.domain.toLowerCase())
                        const isAdding = addingCompetitor === result.domain
                        return (
                          <TableRow key={result.domain}>
                            <TableCell>
                              {isAdded ? (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {result.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {result.domain}
                            </TableCell>
                            <TableCell>
                              {isAdded ? (
                                <span className="text-xs text-muted-foreground">Added</span>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAddFromSearch(result)}
                                  disabled={isAdding || isAtMax}
                                >
                                  {isAdding ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    'Add'
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {!isSearching && searchQuery && searchResults.length === 0 && !searchError && (
              <div className="py-4 text-sm text-muted-foreground text-center">
                No competitors found. Try a different search or add them manually.
              </div>
            )}

            {searchError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
                <p className="text-sm text-destructive">{searchError}</p>
              </div>
            )}

            {/* Manual add */}
            {showManualAdd ? (
              <div className="space-y-2 p-3 rounded-lg border border-border">
                <Input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Competitor name"
                  className="w-full"
                  required
                />
                <Input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="Website (optional but recommended)"
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleManualAdd}
                    disabled={!manualName.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowManualAdd(false)
                      setManualName('')
                      setManualUrl('')
                      setManualError(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                {manualError && (
                  <p className="text-xs text-destructive">{manualError}</p>
                )}
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowManualAdd(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add manually
              </Button>
            )}
          </div>

          {/* Helper text */}
          <div className="panel px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Add at least {MIN_COMPETITORS_FOR_ANALYSIS} competitors to get useful evidence.
            </p>
          </div>
        </section>
      </>
    )
  }

  // Show existing competitors and continue adding
  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)]">
        <div className="space-y-6">
          {competitorCount > 0 && competitorCount < MIN_COMPETITORS_FOR_ANALYSIS && (
            <div className="panel px-4 py-3">
              <p className="text-sm text-muted-foreground">
                Add {remainingToReady} more to generate
              </p>
            </div>
          )}

          {/* Search section */}
          <div className="panel px-6 py-5 space-y-4">
            <div className="space-y-2">
              <h2 className="text-sm font-medium text-text-secondary">
                Search for competitors
              </h2>
              <p className="text-xs text-muted-foreground">
                We only show primary company websites (no listicles).
              </p>
            </div>

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
                placeholder="Search for competitors..."
                className="flex-1"
              />
              <Button
                type="button"
                onClick={handleSearch}
                disabled={isSearching || !searchQuery.trim()}
                variant="outline"
              >
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                Search
              </Button>
            </div>

            {/* Search results */}
            {!isSearching && searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-text-secondary">
                  Search results:
                </p>
                <div className="border border-border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Company</TableHead>
                        <TableHead>Domain</TableHead>
                        <TableHead className="w-24"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.map((result) => {
                        const isAdded = existingDomains.has(result.domain.toLowerCase())
                        const isAdding = addingCompetitor === result.domain
                        return (
                          <TableRow key={result.domain}>
                            <TableCell>
                              {isAdded ? (
                                <CheckCircle2 className="h-4 w-4 text-primary" />
                              ) : (
                                <Circle className="h-4 w-4 text-muted-foreground" />
                              )}
                            </TableCell>
                            <TableCell className="font-medium">
                              {result.name}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {result.domain}
                            </TableCell>
                            <TableCell>
                              {isAdded ? (
                                <span className="text-xs text-muted-foreground">Added</span>
                              ) : (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleAddFromSearch(result)}
                                  disabled={isAdding || isAtMax}
                                >
                                  {isAdding ? (
                                    <Loader2 className="h-3 w-3 animate-spin" />
                                  ) : (
                                    'Add'
                                  )}
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            {searchError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
                <p className="text-sm text-destructive">{searchError}</p>
              </div>
            )}

            {/* Manual add */}
            {showManualAdd ? (
              <div className="space-y-2 p-3 rounded-lg border border-border">
                <Input
                  type="text"
                  value={manualName}
                  onChange={(e) => setManualName(e.target.value)}
                  placeholder="Competitor name"
                  className="w-full"
                  required
                />
                <Input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="Website (optional but recommended)"
                  className="w-full"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleManualAdd}
                    disabled={!manualName.trim()}
                  >
                    Add
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowManualAdd(false)
                      setManualName('')
                      setManualUrl('')
                      setManualError(null)
                    }}
                  >
                    Cancel
                  </Button>
                </div>
                {manualError && (
                  <p className="text-xs text-destructive">{manualError}</p>
                )}
              </div>
            ) : (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowManualAdd(true)}
                disabled={isAtMax}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add manually
              </Button>
            )}

            {isAtMax && (
              <p className="text-xs text-muted-foreground">
                Max {MAX_COMPETITORS_PER_PROJECT} competitors for this analysis.
              </p>
            )}
          </div>
        </div>

        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-medium text-text-secondary">
              Selected competitors ({competitorCount})
            </h2>
          </div>
          <div className="panel divide-y divide-border-subtle">
            {competitors.map((competitor, index) => (
              <CompetitorCard
                key={competitor.id}
                projectId={projectId}
                competitor={competitor}
                index={index}
                total={competitorCount}
              />
            ))}
          </div>
          {competitorCount < MIN_COMPETITORS_FOR_ANALYSIS && (
            <div className="panel px-4 py-3">
              <p className="text-xs text-muted-foreground">
                Add at least {MIN_COMPETITORS_FOR_ANALYSIS} competitors to get useful evidence.
              </p>
            </div>
          )}
        </section>
      </section>

      <AddCompetitorDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
      >
        <CompetitorForm
          projectId={projectId}
          existingCount={competitorCount}
          onSuccess={() => setDrawerOpen(false)}
          compact
        />
      </AddCompetitorDrawer>
    </>
  )
}
