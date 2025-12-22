'use client'

import { useState } from 'react'
import { CheckCircle2, ExternalLink, Loader2, AlertCircle, Globe, Sparkles } from 'lucide-react'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface SuggestedSource {
  label: string
  url: string
  type: 'pricing' | 'docs' | 'changelog' | 'jobs' | 'status' | 'integrations' | 'reviews' | 'blog' | 'other'
}

interface SuggestedCompetitor {
  name: string
  url: string
  rationale: string
}

interface TavilyPreviewData {
  normalizedUrl: string
  site: {
    title?: string
    description?: string
    faviconUrl?: string
    domain: string
  }
  summary: {
    oneLiner: string
    bullets: string[]
    confidence: 'high' | 'medium' | 'low'
  }
  suggestedSources: SuggestedSource[]
  suggestedCompetitors: SuggestedCompetitor[]
  suggestedKeywords: string[]
}

interface TavilyPreviewProps {
  data: TavilyPreviewData
  onAddCompetitor?: (competitor: SuggestedCompetitor) => void
  onSourceToggle?: (source: SuggestedSource, enabled: boolean) => void
  enabledSources?: Set<string>
}

export function TavilyPreview({
  data,
  onAddCompetitor,
  onSourceToggle,
  enabledSources = new Set(),
}: TavilyPreviewProps) {
  const [expandedSources, setExpandedSources] = useState(false)

  const sourceTypeLabels: Record<SuggestedSource['type'], string> = {
    pricing: 'Pricing',
    docs: 'Documentation',
    changelog: 'Changelog',
    jobs: 'Careers',
    status: 'Status',
    integrations: 'Integrations',
    reviews: 'Reviews',
    blog: 'Blog',
    other: 'Other',
  }

  return (
    <SurfaceCard className="p-6 space-y-6">
      {/* Site Identity */}
      <div className="flex items-start gap-4">
        {data.site.faviconUrl ? (
          <img
            src={data.site.faviconUrl}
            alt=""
            className="w-12 h-12 rounded border border-border"
            onError={(e) => {
              // Fallback to globe icon if favicon fails to load
              e.currentTarget.style.display = 'none'
            }}
          />
        ) : (
          <div className="w-12 h-12 rounded border border-border flex items-center justify-center bg-muted">
            <Globe className="h-6 w-6 text-muted-foreground" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground truncate">
            {data.site.title || data.site.domain}
          </h3>
          <p className="text-sm text-muted-foreground truncate">{data.site.domain}</p>
        </div>
      </div>

      {/* Summary */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <h4 className="text-sm font-semibold text-foreground">What we think this is</h4>
        </div>
        <p className="text-sm text-foreground">{data.summary.oneLiner}</p>
        {data.summary.bullets.length > 0 && (
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 ml-2">
            {data.summary.bullets.map((bullet, idx) => (
              <li key={idx}>{bullet}</li>
            ))}
          </ul>
        )}
        <Badge variant="secondary" className="mt-2">
          Confidence: {data.summary.confidence}
        </Badge>
      </div>

      {/* Suggested Sources */}
      {data.suggestedSources.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-foreground">Sources we'll scan</h4>
            {data.suggestedSources.length > 3 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setExpandedSources(!expandedSources)}
              >
                {expandedSources ? 'Show less' : `Show all (${data.suggestedSources.length})`}
              </Button>
            )}
          </div>
          <div className="space-y-2">
            {(expandedSources ? data.suggestedSources : data.suggestedSources.slice(0, 3)).map(
              (source) => {
                const isEnabled = enabledSources.has(source.url) || enabledSources.size === 0
                return (
                  <label
                    key={source.url}
                    className="flex items-center gap-3 p-2 rounded border border-border hover:bg-muted/50 cursor-pointer group"
                  >
                    <input
                      type="checkbox"
                      checked={isEnabled}
                      onChange={(e) => onSourceToggle?.(source, e.target.checked)}
                      className="h-4 w-4 border-border text-primary focus:ring-2 focus:ring-ring"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-foreground">{source.label}</span>
                        <Badge variant="secondary" className="text-xs">
                          {sourceTypeLabels[source.type]}
                        </Badge>
                      </div>
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-xs text-muted-foreground hover:text-foreground truncate block"
                      >
                        {source.url}
                      </a>
                    </div>
                    <ExternalLink className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                  </label>
                )
              }
            )}
          </div>
        </div>
      )}

      {/* Suggested Competitors */}
      {data.suggestedCompetitors.length > 0 && (
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-foreground">Recommended competitors</h4>
          <div className="space-y-2">
            {data.suggestedCompetitors.map((competitor) => (
              <div
                key={competitor.url}
                className="flex items-start gap-3 p-3 rounded border border-border bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-foreground">{competitor.name}</span>
                    <a
                      href={competitor.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {competitor.rationale}
                  </p>
                </div>
                {onAddCompetitor && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onAddCompetitor(competitor)}
                  >
                    Add
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </SurfaceCard>
  )
}

interface TavilyPreviewLoadingProps {
  message?: string
}

export function TavilyPreviewLoading({ message = 'Analyzing site...' }: TavilyPreviewLoadingProps) {
  return (
    <SurfaceCard className="p-6">
      <div className="flex items-center gap-3">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
    </SurfaceCard>
  )
}

interface TavilyPreviewErrorProps {
  error: 'TAVILY_NOT_CONFIGURED' | 'INVALID_URL' | 'TAVILY_ERROR' | 'UNAUTHORIZED' | 'INTERNAL_ERROR'
  message: string
  onRetry?: () => void
}

export function TavilyPreviewError({ error, message, onRetry }: TavilyPreviewErrorProps) {
  if (error === 'TAVILY_NOT_CONFIGURED') {
    return (
      <SurfaceCard className="p-6 border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-foreground mb-1">
              Tavily not configured
            </p>
            <p className="text-xs text-muted-foreground">
              {message}. You can still continue manually by adding competitors and sources yourself.
            </p>
          </div>
        </div>
      </SurfaceCard>
    )
  }

  return (
    <SurfaceCard className="p-6 border-destructive/20 bg-destructive/10">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-sm font-medium text-destructive mb-1">Failed to analyze site</p>
          <p className="text-xs text-muted-foreground mb-3">{message}</p>
          {onRetry && (
            <Button type="button" variant="outline" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    </SurfaceCard>
  )
}

