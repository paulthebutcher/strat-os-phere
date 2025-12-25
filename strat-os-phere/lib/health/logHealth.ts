/**
 * Schema Health Logging
 * 
 * Debug logging helpers for schema health events.
 * Only logs in development to avoid production spam.
 */

const isDevelopment = process.env.NODE_ENV !== 'production'

/**
 * Log a schema health event (only in development)
 * 
 * @param name - Event name (e.g., 'project_created', 'project_input_saved')
 * @param details - Event details (will be JSON stringified)
 */
export function logHealthEvent(name: string, details?: Record<string, unknown>): void {
  if (!isDevelopment) {
    return
  }

  const timestamp = new Date().toISOString()
  const logEntry = {
    timestamp,
    event: `[schema-health] ${name}`,
    ...details,
  }

  // Use console.log in development (can be filtered/redirected if needed)
  console.log(JSON.stringify(logEntry))
}

/**
 * Log project creation event
 */
export function logProjectCreated(projectId: string, fields: string[]): void {
  logHealthEvent('project_created', {
    projectId,
    fieldsUsed: fields,
    fieldsCount: fields.length,
  })
}

/**
 * Log project input save event
 */
export function logProjectInputSaved(projectId: string, version: number, status: string): void {
  logHealthEvent('project_input_saved', {
    projectId,
    version,
    status,
  })
}

/**
 * Log project run creation event
 */
export function logProjectRunCreated(projectId: string, runId: string, inputVersion: number): void {
  logHealthEvent('project_run_created', {
    projectId,
    runId,
    inputVersion,
  })
}

