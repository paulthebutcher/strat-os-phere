'use client'

import { useState } from 'react'
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
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFind = async () => {
    setIsSearching(true)
    setError(null)

    try {
      const result = await refreshCompetitorSuggestions(projectId)

      if (!result.success) {
        setError(result.message || 'Failed to search for competitors. Please try again.')
        setIsSearching(false)
        return
      }

      // Refresh the page to show new suggestions
      router.refresh()
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to search for competitors. Please try again.'
      )
      setIsSearching(false)
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
      </div>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{error}</p>
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

