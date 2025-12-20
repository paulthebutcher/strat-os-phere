'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { SearchResult } from '@/lib/search/provider'
import type { EvidenceDraft } from '@/lib/schemas/evidenceDraft'

interface EvidenceGeneratorProps {
  projectId: string
  onDraftGenerated: (draft: EvidenceDraft) => void
}

export function EvidenceGenerator({
  projectId,
  onDraftGenerated,
}: EvidenceGeneratorProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [selectedResult, setSelectedResult] = useState<string | null>(null)
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [competitorName, setCompetitorName] = useState('')

  async function handleSearch() {
    if (!searchQuery.trim()) {
      setError('Please enter a competitor name or URL')
      return
    }

    setSearching(true)
    setError(null)
    setSearchResults([])
    setSelectedResult(null)

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ q: searchQuery.trim() }),
      })

      if (!response.ok) {
        throw new Error('Search failed')
      }

      const data = await response.json()
      const results = data.results || []
      setSearchResults(results)

      // Auto-set competitor name if not already set
      if (!competitorName && results.length > 0) {
        // Use the first result's title or domain as competitor name
        const firstResult = results[0]
        const nameCandidate = firstResult.title || firstResult.domain || searchQuery.trim()
        // Extract domain from URL if title not available
        if (!firstResult.title && firstResult.url) {
          try {
            const url = new URL(firstResult.url)
            setCompetitorName(url.hostname.replace(/^www\./, ''))
          } catch {
            setCompetitorName(nameCandidate)
          }
        } else {
          setCompetitorName(nameCandidate)
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to search. Please try again or enter manually.'
      )
    } finally {
      setSearching(false)
    }
  }

  async function handleGenerateEvidence() {
    if (!selectedResult || !competitorName.trim()) {
      setError('Please select a search result and enter a competitor name')
      return
    }

    setGenerating(true)
    setError(null)
    setProgress('Starting...')

    try {
      setProgress('Fetching pages...')

      const response = await fetch('/api/evidence/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          competitorName: competitorName.trim(),
          domainOrUrl: selectedResult,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(
          errorData.error || `HTTP ${response.status}: Failed to generate evidence`
        )
      }

      const result = (await response.json()) as
        | { ok: true; draft: EvidenceDraft }
        | { ok: false; error: string }

      if (!result.ok) {
        throw new Error(result.error || 'Failed to generate evidence draft')
      }

      if (!result.draft) {
        throw new Error('Failed to generate evidence draft: missing draft')
      }

      onDraftGenerated(result.draft)
      setProgress(null)

      // Reset state
      setSearchQuery('')
      setSearchResults([])
      setSelectedResult(null)
      setCompetitorName('')
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to generate evidence. Please try again or enter manually.'
      )
      setProgress(null)
    } finally {
      setGenerating(false)
    }
  }

  function handleUseUrl() {
    // If search query looks like a URL, allow direct use
    const trimmed = searchQuery.trim()
    if (trimmed && (trimmed.startsWith('http') || trimmed.includes('.'))) {
      setSelectedResult(trimmed)
      setSearchResults([])
      
      // Auto-set competitor name from domain if not set
      if (!competitorName) {
        try {
          const url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`)
          setCompetitorName(url.hostname.replace(/^www\./, ''))
        } catch {
          // If URL parsing fails, try to extract domain manually
          const domain = trimmed.replace(/^https?:\/\//, '').split('/')[0].replace(/^www\./, '')
          setCompetitorName(domain)
        }
      }
    }
  }

  const canUseDirectUrl =
    searchQuery.trim() && (searchQuery.includes('http') || (searchQuery.includes('.') && !searchQuery.includes(' ')))

  return (
    <div className="space-y-4 border-t border-border-subtle pt-4 mt-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-text-primary">
          Find competitor automatically
        </h3>
        <p className="text-xs text-text-secondary">
          Search by name or paste a URL to generate evidence from their website.
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex gap-2">
          <Input
            placeholder="Competitor name or URL (e.g., Acme CRM or https://acme.com)"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setError(null)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !searching) {
                e.preventDefault()
                handleSearch()
              }
            }}
            disabled={searching || generating}
            className="flex-1"
          />
          {canUseDirectUrl && (
            <Button
              type="button"
              variant="outline"
              onClick={handleUseUrl}
              disabled={searching || generating}
            >
              Use URL
            </Button>
          )}
          <Button
            type="button"
            onClick={handleSearch}
            disabled={searching || generating || !searchQuery.trim()}
          >
            {searching ? 'Searching...' : 'Search'}
          </Button>
        </div>

        {searchResults.length > 0 && (
          <div className="space-y-2">
            <label className="text-xs font-medium text-text-secondary">
              Select a result:
            </label>
            <div className="space-y-2 max-h-48 overflow-y-auto border border-border-subtle rounded-md p-2">
              {searchResults.map((result, index) => (
                <label
                  key={index}
                  className="flex items-start gap-2 p-2 rounded hover:bg-surface-muted cursor-pointer"
                >
                  <input
                    type="radio"
                    name="search-result"
                    value={result.url}
                    checked={selectedResult === result.url}
                    onChange={() => setSelectedResult(result.url)}
                    className="mt-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text-primary truncate">
                      {result.title || result.url}
                    </div>
                    <div className="text-xs text-text-secondary truncate">
                      {result.url}
                    </div>
                    {result.snippet && (
                      <div className="text-xs text-text-muted mt-1 line-clamp-2">
                        {result.snippet}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}

        {selectedResult && (
          <div className="space-y-3">
            <div className="space-y-2">
              <label
                htmlFor="competitor-name-generate"
                className="text-xs font-medium text-text-secondary"
              >
                Competitor name
              </label>
              <Input
                id="competitor-name-generate"
                placeholder="Enter competitor name"
                value={competitorName}
                onChange={(e) => setCompetitorName(e.target.value)}
                disabled={generating}
              />
            </div>
            <Button
              type="button"
              onClick={handleGenerateEvidence}
              disabled={generating || !competitorName.trim()}
              className="w-full"
            >
              {generating ? 'Generating...' : 'Generate evidence'}
            </Button>
          </div>
        )}

        {progress && (
          <div className="text-xs text-text-secondary bg-surface-muted p-2 rounded">
            {progress}
          </div>
        )}

        {error && (
          <div className="text-xs text-destructive bg-surface-muted p-2 rounded">
            {error}
          </div>
        )}

        <p className="text-xs text-text-muted">
          Note: Only public pages will be scraped. Don't paste confidential information.
        </p>
      </div>
    </div>
  )
}

