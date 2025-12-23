/**
 * Configurable transport layer for run status updates
 * Supports polling (default), SSE (optional), and WebSocket (optional)
 */

export type RunStatusTransport = 'polling' | 'sse' | 'websocket' | 'auto'

// Simple config - can be moved to env vars or feature flags in the future
const RUN_STATUS_TRANSPORT: RunStatusTransport = 'polling'

/**
 * Get the configured transport method
 */
export function getRunStatusTransport(): RunStatusTransport {
  // In the future, this could check env vars or feature flags
  // For now, default to polling
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('plinth_run_status_transport')
    if (stored && ['polling', 'sse', 'websocket', 'auto'].includes(stored)) {
      return stored as RunStatusTransport
    }
  }
  return RUN_STATUS_TRANSPORT
}

/**
 * SSE connection helper (scaffold only - no server implementation required)
 * Fails silently and falls back to polling
 */
export function connectRunStatusSSE(
  projectId: string,
  runId: string,
  onStatusUpdate: (status: unknown) => void
): () => void {
  // Check if transport is enabled
  const transport = getRunStatusTransport()
  if (transport !== 'sse' && transport !== 'auto') {
    // Return no-op cleanup
    return () => {}
  }

  try {
    const eventSource = new EventSource(
      `/api/runs/stream?projectId=${projectId}&runId=${runId}`
    )

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        onStatusUpdate(data)
      } catch (error) {
        console.warn('Failed to parse SSE message:', error)
      }
    }

    eventSource.onerror = (error) => {
      console.warn('SSE connection error:', error)
      eventSource.close()
      // Falls back to polling implicitly - no error thrown
    }

    // Return cleanup function
    return () => {
      eventSource.close()
    }
  } catch (error) {
    // Fails silently - will fall back to polling
    console.warn('SSE not available:', error)
    return () => {}
  }
}

/**
 * WebSocket connection helper (placeholder interface only)
 * No runtime dependency - just a type definition for future implementation
 */
export interface RunStatusWebSocketConfig {
  projectId: string
  runId: string
  onStatusUpdate: (status: unknown) => void
  onError?: (error: Error) => void
}

/**
 * WebSocket connection helper (scaffold only - no implementation)
 */
export function connectRunStatusWebSocket(
  config: RunStatusWebSocketConfig
): () => void {
  // Check if transport is enabled
  const transport = getRunStatusTransport()
  if (transport !== 'websocket' && transport !== 'auto') {
    // Return no-op cleanup
    return () => {}
  }

  // Placeholder implementation
  // In the future, this would:
  // 1. Connect to WebSocket endpoint
  // 2. Subscribe to run status updates
  // 3. Call onStatusUpdate when status changes
  // 4. Handle reconnection logic
  // 5. Return cleanup function

  console.warn('WebSocket transport not yet implemented - using polling fallback')
  return () => {}
}

