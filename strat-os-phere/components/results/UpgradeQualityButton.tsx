'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ThinkingModeOverlay } from '@/components/thinking/ThinkingModeOverlay'
import { FLAGS } from '@/lib/flags'

interface UpgradeQualityButtonProps {
  projectId: string
  onSuccess?: () => void
}

/**
 * Upgrade Quality Button - triggers Quality Pack v2 generation
 * Only visible when NEXT_PUBLIC_RESULTS_QUALITY_PACK_V2 flag is enabled
 */
export function UpgradeQualityButton({
  projectId,
  onSuccess,
}: UpgradeQualityButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  // Don't render if flag is off
  if (!FLAGS.resultsQualityPackV2) {
    return null
  }

  const steps = [
    'Indexing evidence',
    'Testing differentiation',
    'Writing VP-ready bets',
    'Saving artifacts & wiring citations',
  ]

  const handleUpgrade = async () => {
    setIsGenerating(true)
    setError(null)
    setCompleted(false)
    setCurrentStep(0)

    // Simulate step progression
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1
        }
        clearInterval(stepInterval)
        return prev
      })
    }, 1200)

    try {
      const response = await fetch('/api/results/generate-quality-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      const data = await response.json()

      clearInterval(stepInterval)

      if (!response.ok || !data.ok) {
        throw new Error(data.error?.message || 'Failed to generate quality overlay')
      }

      setCompleted(true)
      setCurrentStep(steps.length - 1)

      // Call onSuccess callback after a short delay
      setTimeout(() => {
        onSuccess?.()
        setIsGenerating(false)
        setCompleted(false)
        setCurrentStep(0)
      }, 2000)
    } catch (err) {
      clearInterval(stepInterval)
      setError(
        err instanceof Error ? err.message : 'An unexpected error occurred'
      )
      setIsGenerating(false)
    }
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleUpgrade}
        disabled={isGenerating}
      >
        {isGenerating ? 'Improving...' : 'Improve opportunities (beta)'}
      </Button>

      <ThinkingModeOverlay
        isOpen={isGenerating}
        primaryMessage={
          isGenerating && currentStep < steps.length
            ? steps[currentStep]
            : completed
            ? 'Quality overlay ready'
            : undefined
        }
        secondaryMessage={
          completed
            ? 'View updated opportunities'
            : 'This may take ~30-60 seconds'
        }
        completed={completed}
        error={error ? { message: error } : null}
        onClose={() => {
          setIsGenerating(false)
          setError(null)
          setCompleted(false)
          setCurrentStep(0)
        }}
        onViewResults={() => {
          setIsGenerating(false)
          setCompleted(false)
          setCurrentStep(0)
          onSuccess?.()
        }}
      />
    </>
  )
}

