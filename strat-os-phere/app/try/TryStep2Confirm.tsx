'use client'

import { useState, useEffect } from 'react'
import { Plus, X, CheckCircle2, Circle, Info } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type { TryDraft } from '@/lib/tryDraft'
import { normalizeUrl } from '@/lib/url/normalizeUrl'
import type { CompanyCandidate, SourcePage } from '@/lib/competitors/resolveCompanyCandidates'
import { isPrimaryResearchPage } from '@/lib/competitors/resolveCompanyCandidates'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'

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
  
  // Company candidates state
  const [candidates, setCandidates] = useState<CompanyCandidate[]>([])
  const [loadingCandidates, setLoadingCandidates] = useState(false)
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

  // Dev-only marker: confirm we're in the updated component
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[Step2] Add competitors component mounted: vNEXT_COMPANY_CANDIDATES')
    }
  }, [])

  // Fetch company candidates on mount
  useEffect(() => {
    const fetchCandidates = async () => {
      if (!draft.primaryCompanyName) return

      setLoadingCandidates(true)

      try {
        const response = await fetch('/api/try/competitors', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: draft.primaryCompanyName,
            contextText: draft.contextText,
          }),
        })

        const data = await response.json()

        if (data.candidates && Array.isArray(data.candidates)) {
          // Runtime safeguard: filter out any listicles that might have slipped through
          const safeCandidates = data.candidates.filter((candidate: CompanyCandidate) => {
            // Check if candidate name looks like a listicle title
            const nameLower = candidate.name.toLowerCase()
            const isSuspicious = ['alternatives', 'competitors', 'top', 'best', 'vs', 'compare', 'list of'].some(
              kw => nameLower.includes(kw)
            )
            if (isSuspicious && process.env.NODE_ENV === 'development') {
              console.warn('[Step2] Filtered suspicious candidate:', candidate.name)
            }
            return !isSuspicious
          })

          setCandidates(safeCandidates)

          // Diagnostic logging
          if (process.env.NODE_ENV === 'development') {
            console.log('[Step2] Received candidates:', {
              total: data.candidates.length,
              safe: safeCandidates.length,
              filtered: data.candidates.length - safeCandidates.length,
            })
          }

          if (safeCandidates.length === 0 && data.error) {
            // Non-blocking: just log, don't show error
            console.log('[TryStep2] No candidates found:', data.error)
          }
        } else {
          setCandidates([])
        }
      } catch (err) {
        console.error('[TryStep2] Failed to fetch candidates:', err)
        setCandidates([])
        // Non-blocking: don't set error state, just log
      } finally {
        setLoadingCandidates(false)
      }
    }

    fetchCandidates()
  }, [draft.primaryCompanyName, draft.contextText])

  const handleToggleCandidate = (candidate: CompanyCandidate) => {
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
      
      // Update seed URLs
      const updatedSeedUrls = (draft.evidenceSeedUrls || []).filter(
        (seed) => seed.competitorDomain !== candidate.domain
      )
      onUpdateDraft({
        selectedCompetitors: updatedCompetitors,
        evidenceSeedUrls: updatedSeedUrls,
      })
    } else {
      // Add candidate
      const competitor = {
        name: candidate.name,
        url: candidate.primaryUrl,
      }
      const updatedCompetitors = [...selectedCompetitors, competitor]
      const updatedDomains = new Set(selectedCandidateDomains)
      updatedDomains.add(candidate.domain)
      
      setSelectedCompetitors(updatedCompetitors)
      setSelectedCandidateDomains(updatedDomains)
      
      // Add seed URLs
      const existingSeedUrls = draft.evidenceSeedUrls || []
      const updatedSeedUrls = [
        ...existingSeedUrls.filter((seed) => seed.competitorDomain !== candidate.domain),
        {
          competitorDomain: candidate.domain,
          urls: candidate.seedUrls,
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
      const domain = urlObj.hostname.replace(/^www\./, '')
      const updatedDomains = new Set(selectedCandidateDomains)
      updatedDomains.delete(domain)
      setSelectedCandidateDomains(updatedDomains)
      
      const existingSeedUrls = draft.evidenceSeedUrls || []
      const updatedSeedUrls = existingSeedUrls.filter(
        (seed) => seed.competitorDomain !== domain
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
    
    // Extract domain for seed URLs
    try {
      const urlObj = new URL(url)
      const domain = urlObj.hostname.replace(/^www\./, '')
      const existingSeedUrls = draft.evidenceSeedUrls || []
      const updatedSeedUrls = [
        ...existingSeedUrls.filter((seed) => seed.competitorDomain !== domain),
        {
          competitorDomain: domain,
          urls: [url], // Just the primary URL for manually added competitors
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
          Step2: company-candidates
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

          {/* Suggested competitors */}
          {loadingCandidates ? (
            <div className="py-4 text-sm text-muted-foreground">
              Finding competitor suggestions...
            </div>
          ) : candidates.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">
                Suggested competitors:
              </p>
              <div className="border border-border rounded-lg divide-y divide-border">
                {candidates.map((candidate) => {
                  const isSelected = selectedCandidateDomains.has(candidate.domain)
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
                      
                      {/* Logo */}
                      <div className="flex-shrink-0">
                        <img
                          src={candidate.logoUrl}
                          alt={`${candidate.name} logo`}
                          className="w-8 h-8 rounded object-contain bg-background border border-border"
                          onError={(e) => {
                            // Fallback to initials if logo fails
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const parent = target.parentElement
                            if (parent && !parent.querySelector('.logo-fallback')) {
                              const fallback = document.createElement('div')
                              fallback.className = 'logo-fallback w-8 h-8 rounded bg-muted flex items-center justify-center text-xs font-semibold text-foreground border border-border'
                              fallback.textContent = candidate.name.charAt(0).toUpperCase()
                              parent.appendChild(fallback)
                            }
                          }}
                        />
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
                      
                      {/* Why suggested tooltip */}
                      {candidate.derivedFrom.length > 0 && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => e.stopPropagation()}
                                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
                              >
                                <Info className="h-4 w-4" />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="left" className="max-w-xs">
                              <p className="text-xs">
                                Suggested from:{' '}
                                {candidate.derivedFrom
                                  .slice(0, 2)
                                  .map((source) => {
                                    try {
                                      const url = new URL(source.url)
                                      return url.hostname.replace(/^www\./, '')
                                    } catch {
                                      return source.url
                                    }
                                  })
                                  .join(', ')}
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ) : candidates.length === 0 && !loadingCandidates ? (
            <div className="py-4 text-sm text-muted-foreground">
              We couldn't confidently detect competitors. Add them manually below.
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

