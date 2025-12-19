'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MAX_EVIDENCE_CHARS } from '@/lib/constants'
import type { Competitor } from '@/lib/supabase/types'
import { cn } from '@/lib/utils'
import { updateCompetitorForProject } from '@/app/projects/[projectId]/competitors/actions'

interface EditCompetitorDialogProps {
  projectId: string
  competitor: Competitor
}

type EvidenceQuality = 'empty' | 'too-short' | 'good' | 'long'

function getEvidenceQuality(length: number): EvidenceQuality {
  if (length === 0) return 'empty'
  if (length < 400) return 'too-short'
  if (length <= 4000) return 'good'
  return 'long'
}

export function EditCompetitorDialog({
  projectId,
  competitor,
}: EditCompetitorDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState(competitor.name)
  const [website, setWebsite] = useState(competitor.url ?? '')
  const [evidence, setEvidence] = useState(competitor.evidence_text ?? '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      setName(competitor.name)
      setWebsite(competitor.url ?? '')
      setEvidence(competitor.evidence_text ?? '')
      setError(null)
      setSuccess(null)
    }
  }, [open, competitor])

  const evidenceLength = evidence.length
  const evidenceQuality = getEvidenceQuality(evidenceLength)

  function handleEvidenceChange(value: string) {
    if (value.length <= MAX_EVIDENCE_CHARS) {
      setEvidence(value)
    } else {
      setEvidence(value.slice(0, MAX_EVIDENCE_CHARS))
    }
  }

  function handleTrimWhitespace() {
    setEvidence((prev) =>
      prev
        .replace(/\n{3,}/g, '\n\n')
        .replace(/[ \t]+\n/g, '\n')
        .trim()
    )
  }

  function handleSplitIntoSections() {
    const template = [
      '## Homepage',
      '',
      '',
      '## Pricing',
      '',
      '',
      '## Trust',
      '',
      '',
    ].join('\n')

    setEvidence((prev) => {
      const trimmed = prev.trim()
      if (!trimmed) {
        return template
      }
      return `${template}\n${trimmed}`
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await updateCompetitorForProject(projectId, competitor.id, {
        name,
        website,
        evidence,
      })

      if (!result?.success) {
        setError(
          result?.message ?? 'Unable to update competitor. Please try again.'
        )
      } else {
        setSuccess('Saved.')
        router.refresh()
        setTimeout(() => {
          setOpen(false)
        }, 250)
      }
    } catch (err) {
      // Surface any unexpected client-side or network errors
      setError(
        err instanceof Error
          ? err.message
          : 'Unexpected error while saving changes.'
      )
    } finally {
      setSaving(false)
    }
  }

  const qualityLabel =
    evidenceQuality === 'too-short'
      ? 'Too short – add more context so the model has something to work with.'
      : evidenceQuality === 'good'
      ? 'Good – plenty to work with.'
      : evidenceQuality === 'long'
      ? 'Long – consider trimming to the most relevant sections.'
      : 'Paste homepage, pricing, or feature copy here.'

  const qualityToneClass =
    evidenceQuality === 'too-short' || evidenceQuality === 'long'
      ? 'text-destructive'
      : 'text-text-secondary'

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="px-2 text-xs"
        onClick={() => setOpen(true)}
      >
        Edit
      </Button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 px-4">
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={`edit-competitor-${competitor.id}-title`}
            className="panel w-full max-w-lg px-6 py-5"
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id={`edit-competitor-${competitor.id}-title`}
                  className="text-sm font-semibold"
                >
                  Edit competitor
                </h2>
                <p className="text-xs text-text-secondary">
                  {competitor.name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-2 text-sm text-text-secondary hover:bg-surface-muted"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor={`edit-name-${competitor.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Competitor name<span className="text-destructive">*</span>
                </label>
                <Input
                  id={`edit-name-${competitor.id}`}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={`edit-website-${competitor.id}`}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Website (optional)
                </label>
                <Input
                  id={`edit-website-${competitor.id}`}
                  type="url"
                  value={website}
                  onChange={(event) => setWebsite(event.target.value)}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label
                    htmlFor={`edit-evidence-${competitor.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Evidence<span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleTrimWhitespace}
                      className="text-xs text-text-secondary underline-offset-4 hover:underline"
                    >
                      Trim whitespace
                    </button>
                    <button
                      type="button"
                      onClick={handleSplitIntoSections}
                      className="text-xs text-text-secondary underline-offset-4 hover:underline"
                    >
                      Split into sections
                    </button>
                  </div>
                </div>

                <Textarea
                  id={`edit-evidence-${competitor.id}`}
                  value={evidence}
                  onChange={(event) => handleEvidenceChange(event.target.value)}
                />

                <div className="flex items-center justify-between text-xs">
                  <p className={cn('max-w-xs', qualityToneClass)}>
                    {qualityLabel}
                  </p>
                  <span
                    className={cn(
                      'tabular-nums text-text-secondary',
                      evidenceLength > MAX_EVIDENCE_CHARS && 'text-destructive'
                    )}
                  >
                    {evidenceLength.toLocaleString()} /{' '}
                    {MAX_EVIDENCE_CHARS.toLocaleString()}
                  </span>
                </div>
              </div>

              {error ? (
                <p className="text-sm text-destructive" role="alert">
                  {error}
                </p>
              ) : null}

              {success ? (
                <p className="text-sm text-text-secondary" role="status">
                  {success}
                </p>
              ) : null}

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={saving}>
                  {saving ? 'Saving…' : 'Save changes'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )
}


