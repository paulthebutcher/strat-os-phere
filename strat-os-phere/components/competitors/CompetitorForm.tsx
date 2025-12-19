'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { EvidenceHelpers } from '@/components/competitors/EvidenceHelpers'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  MAX_COMPETITORS_PER_PROJECT,
  MAX_EVIDENCE_CHARS,
} from '@/lib/constants'
import { cn } from '@/lib/utils'
import { createCompetitorForProject } from '@/app/projects/[projectId]/competitors/actions'

function ConfidentialInfoDisclosure() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="text-xs text-text-secondary underline-offset-4 hover:underline"
      >
        Why?
      </button>
      {isOpen && (
        <p className="mt-1 text-xs text-text-secondary">
          We use this text to generate summaries. Keep it public to avoid risk.
        </p>
      )}
    </div>
  )
}

interface CompetitorFormProps {
  projectId: string
  existingCount: number
}

type EvidenceQuality = 'empty' | 'too-short' | 'good' | 'long'

function getEvidenceQuality(length: number): EvidenceQuality {
  if (length === 0) return 'empty'
  if (length < 400) return 'too-short'
  if (length <= 4000) return 'good'
  return 'long'
}

export function CompetitorForm({
  projectId,
  existingCount,
}: CompetitorFormProps) {
  const router = useRouter()
  const storageKey = `competitor-form-draft-${projectId}`
  
  // Load draft from localStorage on mount
  const [name, setName] = useState('')
  const [website, setWebsite] = useState('')
  const [evidence, setEvidence] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey)
      if (saved) {
        const draft = JSON.parse(saved)
        if (draft.name) setName(draft.name)
        if (draft.website) setWebsite(draft.website)
        if (draft.evidence) setEvidence(draft.evidence)
      }
    } catch {
      // Ignore localStorage errors
    }
  }, [storageKey])

  // Save draft to localStorage whenever form fields change
  useEffect(() => {
    if (name || website || evidence) {
      try {
        localStorage.setItem(
          storageKey,
          JSON.stringify({ name, website, evidence })
        )
      } catch {
        // Ignore localStorage errors
      }
    } else {
      try {
        localStorage.removeItem(storageKey)
      } catch {
        // Ignore localStorage errors
      }
    }
  }, [name, website, evidence, storageKey])

  const competitorsRemaining = Math.max(
    0,
    MAX_COMPETITORS_PER_PROJECT - existingCount
  )
  const isAtCap = competitorsRemaining === 0

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

    if (isAtCap) {
      setError(
        `You already have ${MAX_COMPETITORS_PER_PROJECT} competitors for this analysis. Delete one to add another.`
      )
      return
    }

    setSubmitting(true)
    setError(null)
    setSuccess(null)

    try {
      const result = await createCompetitorForProject(projectId, {
        name,
        website,
        evidence,
      })

      if (!result?.success) {
        setError(
          result?.message ?? 'Unable to add competitor. Please try again.'
        )
      } else {
        setSuccess('Competitor added.')
        setName('')
        setWebsite('')
        setEvidence('')
        // Clear draft from localStorage on successful submit
        try {
          localStorage.removeItem(storageKey)
        } catch {
          // Ignore localStorage errors
        }
        router.refresh()
      }
    } catch (err) {
      // Surface any unexpected client-side or network errors
      setError(
        err instanceof Error
          ? err.message
          : 'Unexpected error while adding the competitor.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const isFirstCompetitor = existingCount === 0

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
    <section className="panel px-6 py-5">
      <header className="mb-5 space-y-2">
        <p className="text-xs uppercase tracking-wide text-text-secondary">
          Step 2
        </p>
        <h2 className="text-lg font-semibold">
          {isFirstCompetitor
            ? 'Add competitors to map the landscape'
            : 'Add another competitor'}
        </h2>
        {isFirstCompetitor ? (
          <div className="space-y-2">
            <p className="text-sm text-text-secondary">
              Add a handful of real alternatives so the analysis has something
              concrete to compare against.
            </p>
            <ul className="list-disc space-y-1 pl-5 text-xs text-text-secondary">
              <li>Add 3–7 competitors</li>
              <li>Paste public homepage, pricing, or feature copy</li>
              <li>Generate an exec-ready landscape summary</li>
            </ul>
            <EvidenceHelpers className="mt-2" />
          </div>
        ) : (
          <p className="text-sm text-text-secondary">
            You can add up to {MAX_COMPETITORS_PER_PROJECT} competitors per
            analysis. Remaining slots: {competitorsRemaining}.
          </p>
        )}
      </header>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label
            htmlFor="competitor-name"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Competitor name<span className="text-destructive">*</span>
          </label>
          <Input
            id="competitor-name"
            name="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Acme Analytics"
            required
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="competitor-website"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            Website (optional)
          </label>
          <Input
            id="competitor-website"
            name="website"
            type="url"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2">
            <label
              htmlFor="competitor-evidence"
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
            id="competitor-evidence"
            name="evidence"
            value={evidence}
            onChange={(event) => handleEvidenceChange(event.target.value)}
            placeholder="Paste key marketing copy, pricing details, or a feature overview."
          />

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <p className={cn('max-w-xs', qualityToneClass)}>{qualityLabel}</p>
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
            <div className="space-y-1">
              <p className="text-xs text-text-secondary">
                Paste public website text only. Don't paste confidential or customer data.
              </p>
              <ConfidentialInfoDisclosure />
            </div>
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

        <div className="flex items-center justify-between gap-4 pt-2">
          <p className="text-xs text-text-secondary">
            <span className="text-destructive">*</span> Required fields
          </p>
          <Button type="submit" disabled={submitting || isAtCap}>
            {submitting ? 'Adding…' : 'Add competitor'}
          </Button>
        </div>
      </form>
    </section>
  )
}


