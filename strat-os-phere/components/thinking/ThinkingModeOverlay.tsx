'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  type ThinkingStageId,
  getThinkingStage,
  getThinkingStageIndex,
  getStageProgress,
  mapBackendPhaseToStage,
  THINKING_STAGES,
} from '@/lib/ui/thinkingStages'
import type { AnalysisRunState } from '@/lib/results/runState'

interface ThinkingModeOverlayProps {
  isOpen: boolean
  stageId?: ThinkingStageId
  currentState?: AnalysisRunState
  primaryMessage?: string
  secondaryMessage?: string
  startedAt?: number
  onClose?: () => void
  onViewResults?: () => void
  allowBackgroundClose?: boolean
  error?: {
    message: string
    actionLabel?: string
    onAction?: () => void
  } | null
  completed?: boolean
}

/**
 * Full-screen "Thinking Mode" overlay that shows narrative progress during analysis generation
 * Replaces competitors/results view while analysis is running
 */
export function ThinkingModeOverlay({
  isOpen,
  stageId,
  currentState,
  primaryMessage,
  secondaryMessage,
  startedAt,
  onClose,
  onViewResults,
  allowBackgroundClose = false,
  error,
  completed = false,
}: ThinkingModeOverlayProps) {
  const router = useRouter()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const overlayRef = useRef<HTMLDivElement>(null)
  const announceRef = useRef<HTMLDivElement>(null)

  // Check for reduced motion preference
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Determine current stage
  const effectiveStageId: ThinkingStageId =
    stageId || mapBackendPhaseToStage(primaryMessage, currentState) || 'gathering_inputs'
  const stage = getThinkingStage(effectiveStageId)
  const stageIndex = getThinkingStageIndex(effectiveStageId)
  const progress = completed ? 100 : getStageProgress(effectiveStageId)

  // Announce stage changes to screen readers
  useEffect(() => {
    if (announceRef.current && isOpen) {
      announceRef.current.textContent = stage.title
    }
  }, [stage.title, isOpen])

  // Focus trap
  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && allowBackgroundClose && onClose) {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, allowBackgroundClose, onClose])

  if (!isOpen) return null

  // Error state
  if (error) {
    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="thinking-error-title"
      >
        <div className="w-full max-w-2xl px-6 py-12">
          <div className="mx-auto max-w-lg space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <div className="space-y-2">
              <h1
                id="thinking-error-title"
                className="text-2xl font-semibold text-foreground"
              >
                We hit a snag
              </h1>
              <p className="text-sm text-muted-foreground">
                {error.message ||
                  'Try again, or reduce competitors / evidence to speed things up.'}
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              {error.onAction && (
                <Button onClick={error.onAction} size="lg">
                  {error.actionLabel || 'Try again'}
                </Button>
              )}
              <Button
                onClick={() => router.back()}
                variant="outline"
                size="lg"
              >
                Back to competitors
              </Button>
            </div>
          </div>
        </div>
        <div
          ref={announceRef}
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        />
      </div>
    )
  }

  // Completed state
  if (completed) {
    return (
      <div
        ref={overlayRef}
        className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
        role="dialog"
        aria-modal="true"
        aria-labelledby="thinking-complete-title"
      >
        <div className="w-full max-w-2xl px-6 py-12">
          <div className="mx-auto max-w-lg space-y-6 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-8 w-8 text-success" />
            </div>
            <div className="space-y-2">
              <h1
                id="thinking-complete-title"
                className="text-2xl font-semibold text-foreground"
              >
                Analysis ready
              </h1>
              <p className="text-sm text-muted-foreground">
                We distilled the market into a few bets you can defend in a room
                of skeptics.
              </p>
            </div>
            {onViewResults ? (
              <div className="flex justify-center">
                <Button onClick={onViewResults} size="lg">
                  View analysis
                </Button>
              </div>
            ) : null}
          </div>
        </div>
        <div
          ref={announceRef}
          className="sr-only"
          role="status"
          aria-live="polite"
          aria-atomic="true"
        />
      </div>
    )
  }

  // Running state
  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="thinking-title"
    >
      <div className="w-full max-w-2xl px-6 py-12">
        <div className="mx-auto max-w-lg space-y-8">
          {/* Header */}
          <div className="text-center space-y-3">
            <h1
              id="thinking-title"
              className="text-3xl font-semibold text-foreground"
            >
              Reading the market
            </h1>
            <p className="text-base text-muted-foreground">
              {primaryMessage || stage.subtitle}
            </p>
            {secondaryMessage && (
              <p className="text-sm text-muted-foreground italic">
                {secondaryMessage}
              </p>
            )}
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{stage.title}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  'h-full bg-primary transition-all',
                  prefersReducedMotion ? 'transition-none' : 'duration-500 ease-out'
                )}
                style={{ width: `${progress}%` }}
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                role="progressbar"
              />
            </div>
          </div>

          {/* Stage stepper */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <span>Stage {stageIndex + 1} of {THINKING_STAGES.length}</span>
            </div>
            <div className="flex gap-2">
              {THINKING_STAGES.map((stage, idx) => (
                <div
                  key={stage.id}
                  className={cn(
                    'h-1 flex-1 rounded-full transition-all',
                    idx <= stageIndex
                      ? 'bg-primary'
                      : 'bg-muted',
                    prefersReducedMotion ? 'transition-none' : 'duration-300'
                  )}
                  aria-label={idx <= stageIndex ? `Completed: ${stage.title}` : `Pending: ${stage.title}`}
                />
              ))}
            </div>
          </div>

          {/* Hint */}
          <div className="text-center space-y-2 text-xs text-muted-foreground">
            <p>This may take ~1–2 minutes</p>
            <p className="italic">Don't paste confidential info</p>
          </div>
        </div>
      </div>

      {/* Screen reader announcements */}
      <div
        ref={announceRef}
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      />
    </div>
  )
}

