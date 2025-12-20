'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { InlineError } from '@/components/common/InlineError'

interface GenerateResultsV2ButtonProps {
  projectId: string
  label?: string
}

type GenerateResultsV2Response =
  | { ok: true; runId: string; artifactIds: string[]; signals: unknown }
  | { ok: false; error: { code: string; message: string } }

export function GenerateResultsV2Button({
  projectId,
  label = 'Generate Results',
}: GenerateResultsV2ButtonProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleClick = () => {
    if (isPending) return

    setError(null)

    startTransition(async () => {
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
          router.refresh()
        } else {
          setError(result.error.message)
        }
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Unexpected error while generating results.'
        setError(message)
      }
    })
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
          <InlineError message={error} />
        </div>
      )}
    </div>
  )
}

