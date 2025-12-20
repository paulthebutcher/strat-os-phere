'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { InlineError } from '@/components/common/InlineError'
import type { ProgressEvent } from '@/lib/results/progress'

interface GenerateResultsV2ButtonProps {
  projectId: string
  label?: string
}

export function GenerateResultsV2Button({
  projectId,
  label = 'Generate Results',
}: GenerateResultsV2ButtonProps) {
  const router = useRouter()
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<ProgressEvent | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)

  useEffect(() => {
    // Cleanup on unmount
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close()
      }
    }
  }, [])

  const handleClick = () => {
    if (isGenerating) return

    setError(null)
    setProgress(null)
    setIsGenerating(true)

    // Try SSE first
    try {
      const streamUrl = `/api/results/generate-v2/stream?projectId=${encodeURIComponent(projectId)}`
      const eventSource = new EventSource(streamUrl)

      eventSourceRef.current = eventSource

      eventSource.addEventListener('progress', (event) => {
        try {
          const progressEvent: ProgressEvent = JSON.parse(event.data)
          setProgress(progressEvent)
        } catch (err) {
          console.error('Failed to parse progress event:', err)
        }
      })

      eventSource.addEventListener('complete', (event) => {
        try {
          const data = JSON.parse(event.data)
          eventSource.close()
          eventSourceRef.current = null
          setIsGenerating(false)
          setProgress(null)
          router.refresh()
        } catch (err) {
          console.error('Failed to parse completion event:', err)
          setError('Generation completed but failed to parse response')
          setIsGenerating(false)
        }
      })

      eventSource.addEventListener('error', (event) => {
        try {
          const messageEvent = event as MessageEvent
          if (messageEvent.data) {
            const data = JSON.parse(messageEvent.data)
            setError(data.error?.message || 'Generation failed')
            setIsGenerating(false)
            eventSource.close()
            eventSourceRef.current = null
          }
        } catch (err) {
          // If parsing fails, check if it's a connection error
          if (eventSource.readyState === EventSource.CLOSED) {
            // Connection closed - might be normal completion or error
            // Don't treat as error if we got a complete event
            return
          }
          // Otherwise fallback to POST
          eventSource.close()
          eventSourceRef.current = null
          fallbackToPost()
        }
      })

      eventSource.onerror = () => {
        // Connection error - only fallback if not already closed
        if (eventSource.readyState !== EventSource.CLOSED) {
          eventSource.close()
          eventSourceRef.current = null
          fallbackToPost()
        }
      }
    } catch (err) {
      // If EventSource is not supported, fallback to POST
      fallbackToPost()
    }
  }

  const fallbackToPost = async () => {
    try {
      const response = await fetch('/api/results/generate-v2', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectId }),
      })

      const result = await response.json()

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
    } finally {
      setIsGenerating(false)
    }
  }

  const handleCancel = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsGenerating(false)
    setProgress(null)
  }

  const formatStepCount = (event: ProgressEvent | null): string | null => {
    if (!event?.meta) return null

    const { llmCallsDone, llmCallsTotal, writesDone, writesTotal } = event.meta

    if (llmCallsDone !== undefined && llmCallsTotal !== undefined) {
      return `(${llmCallsDone}/${llmCallsTotal})`
    }

    if (writesDone !== undefined && writesTotal !== undefined) {
      return `(${writesDone}/${writesTotal})`
    }

    return null
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isGenerating}
          onClick={isGenerating ? handleCancel : handleClick}
        >
          {isGenerating ? 'Stop listening' : label}
        </Button>
        {isGenerating && (
          <a
            href="#progress-info"
            className="text-xs text-text-secondary underline hover:text-text-primary"
            onClick={(e) => {
              e.preventDefault()
              // Simple alert for now - can be replaced with popover
              alert(
                'We generate structured outputs (Jobs, Scorecard, Opportunities), validate them with strict schemas, compute deterministic scores, and save artifacts so results persist and can be copied/shared.'
              )
            }}
          >
            What&apos;s happening?
          </a>
        )}
      </div>

      {isGenerating && progress && (
        <div className="w-full max-w-xs space-y-1">
          <div className="text-sm font-medium text-text-primary">
            {progress.message}
            {formatStepCount(progress) && (
              <span className="ml-1 text-xs text-text-secondary">
                {formatStepCount(progress)}
              </span>
            )}
          </div>
          {progress.detail && (
            <div className="text-xs text-text-secondary">{progress.detail}</div>
          )}
        </div>
      )}

      {error && (
        <div className="w-full max-w-xs">
          <InlineError message={error} />
        </div>
      )}
    </div>
  )
}

