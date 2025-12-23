/**
 * Helper function to start an evidence collection run
 * Standardizes the trigger behavior across all "Generate analysis" buttons
 */

export interface StartEvidenceRunArgs {
  analysisId: string
}

export interface StartEvidenceRunResult {
  ok: true
  runId: string
}

export interface StartEvidenceRunError {
  ok: false
  message: string
  details?: Record<string, unknown>
}

export type StartEvidenceRunResponse =
  | StartEvidenceRunResult
  | StartEvidenceRunError

/**
 * Start an evidence collection run for a project
 * This is the single function all "Generate analysis" buttons should call
 */
export async function startEvidenceRun(
  args: StartEvidenceRunArgs
): Promise<StartEvidenceRunResponse> {
  try {
    const response = await fetch(`/api/projects/${args.analysisId}/generate`, {
      method: 'POST',
    })

    const result = await response.json()

    if (response.ok && result.ok && result.runId) {
      return {
        ok: true,
        runId: result.runId,
      }
    }

    return {
      ok: false,
      message: result.message || 'Failed to start analysis. Please try again.',
      details: result.details,
    }
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Failed to start analysis. Please try again.',
    }
  }
}

