/**
 * Shared types for run status and toast management
 */

export type RunStatus = 'queued' | 'running' | 'completed' | 'failed'

export interface RunStatusResponse {
  runId: string
  analysisId?: string
  status: RunStatus
  progress?: {
    step?: string
    completed?: number
    total?: number
  }
  updatedAt: string
  errorMessage?: string
}

export interface ActiveRun {
  runId: string
  analysisId?: string
  projectId: string
  createdAt: string
  lastSeenStatus?: RunStatus
}

