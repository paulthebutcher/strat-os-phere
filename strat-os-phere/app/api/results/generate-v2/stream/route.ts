import { NextRequest } from 'next/server'

import { createClient } from '@/lib/supabase/server'
import { generateResultsV2 } from '@/lib/results/generateV2'
import {
  formatProgressEventSSE,
  formatCompletionEventSSE,
  formatErrorEventSSE,
} from '@/lib/results/progress'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/results/generate-v2/stream?projectId=...
 * SSE endpoint for streaming Results v2 generation progress
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new Response(
      formatErrorEventSSE('', {
        code: 'UNAUTHENTICATED',
        message: 'You must be signed in to generate results.',
      }),
      {
        status: 401,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      }
    )
  }

  const searchParams = request.nextUrl.searchParams
  const projectId = searchParams.get('projectId')

  if (!projectId || typeof projectId !== 'string') {
    return new Response(
      formatErrorEventSSE('', {
        code: 'INVALID_REQUEST',
        message: 'projectId is required',
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
          Connection: 'keep-alive',
        },
      }
    )
  }

  // Create a readable stream for SSE
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder()

      const sendEvent = (data: string) => {
        try {
          controller.enqueue(encoder.encode(data))
        } catch (error) {
          console.error('Error sending SSE event:', error)
        }
      }

      let runId = ''

      try {
        // Send initial event immediately
        const initialEvent = {
          runId: '',
          phase: 'load_input' as const,
          status: 'started' as const,
          message: 'Starting generation...',
          timestamp: new Date().toISOString(),
        }
        sendEvent(formatProgressEventSSE(initialEvent))

        // Generate with progress callback
        const result = await generateResultsV2(projectId, user.id, {
          onProgress: (event) => {
            if (!runId) runId = event.runId // Track runId from first progress event
            sendEvent(formatProgressEventSSE(event))
          },
        })

        if (result.ok) {
          sendEvent(
            formatCompletionEventSSE(result.runId, result.artifactIds, result.signals)
          )
        } else {
          // Determine error kind from error code
          const kind = result.error.code === 'MISSING_COMPETITOR_PROFILES' ||
                      result.error.code === 'NO_SNAPSHOTS'
            ? 'blocked' as const
            : 'failed' as const
          sendEvent(formatErrorEventSSE(runId || '', result.error, kind))
        }
      } catch (error) {
        sendEvent(
          formatErrorEventSSE('', {
            code: 'INTERNAL_ERROR',
            message:
              error instanceof Error ? error.message : 'An unexpected error occurred',
          })
        )
      } finally {
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no', // Disable buffering in nginx
    },
  })
}

