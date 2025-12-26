/**
 * Step Status Schema - Zod validation for metrics.step_status
 * 
 * Prevents JSON drift by validating the shape of step_status on read and write.
 * Single source of truth for step status structure.
 */

import { z } from 'zod'

/**
 * Step names used in the run orchestration
 */
export const StepNameSchema = z.enum(['context', 'evidence', 'analysis', 'opportunities'])

export type StepName = z.infer<typeof StepNameSchema>

/**
 * Step state - the status of a step
 */
export const StepStateSchema = z.enum(['pending', 'running', 'completed', 'failed'])

export type StepState = z.infer<typeof StepStateSchema>

/**
 * Error detail structure for failed steps
 */
export const StepErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  detail: z.string().optional(),
})

export type StepError = z.infer<typeof StepErrorSchema>

/**
 * Step status entry - the status information for a single step
 */
export const StepStatusEntrySchema = z.object({
  status: StepStateSchema,
  startedAt: z.string().optional(),
  finishedAt: z.string().optional(),
  error: StepErrorSchema.optional(),
})

export type StepStatusEntry = z.infer<typeof StepStatusEntrySchema>

/**
 * Step status map - all step statuses for a run
 * Partial is ok - not all steps need to be present
 */
export const StepStatusMapSchema = z.record(StepNameSchema, StepStatusEntrySchema.optional())

export type StepStatusMap = z.infer<typeof StepStatusMapSchema>

/**
 * Parse step status from unknown value
 * 
 * Returns empty map {} on null/undefined/invalid, but logs errors for invalid shapes.
 * This is forgiving to handle existing runs that may not have step_status yet.
 */
export function parseStepStatus(value: unknown): StepStatusMap {
  // Handle null/undefined - return empty map
  if (value === null || value === undefined) {
    return {}
  }

  // Try to parse
  const result = StepStatusMapSchema.safeParse(value)

  if (!result.success) {
    // Log error but return empty map (forgiving for existing runs)
    console.warn('[stepStatusSchema] Invalid step_status shape, normalizing to empty map', {
      errors: result.error.errors,
      value,
    })
    return {}
  }

  return result.data
}

/**
 * Validate and normalize step status entry
 * 
 * Ensures a step status entry conforms to the schema.
 * Used when writing step status to ensure consistency.
 */
export function validateStepStatusEntry(entry: unknown): StepStatusEntry | null {
  const result = StepStatusEntrySchema.safeParse(entry)
  if (!result.success) {
    console.error('[stepStatusSchema] Invalid step status entry', {
      errors: result.error.errors,
      entry,
    })
    return null
  }
  return result.data
}

/**
 * Serialize step status map for storage
 * 
 * Normalizes timestamps and ensures valid structure.
 * Returns the validated map ready for JSON storage.
 */
export function serializeStepStatus(map: StepStatusMap): StepStatusMap {
  // Validate the entire map
  const result = StepStatusMapSchema.safeParse(map)
  if (!result.success) {
    console.error('[stepStatusSchema] Invalid step status map during serialization', {
      errors: result.error.errors,
      map,
    })
    // Return empty map as fallback
    return {}
  }

  // Normalize timestamps (ensure ISO strings if present)
  const normalized: StepStatusMap = {}
  for (const [stepName, entry] of Object.entries(result.data)) {
    if (entry && typeof entry === 'object' && 'status' in entry) {
      const typedEntry = entry as StepStatusEntry
      normalized[stepName as StepName] = {
        ...typedEntry,
        startedAt: typedEntry.startedAt ? new Date(typedEntry.startedAt).toISOString() : undefined,
        finishedAt: typedEntry.finishedAt ? new Date(typedEntry.finishedAt).toISOString() : undefined,
      }
    }
  }

  return normalized
}

