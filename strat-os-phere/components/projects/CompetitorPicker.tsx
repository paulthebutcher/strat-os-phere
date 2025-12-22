'use client'

import { useState, useMemo } from 'react'
import { Search, Plus, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import type { CompetitorRecommendation } from '@/lib/projects/new/types'

export interface CompetitorItem {
  name: string
  url?: string
}

interface CompetitorPickerProps {
  value: CompetitorItem[]
  onChange: (competitors: CompetitorItem[]) => void
  suggested?: CompetitorItem[]
  fetchSuggestions?: (query: string) => Promise<CompetitorRecommendation[]>
}

export function CompetitorPicker({
  value,
  onChange,
  suggested = [],
  fetchSuggestions,
}: CompetitorPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<CompetitorRecommendation[]>([])
  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [showManualForm, setShowManualForm] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualUrl, setManualUrl] = useState('')

  // Filter suggested competitors by search query
  const filteredSuggestions = useMemo(() => {
    if (!searchQuery.trim()) {
      return suggested
    }
    const query = searchQuery.toLowerCase()
    return suggested.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        (s.url && s.url.toLowerCase().includes(query))
    )
  }, [suggested, searchQuery])

  // Check if a competitor is already added
  const isAdded = (name: string, url?: string) => {
    return value.some(
      (c) =>
        c.name.toLowerCase() === name.toLowerCase() ||
        (url && c.url && c.url.toLowerCase() === url.toLowerCase())
    )
  }

  // Handle adding a competitor
  const handleAdd = (name: string, url?: string) => {
    if (isAdded(name, url)) {
      return
    }
    onChange([...value, { name, url }])
    setSearchQuery('')
    setShowManualForm(false)
    setManualName('')
    setManualUrl('')
  }

  // Handle removing a competitor
  const handleRemove = (index: number) => {
    onChange(value.filter((_, i) => i !== index))
  }

  // Handle search with debounce
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    setSearchError(null)

    if (!query.trim() || !fetchSuggestions) {
      setSearchResults([])
      return
    }

    setSearching(true)
    try {
      const results = await fetchSuggestions(query)
      setSearchResults(results)
    } catch (err) {
      setSearchError(
        err instanceof Error
          ? err.message
          : 'Failed to fetch suggestions'
      )
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  // Handle manual add
  const handleManualAdd = () => {
    if (!manualName.trim()) {
      return
    }
    handleAdd(manualName.trim(), manualUrl.trim() || undefined)
  }

  // Combine suggestions and search results, deduplicated
  const allResults = useMemo(() => {
    const combined: Array<CompetitorRecommendation | CompetitorItem> = [
      ...filteredSuggestions.map((s) => ({
        name: s.name,
        url: s.url,
        reason: 'Suggested competitor',
        confidence: 'medium' as const,
      })),
      ...searchResults,
    ]

    // Deduplicate by name/url
    const seen = new Set<string>()
    return combined.filter((item) => {
      const key = item.url
        ? item.url.toLowerCase()
        : item.name.toLowerCase()
      if (seen.has(key)) {
        return false
      }
      seen.add(key)
      return true
    })
  }, [filteredSuggestions, searchResults])

  return (
    <div className="space-y-3">
      {/* Current competitors list */}
      {value.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-foreground">Competitors</p>
          <div className="flex flex-wrap gap-2">
            {value.map((competitor, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="flex items-center gap-1.5 px-3 py-1.5"
              >
                <span className="text-sm">{competitor.name}</span>
                {competitor.url && (
                  <span className="text-xs text-muted-foreground">
                    ({competitor.url.replace(/^https?:\/\//, '').split('/')[0]})
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemove(index)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  aria-label={`Remove ${competitor.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Add competitor button */}
      <Button
        type="button"
        variant="outline"
        onClick={() => setOpen(true)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        {value.length === 0 ? 'Add competitor' : 'Add another competitor'}
      </Button>

      {/* Picker Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Competitor</DialogTitle>
            <DialogDescription>
              Search for competitors or add them manually
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Search input */}
            <div className="space-y-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or URL..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              {searchError && (
                <p className="text-xs text-muted-foreground">
                  {searchError}. You can still add manually.
                </p>
              )}
            </div>

            {/* Results list */}
            {allResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-medium text-foreground">
                  {searching ? 'Searching...' : 'Suggestions'}
                </p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {allResults.map((item, index) => {
                    const alreadyAdded = isAdded(item.name, item.url)
                    return (
                      <SurfaceCard
                        key={index}
                        className={`p-3 cursor-pointer transition-colors ${
                          alreadyAdded
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:bg-muted/50'
                        }`}
                        onClick={() => !alreadyAdded && handleAdd(item.name, item.url)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-medium text-foreground">
                                {item.name}
                              </p>
                              {'confidence' in item && item.confidence && (
                                <Badge
                                  variant={
                                    item.confidence === 'high'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className="text-xs"
                                >
                                  {item.confidence}
                                </Badge>
                              )}
                              {alreadyAdded && (
                                <Badge variant="muted" className="text-xs">
                                  Added
                                </Badge>
                              )}
                            </div>
                            {item.url && (
                              <p className="text-xs text-muted-foreground mt-1 break-all">
                                {item.url}
                              </p>
                            )}
                            {'reason' in item && item.reason && (
                              <p className="text-xs text-muted-foreground mt-1">
                                {item.reason}
                              </p>
                            )}
                          </div>
                          {!alreadyAdded && (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleAdd(item.name, item.url)
                              }}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              Add
                            </Button>
                          )}
                        </div>
                      </SurfaceCard>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Manual add form */}
            {!showManualForm ? (
              <Button
                type="button"
                variant="ghost"
                onClick={() => setShowManualForm(true)}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add manually
              </Button>
            ) : (
              <SurfaceCard className="p-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Competitor name <span className="text-destructive">*</span>
                  </label>
                  <Input
                    placeholder="e.g. Competitor Inc."
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">
                    Website URL <span className="text-muted-foreground">(optional)</span>
                  </label>
                  <Input
                    type="url"
                    placeholder="https://example.com"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleManualAdd}
                    disabled={!manualName.trim()}
                    className="flex-1"
                  >
                    <Check className="h-3.5 w-3.5 mr-1" />
                    Add
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setShowManualForm(false)
                      setManualName('')
                      setManualUrl('')
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </SurfaceCard>
            )}

            {/* Empty state */}
            {!searching &&
              allResults.length === 0 &&
              !showManualForm &&
              searchQuery.trim() && (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No results found. Try adding manually.
                </div>
              )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

