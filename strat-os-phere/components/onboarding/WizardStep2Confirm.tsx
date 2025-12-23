'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Plus, X, ExternalLink } from 'lucide-react'

import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import type {
  WizardState,
  ResolvedSource,
  SuggestedCompetitor,
  SelectedCompetitor,
} from '@/lib/onboarding/types'
import { normalizeUrl } from '@/lib/url/normalizeUrl'
import { createProjectFromForm } from '@/app/projects/actions'
import { createCompetitorForProject } from '@/app/projects/[projectId]/competitors/actions'
import { GenerateChecklist } from './GenerateChecklist'

interface WizardStep2ConfirmProps {
  state: WizardState
  onBack: () => void
  onComplete: (state: Partial<WizardState>) => void
}

const EVIDENCE_WINDOW_OPTIONS = [30, 60, 90, 180] as const

export function WizardStep2Confirm({
  state,
  onBack,
  onComplete,
}: WizardStep2ConfirmProps) {
  const router = useRouter()
  const [sources, setSources] = useState<ResolvedSource[]>(state.resolvedSources)
  const [selectedCompetitors, setSelectedCompetitors] = useState<SelectedCompetitor[]>(
    state.selectedCompetitors
  )
  const [evidenceWindowDays, setEvidenceWindowDays] = useState(
    state.evidenceWindowDays
  )
  const [newSourceUrl, setNewSourceUrl] = useState('')
  const [showAddSource, setShowAddSource] = useState(false)
  const [newCompetitorName, setNewCompetitorName] = useState('')
  const [newCompetitorUrl, setNewCompetitorUrl] = useState('')
  const [showAddCompetitor, setShowAddCompetitor] = useState(false)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const enabledSources = sources.filter((s) => s.enabled)
  const REQUIRED_COMPETITORS = 3
  const hasRequiredCompetitors = selectedCompetitors.length >= REQUIRED_COMPETITORS
  const hasDecision = state.decisionFraming?.decision?.trim().length > 0
  const hasMarket = state.marketCategory?.trim().length > 0
  const canRun = enabledSources.length > 0 && hasRequiredCompetitors && hasDecision && hasMarket

  const handleSourceToggle = (index: number) => {
    const newSources = [...sources]
    newSources[index].enabled = !newSources[index].enabled
    setSources(newSources)
  }

  const handleAddSource = () => {
    if (!newSourceUrl.trim()) {
      return
    }

    const normalized = normalizeUrl(newSourceUrl.trim())
    if (!normalized.ok) {
      setError(`Invalid URL: ${normalized.reason}`)
      return
    }

    const newSource: ResolvedSource = {
      label: 'Custom source',
      url: normalized.url,
      type: 'other',
      confidence: 'medium',
      enabled: true,
    }

    setSources([...sources, newSource])
    setNewSourceUrl('')
    setShowAddSource(false)
    setError(null)
  }

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

  const handleRunAnalysis = async () => {
    if (!canRun) {
      if (!hasDecision) {
        setError('Please add a decision')
      } else if (!hasMarket) {
        setError('Please add a market/category')
      } else if (enabledSources.length === 0) {
        setError('Please enable at least 1 source')
      } else if (selectedCompetitors.length < REQUIRED_COMPETITORS) {
        setError(`Please add ${REQUIRED_COMPETITORS} competitors (currently ${selectedCompetitors.length})`)
      } else {
        setError('Please complete all required fields')
      }
      return
    }

    setRunning(true)
    setError(null)

    try {
      // Generate project name
      const projectName = `Competitive analysis: ${state.primaryCompanyName}`

      // Create project
      const projectResult = await createProjectFromForm({
        name: projectName,
        marketCategory: state.marketCategory || 'Competitive analysis',
        targetCustomer: 'Target customers',
        goal: state.decisionFraming?.decision || 'Generate competitive insights',
        decisionFraming: state.decisionFraming ? (state.decisionFraming as unknown as any) : undefined,
      })

      if (!projectResult?.success || !projectResult.projectId) {
        throw new Error(projectResult?.message || 'Failed to create project')
      }

      const projectId = projectResult.projectId

      // Store enabled sources in project metadata (we'll store as JSON in a note or similar)
      // For now, we'll just create competitors - sources will be used during evidence generation

      // Create competitors
      for (const competitor of selectedCompetitors) {
        try {
          const result = await createCompetitorForProject(projectId, {
            name: competitor.name,
            website: competitor.url,
            evidence: `## ${competitor.name}\n\nEvidence generation in progress.`,
          })
          if (!result.success) {
            console.error(`Failed to create competitor ${competitor.name}:`, result.message)
          }
        } catch (err) {
          console.error(`Failed to create competitor ${competitor.name}:`, err)
          // Continue with other competitors
        }
      }

      // Navigate to competitors page (or results if analysis auto-runs)
      router.push(`/projects/${projectId}/competitors`)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to run analysis. Please try again.'
      )
      setRunning(false)
    }
  }

  // Group sources by type
  const groupedSources = sources.reduce(
    (acc, source) => {
      if (!acc[source.type]) {
        acc[source.type] = []
      }
      acc[source.type].push(source)
      return acc
    },
    {} as Record<string, ResolvedSource[]>
  )

  const sourceTypeLabels: Record<string, string> = {
    website: 'Official',
    pricing: 'Pricing',
    docs: 'Docs',
    changelog: 'Changelog/Blog',
    careers: 'Careers',
    other: 'Other',
  }

  return (
    <div className="space-y-6">
      {/* Context summary */}
      <SurfaceCard className="p-6 shadow-md">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground">
            Your analysis context
          </h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="text-muted-foreground">Company: </span>
              <span className="font-medium text-foreground">
                {state.primaryCompanyName}
              </span>
            </div>
            {state.decisionFraming?.decision && (
              <div>
                <span className="text-muted-foreground">Decision: </span>
                <span className="text-foreground">
                  {state.decisionFraming.decision}
                </span>
              </div>
            )}
            {state.marketCategory && (
              <div>
                <span className="text-muted-foreground">Market: </span>
                <span className="text-foreground">{state.marketCategory}</span>
              </div>
            )}
          </div>
        </div>
      </SurfaceCard>

      {/* Sources section */}
      <SurfaceCard className="p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-1">
              Sources we'll scan
            </h3>
            <p className="text-sm text-muted-foreground">
              Review and enable the sources you want to include. At least one
              source must be enabled.
            </p>
          </div>

          {Object.entries(groupedSources).map(([type, typeSources]) => (
            <div key={type} className="space-y-2">
              <h4 className="text-sm font-semibold text-foreground">
                {sourceTypeLabels[type] || type}
              </h4>
              <div className="space-y-2">
                {typeSources.map((source, index) => {
                  const globalIndex = sources.indexOf(source)
                  return (
                    <label
                      key={globalIndex}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/30 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={source.enabled}
                        onChange={() => handleSourceToggle(globalIndex)}
                        className="mt-1 h-4 w-4 rounded border-border text-indigo-600 focus:ring-2 focus:ring-indigo-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground truncate">
                            {source.label}
                          </span>
                          <Badge
                            variant={
                              source.confidence === 'high'
                                ? 'success'
                                : source.confidence === 'medium'
                                ? 'info'
                                : 'muted'
                            }
                            className="text-xs"
                          >
                            {source.confidence === 'high'
                              ? 'High confidence'
                              : source.confidence === 'medium'
                              ? 'Medium'
                              : 'Low'}
                          </Badge>
                        </div>
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 truncate"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {source.url}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Add source */}
          {showAddSource ? (
            <div className="flex gap-2 p-3 rounded-lg border border-border">
              <Input
                type="text"
                value={newSourceUrl}
                onChange={(e) => setNewSourceUrl(e.target.value)}
                placeholder="https://example.com/page"
                className="flex-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddSource()
                  } else if (e.key === 'Escape') {
                    setShowAddSource(false)
                    setNewSourceUrl('')
                  }
                }}
              />
              <Button
                type="button"
                size="sm"
                onClick={handleAddSource}
                disabled={!newSourceUrl.trim()}
              >
                Add
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowAddSource(false)
                  setNewSourceUrl('')
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowAddSource(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add a URL
            </Button>
          )}

          {enabledSources.length === 0 && (
            <p className="text-xs text-destructive">
              At least one source must be enabled
            </p>
          )}
        </div>
      </SurfaceCard>

      {/* Competitors section (secondary) */}
      <SurfaceCard className="p-6 border-t-2 border-t-muted">
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-semibold text-foreground mb-1">
              Add competitors (required)
            </h3>
            <p className="text-sm text-muted-foreground">
              Add {REQUIRED_COMPETITORS} real alternatives so we can gather evidence and produce defensible opportunities.
            </p>
            <div className="mt-2 text-xs font-medium text-foreground">
              Competitors: {selectedCompetitors.length} / {REQUIRED_COMPETITORS}
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

      {/* Evidence window */}
      <SurfaceCard className="p-6">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-foreground">
            Evidence window
          </label>
          <div className="flex gap-2 flex-wrap">
            {EVIDENCE_WINDOW_OPTIONS.map((days) => (
              <Button
                key={days}
                type="button"
                variant={evidenceWindowDays === days ? 'default' : 'outline'}
                size="sm"
                onClick={() => setEvidenceWindowDays(days)}
              >
                {days} days
              </Button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            How far back to look for evidence (default: 90 days)
          </p>
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
          disabled={running}
        >
          Back
        </Button>
        <div className="flex items-center gap-4">
          {!canRun && (
            <GenerateChecklist
              hasDecision={hasDecision}
              hasMarket={hasMarket}
              competitorCount={selectedCompetitors.length}
              requiredCompetitors={REQUIRED_COMPETITORS}
            />
          )}
          <Button
            type="button"
            onClick={handleRunAnalysis}
            disabled={!canRun || running}
            variant="brand"
            size="lg"
          >
            {running ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Generating...
              </>
            ) : (
              'Generate prioritized opportunities'
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

