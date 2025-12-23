'use client'

import * as React from 'react'
import { FollowUpQuestionCard } from './FollowUpQuestionCard'
import { FLAGS } from '@/lib/flags'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'
import type { ClaimsBundle } from '@/lib/claims/types'
import type { FollowUpQuestion } from '@/lib/followup/types'
import { generateFollowUpQuestion } from '@/lib/followup/generate'

interface FollowUpQuestionWrapperProps {
  projectId: string
  evidenceBundle: NormalizedEvidenceBundle | null
  claimsBundle: ClaimsBundle | null
  hasCompletedRun: boolean
}

export function FollowUpQuestionWrapper({
  projectId,
  evidenceBundle,
  claimsBundle,
  hasCompletedRun,
}: FollowUpQuestionWrapperProps) {
  const [question, setQuestion] = React.useState<FollowUpQuestion | null>(null)
  const [hasAnswered, setHasAnswered] = React.useState(false)
  const [isDismissed, setIsDismissed] = React.useState(false)

  // Check if feature is enabled
  if (!FLAGS.followupEnabled) {
    return null
  }

  // Only show if run has completed
  if (!hasCompletedRun) {
    return null
  }

  // Generate question on mount
  React.useEffect(() => {
    if (!question && !hasAnswered && !isDismissed && evidenceBundle) {
      // Fetch claims if needed (if feature is enabled)
      const fetchClaimsAndGenerate = async () => {
        let claims: ClaimsBundle | null = claimsBundle
        if (!claims && FLAGS.claimsEnabled) {
          try {
            const response = await fetch('/api/claims/generate', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ projectId }),
            })
            if (response.ok) {
              claims = await response.json()
            }
          } catch (error) {
            console.error('Error fetching claims for follow-up:', error)
          }
        }
        const generated = generateFollowUpQuestion(evidenceBundle, claims)
        setQuestion(generated)
      }
      fetchClaimsAndGenerate()
    }
  }, [evidenceBundle, claimsBundle, question, hasAnswered, isDismissed, projectId])

  if (!question || hasAnswered || isDismissed) {
    return null
  }

  const handleApply = () => {
    setHasAnswered(true)
    // Show confirmation
    setTimeout(() => {
      setIsDismissed(true)
    }, 2000)
  }

  const handleSkip = () => {
    setIsDismissed(true)
  }

  return (
    <div className="mb-6">
      <FollowUpQuestionCard
        question={question}
        projectId={projectId}
        onApply={handleApply}
        onSkip={handleSkip}
      />
      {hasAnswered && (
        <div className="mt-2 text-sm text-muted-foreground">
          Applied. Next run will incorporate this.
        </div>
      )}
    </div>
  )
}

