'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { refreshCompetitorSuggestions } from '@/app/projects/[projectId]/competitors/actions'
import { useRouter } from 'next/navigation'

interface FindCompetitorsCardProps {
  projectId: string
}

/**
 * Card that allows users to trigger competitor search via Tavily
 */
export function FindCompetitorsCard({ projectId }: FindCompetitorsCardProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const debugParam = searchParams?.get('debug') === '1'
  // In production, only show debug logs if ?debug=1 is present
  // In dev, always show debug logs
  const debugMode = debugParam || (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('localhost')))
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastErrorCode, setLastErrorCode] = useState<string | null>(null)

  const handleFind = async () => {
    setIsSearching(true)
    setError(null)
    setLastErrorCode(null)

    // Debug logging
    if (debugMode) {
      console.log('[plinth] findCompetitors.click', {
        timestamp: new Date().toISOString(),
        projectId,
      })
    }

    try {
      const result = await refreshCompetitorSuggestions(projectId)

      if (!result.ok) {
        setError(result.message || 'Failed to search for competitors. Please try again.')
        setLastErrorCode(result.code || 'UNKNOWN')
        setIsSearching(false)

        // Debug logging for error
        if (debugMode) {
          console.log('[plinth] findCompetitors.error', {
            timestamp: new Date().toISOString(),
            projectId,
            errorCode: result.code,
            traceId: result.traceId,
            message: result.message,
          })
        }
        return
      }

      // Debug logging for success
      if (debugMode) {
        console.log('[plinth] findCompetitors.success', {
          timestamp: new Date().toISOString(),
          projectId,
          traceId: result.traceId,
          namesCount: result.names.length,
          saved: result.saved,
        })
      }

      // Refresh the page to show new suggestions
      router.refresh()
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : 'Failed to search for competitors. Please try again.'
      setError(errorMessage)
      setIsSearching(false)

      // Debug logging for exception
      if (debugMode) {
        console.error('[plinth] findCompetitors.exception', {
          timestamp: new Date().toISOString(),
          projectId,
          error: err instanceof Error ? err.message : String(err),
        })
      }
    }
  }

  return (
    <SurfaceCard className="p-6 space-y-4 border-t-4 border-t-primary/20">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">
          Find competitors automatically
        </h3>
        <p className="text-sm text-muted-foreground">
          We can search for competitors based on your decision context from Step 1.
          This will search the web and suggest relevant companies for your analysis.
        </p>
        <p className="text-xs text-muted-foreground italic">
          We couldn't find strong matches yet—try refining your market/category or add manually.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-3">
          <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
            Couldn't fetch suggested competitors
          </p>
          <p className="text-xs text-yellow-800 dark:text-yellow-200 mt-1">
            {error}
          </p>
          {lastErrorCode === 'NO_RESULTS' && (
            <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1 italic">
              No suggestions found; try broader market/category.
            </p>
          )}
          <div className="flex gap-2 mt-3">
            <Button
              onClick={handleFind}
              variant="outline"
              size="sm"
              disabled={isSearching}
            >
              Try again
            </Button>
          </div>
        </div>
      )}

      <Button
        onClick={handleFind}
        disabled={isSearching}
        className="w-full"
        size="lg"
        variant="brand"
      >
        {isSearching ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Searching the web...
          </>
        ) : (
          <>
            <Search className="h-4 w-4 mr-2" />
            Find competitors
          </>
        )}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        You can also add competitors manually below.
      </p>
    </SurfaceCard>
  )
}

