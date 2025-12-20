'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { InlineError } from '@/components/common/InlineError'
import { ThinkingMode } from './ThinkingMode'
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
  const [isComplete, setIsComplete] = useState(false)
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
    setIsComplete(false)
    setIsGenerating(true)

    // Clear the progressive reveal flag so animation plays again for new results
    try {
      sessionStorage.removeItem('progressive-reveal-shown')
    } catch {
      // Ignore sessionStorage errors
    }

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
          setIsComplete(true)
          // Show completion state briefly, then transition
          setTimeout(() => {
            setIsGenerating(false)
            setIsComplete(false)
            setProgress(null)
            router.refresh()
          }, 1500) // 1.5 second delay to show "Strategy Ready"
        } catch (err) {
          console.error('Failed to parse completion event:', err)
          setError('Generation completed but failed to parse response')
          setIsGenerating(false)
          setIsComplete(false)
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
        setIsComplete(true)
        // Show completion state briefly, then transition
        setTimeout(() => {
          setIsGenerating(false)
          setIsComplete(false)
          router.refresh()
        }, 1500)
      } else {
        setError(result.error.message)
        setIsGenerating(false)
        setIsComplete(false)
      }
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unexpected error while generating results.'
      setError(message)
      setIsGenerating(false)
      setIsComplete(false)
    }
  }

  const handleCancel = () => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close()
      eventSourceRef.current = null
    }
    setIsGenerating(false)
    setIsComplete(false)
    setProgress(null)
  }

  // Map progress events to step indices for more accurate progress tracking
  const getStepIndexFromProgress = (progressEvent: ProgressEvent | null): number | undefined => {
    if (!progressEvent?.message) return undefined

    const message = progressEvent.message.toLowerCase()
    
    // Map progress messages to step indices
    if (message.includes('market') || message.includes('synthesis')) return 0
    if (message.includes('competitor') || message.includes('snapshot') || message.includes('profile')) return 1
    if (message.includes('struggle') || message.includes('customer') || message.includes('review')) return 2
    if (message.includes('scoring') || message.includes('scorecard') || message.includes('opportunity')) return 3
    if (message.includes('final') || message.includes('complete') || message.includes('save')) return 4
    
    return undefined
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-end gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={isGenerating}
          onClick={isGenerating ? handleCancel : handleClick}
        >
          {isGenerating ? 'Stop generation' : label}
        </Button>
      </div>

      {isGenerating && (
        <ThinkingMode
          currentStepIndex={getStepIndexFromProgress(progress)}
          isComplete={isComplete}
        />
      )}

      {error && (
        <div className="w-full">
          <InlineError message={error} />
        </div>
      )}
    </div>
  )
}

