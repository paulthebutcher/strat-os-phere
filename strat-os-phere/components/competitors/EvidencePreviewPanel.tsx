'use client'

import { useEffect, useState } from 'react'
import { Loader2, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import type { EvidenceSource } from '@/lib/supabase/types'

interface EvidencePreviewPanelProps {
  projectId: string
  competitorCount: number
  competitors: Array<{ id: string; name: string; url: string | null }>
}

type EvidenceState = 'ready' | 'collecting' | 'partial' | 'sufficient'

interface EvidenceStats {
  totalSources: number
  competitorsCovered: number
  sourcesByType: Record<string, number>
  recentSources: Array<{
    url: string
    title: string
    type: string
    domain: string
  }>
}

/**
 * Evidence Preview Panel - Shows evidence collection progress on Step 2
 * Makes the evidence collection process visible and builds trust
 */
export function EvidencePreviewPanel({
  projectId,
  competitorCount,
  competitors,
}: EvidencePreviewPanelProps) {
  const [state, setState] = useState<EvidenceState>('ready')
  const [stats, setStats] = useState<EvidenceStats>({
    totalSources: 0,
    competitorsCovered: 0,
    sourcesByType: {},
    recentSources: [],
  })
  const [isPolling, setIsPolling] = useState(false)
  const [collectionStarted, setCollectionStarted] = useState(false)

  // Poll for evidence sources
  useEffect(() => {
    if (competitorCount === 0) return

    let pollInterval: NodeJS.Timeout | null = null

    const pollEvidence = async () => {
      try {
        const supabase = createClient()
        const { data: sources, error } = await supabase
          .from('evidence_sources')
          .select('*')
          .eq('project_id', projectId)
          .order('extracted_at', { ascending: false })
          .limit(50)

        if (error) {
          console.error('[EvidencePreviewPanel] Error fetching sources:', error)
          return
        }

        const evidenceSources = (sources || []) as EvidenceSource[]
        const totalSources = evidenceSources.length

        // Count unique competitors covered
        const competitorIds = new Set(
          evidenceSources
            .map((s) => s.competitor_id)
            .filter((id): id is string => Boolean(id))
        )
        const competitorsCovered = competitorIds.size

        // Group by type
        const sourcesByType: Record<string, number> = {}
        evidenceSources.forEach((source) => {
          const type = source.source_type || 'unknown'
          sourcesByType[type] = (sourcesByType[type] || 0) + 1
        })

        // Get recent sources for display
        const recentSources = evidenceSources.slice(0, 10).map((source) => ({
          url: source.url,
          title: source.page_title || source.url,
          type: source.source_type || 'unknown',
          domain: source.domain || '',
        }))

        setStats({
          totalSources,
          competitorsCovered,
          sourcesByType,
          recentSources,
        })

        // Determine state
        if (totalSources === 0) {
          setState('ready')
        } else if (totalSources < 5 || competitorsCovered < 2) {
          setState('collecting')
        } else if (totalSources >= 5 && totalSources < 15) {
          setState('partial')
        } else {
          setState('sufficient')
        }
      } catch (error) {
        console.error('[EvidencePreviewPanel] Poll error:', error)
      }
    }

    // Initial poll
    pollEvidence()

    // Poll every 3 seconds while collecting or partial
    if (state === 'collecting' || state === 'partial') {
      pollInterval = setInterval(pollEvidence, 3000)
      setIsPolling(true)
    } else {
      setIsPolling(false)
    }

    return () => {
      if (pollInterval) {
        clearInterval(pollInterval)
      }
    }
  }, [projectId, competitorCount, state])

  // Auto-start evidence collection when component mounts and competitors exist
  useEffect(() => {
    if (competitorCount > 0 && !collectionStarted) {
      const startCollection = async () => {
        try {
          const response = await fetch(`/api/projects/${projectId}/collect-evidence`, {
            method: 'POST',
          })

          if (response.ok) {
            setCollectionStarted(true)
            setState('collecting')
          }
        } catch (error) {
          console.error('[EvidencePreviewPanel] Failed to start collection:', error)
        }
      }

      startCollection()
    }
  }, [projectId, competitorCount, collectionStarted])

  const getEvidenceTypeLabel = (type: string): string => {
    const labels: Record<string, string> = {
      pricing: 'Pricing',
      docs: 'Docs',
      changelog: 'Changelog',
      reviews: 'Reviews',
      official_site: 'Official Site',
      status: 'Status',
      jobs: 'Jobs',
      integrations: 'Integrations',
      security_trust: 'Security',
      community: 'Community',
    }
    return labels[type] || type
  }

  return (
    <div className="panel px-6 py-5 space-y-4">
      <div className="space-y-2">
        <h3 className="text-sm font-medium text-text-secondary">
          Evidence building
        </h3>
        {state === 'ready' && (
          <p className="text-xs text-muted-foreground">
            Ready to scan public signals across competitors.
          </p>
        )}
        {state === 'collecting' && (
          <p className="text-xs text-muted-foreground">
            Collecting evidence from public sources…
          </p>
        )}
        {state === 'partial' && (
          <p className="text-xs text-muted-foreground">
            Directional coverage available. More sources will improve confidence.
          </p>
        )}
        {state === 'sufficient' && (
          <p className="text-xs text-muted-foreground">
            Evidence sufficient to generate ranked opportunities.
          </p>
        )}
      </div>

      {state === 'ready' && (
        <div className="space-y-3">
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-secondary">What we look at:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Pricing pages</li>
              <li>Documentation</li>
              <li>Reviews and changelogs</li>
              <li>Public announcements</li>
            </ul>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-text-secondary">Why this matters:</p>
            <p className="text-xs text-muted-foreground">
              Grounding recommendations in real signals stabilizes confidence and improves ranking accuracy.
            </p>
          </div>
        </div>
      )}

      {(state === 'collecting' || state === 'partial') && (
        <div className="space-y-3">
          {isPolling && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="h-3 w-3 animate-spin" />
              <span>Scanning sources…</span>
            </div>
          )}

          {stats.recentSources.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-text-secondary">
                Sources found ({stats.totalSources}):
              </p>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {stats.recentSources.map((source, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-xs p-2 rounded border border-border-subtle bg-surface-muted/50"
                  >
                    <ExternalLink className="h-3 w-3 mt-0.5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground truncate">
                          {source.title}
                        </span>
                        <span className="text-muted-foreground shrink-0">
                          {getEvidenceTypeLabel(source.type)}
                        </span>
                      </div>
                      <div className="text-muted-foreground truncate text-[10px] mt-0.5">
                        {source.domain}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {state === 'partial' && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <AlertCircle className="h-3 w-3" />
              <span>
                Competitors covered: {stats.competitorsCovered} / {competitorCount} · Sources: {stats.totalSources} · Confidence: directional
              </span>
            </div>
          )}
        </div>
      )}

      {state === 'sufficient' && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CheckCircle2 className="h-3 w-3 text-primary" />
            <span>
              {stats.competitorsCovered} competitors covered · {stats.totalSources} sources collected
            </span>
          </div>
          {Object.keys(stats.sourcesByType).length > 0 && (
            <div className="flex flex-wrap gap-2">
              {Object.entries(stats.sourcesByType).map(([type, count]) => (
                <span
                  key={type}
                  className="text-xs px-2 py-1 rounded bg-surface-muted text-muted-foreground"
                >
                  {getEvidenceTypeLabel(type)}: {count}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

