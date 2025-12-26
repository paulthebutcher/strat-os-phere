'use client'

import { useState } from 'react'
import { CheckCircle2, Circle, Loader2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SurfaceCard } from '@/components/ui/SurfaceCard'
import { confirmSuggestedCompetitors } from '@/app/projects/[projectId]/competitors/actions'
import { useRouter } from 'next/navigation'

interface SuggestedCompetitorsPanelProps {
  projectId: string
  suggestedNames: string[]
  onConfirmed?: () => void
}

/**
 * Panel showing suggested competitor names (names only, no URLs)
 * Requires explicit user confirmation before resolving URLs and creating competitors
 */
export function SuggestedCompetitorsPanel({
  projectId,
  suggestedNames,
  onConfirmed,
}: SuggestedCompetitorsPanelProps) {
  const router = useRouter()
  const [selectedNames, setSelectedNames] = useState<Set<string>>(
    new Set(suggestedNames) // Default: all selected
  )
  const [isConfirming, setIsConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleToggle = (name: string) => {
    setSelectedNames((prev) => {
      const updated = new Set(prev)
      if (updated.has(name)) {
        updated.delete(name)
      } else {
        updated.add(name)
      }
      return updated
    })
    setError(null)
  }

  const handleConfirm = async () => {
    if (selectedNames.size === 0) {
      setError('Please select at least one competitor to continue.')
      return
    }

    setIsConfirming(true)
    setError(null)

    try {
      const result = await confirmSuggestedCompetitors(
        projectId,
        Array.from(selectedNames)
      )

      if (!result.success) {
        setError(result.message || 'Failed to add competitors. Please try again.')
        setIsConfirming(false)
        return
      }

      // Refresh the page to show the newly created competitors
      router.refresh()
      if (onConfirmed) {
        onConfirmed()
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to add competitors. Please try again.'
      )
      setIsConfirming(false)
    }
  }

  if (suggestedNames.length === 0) {
    return null
  }

  return (
    <SurfaceCard className="p-6 space-y-4 border-t-4 border-t-primary/20">
      <div className="space-y-2">
        <h3 className="text-base font-semibold text-foreground">
          Suggested competitors
        </h3>
        <p className="text-sm text-muted-foreground">
          Based on your analysis context, we suggest these companies for comparison.
          Review and select the ones you want to include. You can add or remove
          competitors later.
        </p>
        <p className="text-xs text-muted-foreground italic">
          These are suggestions, not selections. URLs will be resolved after you confirm.
        </p>
      </div>

      {/* Suggested competitors list */}
      <div className="space-y-2">
        {suggestedNames.map((name) => {
          const isSelected = selectedNames.has(name)
          return (
            <div
              key={name}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer ${
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:bg-muted/30'
              }`}
              onClick={() => handleToggle(name)}
            >
              <div className="flex-shrink-0">
                {isSelected ? (
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{name}</p>
              </div>
            </div>
          )
        })}
      </div>

      {/* Error message */}
      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3">
          <p className="text-sm font-medium text-destructive">{error}</p>
        </div>
      )}

      {/* Confirm button */}
      <div className="pt-2 border-t border-border">
        <Button
          onClick={handleConfirm}
          disabled={isConfirming || selectedNames.size === 0}
          className="w-full"
          size="lg"
          variant="brand"
        >
          {isConfirming ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Adding competitors...
            </>
          ) : (
            <>
              Confirm {selectedNames.size} competitor{selectedNames.size !== 1 ? 's' : ''}
            </>
          )}
        </Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          After confirmation, we'll resolve URLs and add these competitors to your analysis.
        </p>
      </div>
    </SurfaceCard>
  )
}

