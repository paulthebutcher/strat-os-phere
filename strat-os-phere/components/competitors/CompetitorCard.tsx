'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { EditCompetitorDialog } from '@/components/competitors/EditCompetitorDialog'
import { Button } from '@/components/ui/button'
import { MIN_COMPETITORS_FOR_ANALYSIS } from '@/lib/constants'
import type { Competitor } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'
import { deleteCompetitorForProject } from '@/app/projects/[projectId]/competitors/actions'

interface CompetitorCardProps {
  projectId: string
  competitor: Competitor
  index: number
  total: number
}

export function CompetitorCard({
  projectId,
  competitor,
  index,
  total,
}: CompetitorCardProps) {
  const router = useRouter()
  const [expanded, setExpanded] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const evidence = competitor.evidence_text ?? ''
  const notes = (competitor as Competitor & { notes?: string | null }).notes
  const previewLimit = 200
  const isTruncated = evidence.length > previewLimit
  const displayEvidence =
    expanded || !isTruncated
      ? evidence
      : `${evidence.slice(0, previewLimit).trimEnd()}…`

  const createdAt = new Date(competitor.created_at)
  const createdLabel = createdAt.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })

  async function handleDelete() {
    setDeleting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await deleteCompetitorForProject(projectId, competitor.id)

      if (!result?.success) {
        setError(
          result?.message ?? 'Unable to delete competitor. Please try again.'
        )
      } else {
        setSuccess('Deleted.')
        router.refresh()
      }
    } catch (err) {
      // Surface any unexpected client-side or network errors
      setError(
        err instanceof Error
          ? err.message
          : 'Unexpected error while deleting competitor.'
      )
    } finally {
      setDeleting(false)
    }
  }

  const showAnalysisHint =
    total < MIN_COMPETITORS_FOR_ANALYSIS && index === total - 1

  return (
    <article className="px-4 py-3">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-medium">{competitor.name}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            {competitor.url ? (
              <a
                href={competitor.url}
                target="_blank"
                rel="noreferrer"
                className="truncate underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded"
              >
                {competitor.url}
              </a>
            ) : null}
            <span className="text-muted-foreground">
              Added {createdLabel}
            </span>
            {competitor.url && (
              <span className="text-muted-foreground">
                · Queued for scanning
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <EditCompetitorDialog projectId={projectId} competitor={competitor} />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2 text-xs text-destructive hover:text-destructive"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting…' : 'Delete'}
          </Button>
        </div>
      </div>

      {evidence ? (
        <div className="mt-3 space-y-2">
          <p className="whitespace-pre-wrap text-xs text-foreground/80">
            {displayEvidence}
          </p>
          {isTruncated ? (
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              className="text-xs font-medium text-text-secondary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              aria-expanded={expanded}
            >
              {expanded ? 'Show less' : 'Show more'}
            </button>
          ) : null}
        </div>
      ) : null}

      {notes ? (
        <p className="mt-2 rounded-md bg-surface-muted px-3 py-2 text-xs text-muted-foreground">
          {notes}
        </p>
      ) : null}

      {showAnalysisHint ? (
        <p className="mt-2 text-xs text-muted-foreground">
          Add {MIN_COMPETITORS_FOR_ANALYSIS - total} more competitor
          {MIN_COMPETITORS_FOR_ANALYSIS - total === 1 ? '' : 's'} to generate an
          analysis.
        </p>
      ) : null}

      {error ? (
        <p className="mt-2 text-xs text-destructive" role="alert" aria-live="assertive">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="mt-2 text-xs text-text-secondary" role="status" aria-live="polite">
          {success}
        </p>
      ) : null}
    </article>
  )
}


