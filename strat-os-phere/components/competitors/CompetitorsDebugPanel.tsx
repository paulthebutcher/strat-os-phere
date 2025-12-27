'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import type { SuggestionsStatus } from '@/lib/competitors/getCompetitorsPageModel'

interface CompetitorsDebugPanelProps {
  projectId: string
  competitorCount: number
  suggestedNamesCount: number
  suggestionsStatus: SuggestionsStatus
  debugInfo: {
    tavilyKeyConfigured: boolean
    suggestedNamesCount: number
    hasSuggestedNames: boolean
  } | null
}

/**
 * Debug panel for competitors page
 * Only visible when ?debug=1 is in URL OR NODE_ENV !== 'production'
 */
export function CompetitorsDebugPanel({
  projectId,
  competitorCount,
  suggestedNamesCount,
  suggestionsStatus,
  debugInfo,
}: CompetitorsDebugPanelProps) {
  const searchParams = useSearchParams()
  const debugParam = searchParams?.get('debug') === '1'
  // Check if we're in dev mode (localhost or 127.0.0.1)
  const isDev =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.includes('localhost'))
  const showDebug = debugParam || isDev

  // Log to console when debug is enabled (client-side)
  useEffect(() => {
    if (showDebug) {
      console.log('[plinth] competitors.debug mounted', {
        timestamp: new Date().toISOString(),
        projectId,
      })
    }
  }, [showDebug, projectId])

  if (!showDebug) {
    return null
  }

  const errorCode =
    suggestionsStatus.state === 'error' ? suggestionsStatus.code : undefined
  const errorMessage =
    suggestionsStatus.state === 'error' ? suggestionsStatus.message : undefined

  return (
    <SurfaceCard className="p-4 border border-border rounded-lg bg-muted/30">
      <h3 className="text-sm font-semibold mb-3">Debug Info</h3>
      <div className="space-y-2 text-xs font-mono">
        <div>
          <span className="text-muted-foreground">projectId:</span>{' '}
          <span className="text-foreground">{projectId}</span>
        </div>
        <div>
          <span className="text-muted-foreground">competitorCount:</span>{' '}
          <span className="text-foreground">{competitorCount}</span>
        </div>
        <div>
          <span className="text-muted-foreground">suggestionsStatus.state:</span>{' '}
          <span className="text-foreground">{suggestionsStatus.state}</span>
        </div>
        {suggestionsStatus.state === 'error' && (
          <>
            <div>
              <span className="text-muted-foreground">errorCode:</span>{' '}
              <span className="text-foreground">{errorCode || 'unknown'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">errorMessage:</span>{' '}
              <span className="text-foreground">{errorMessage || 'none'}</span>
            </div>
          </>
        )}
        {suggestionsStatus.state === 'ready' && (
          <div>
            <span className="text-muted-foreground">suggestionsCount:</span>{' '}
            <span className="text-foreground">
              {suggestionsStatus.count || suggestedNamesCount}
            </span>
          </div>
        )}
        {debugInfo && (
          <>
            <div>
              <span className="text-muted-foreground">tavilyKeyConfigured:</span>{' '}
              <span className={debugInfo.tavilyKeyConfigured ? 'text-green-600' : 'text-red-600'}>
                {debugInfo.tavilyKeyConfigured ? 'true' : 'false'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">suggestedNamesInInput:</span>{' '}
              <span className="text-foreground">
                {debugInfo.hasSuggestedNames ? `yes (${debugInfo.suggestedNamesCount})` : 'no'}
              </span>
            </div>
          </>
        )}
        <div className="pt-2 mt-2 border-t border-border text-xs text-muted-foreground">
          Note: Check server logs for traceId when errors occur. Last traceId from refresh action
          will be logged server-side with event="competitors.refresh".
        </div>
      </div>
    </SurfaceCard>
  )
}

