'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { InlineError } from '@/components/common/InlineError'

interface RegenerateButtonProps {
  projectId: string
  label?: string
  competitorCount?: number
}

type GenerateResultsV2Response =
  | { ok: true; runId: string; artifactIds: string[]; signals: unknown }
  | { ok: false; error: { code: string; message: string } }

/**
 * RegenerateButton now uses the v2 generator endpoint.
 * This replaces the legacy v1 generateAnalysis call.
 */
export function RegenerateButton({
  projectId,
  label = 'Regenerate analysis',
  competitorCount = 0,
}: RegenerateButtonProps) {
  const router = useRouter()
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorDetails, setErrorDetails] = useState<Record<string, unknown> | undefined>()

  const handleClick = async () => {
    if (isPending) return

    setError(null)
    setErrorDetails(undefined)
    setIsPending(true)

    try {
      const response = await fetch('/api/results/generate-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      const result: GenerateResultsV2Response = await response.json()

      if (result.ok) {
        // Force refresh to show new artifacts
        router.refresh()
      } else {
        setError(result.error.message)
        setErrorDetails({
          code: result.error.code,
          hint: 'Check browser console or server logs for details (no secrets exposed)',
        })
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unexpected error while regenerating results.'
      setError(message)
      setErrorDetails({
        hint: 'Check browser console or server logs for details',
      })
    } finally {
      setIsPending(false)
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={isPending}
        onClick={handleClick}
      >
        {isPending ? 'Generating…' : label}
      </Button>
      {error && (
        <div className="w-full max-w-xs">
          <InlineError message={error} details={errorDetails} />
        </div>
      )}
    </div>
  )
}


