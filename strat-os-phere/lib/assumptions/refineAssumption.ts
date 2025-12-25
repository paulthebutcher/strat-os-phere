/**
 * Refinement utility for assumptions.
 * Uses LLM to rewrite fluffy assumptions into specific, testable claims.
 */

import { callLLM } from '@/lib/llm/callLLM'
import {
  buildAssumptionRefinementMessages,
  type AssumptionRefinementInput,
  type AssumptionOutput,
} from '@/lib/prompts/assumptions'
import { isFluffy } from './isFluffy'
import type { Assumption, AssumptionCategory } from '@/lib/results/assumptions'

export interface RefinedAssumption extends Assumption {
  test?: string
  decision_impact?: string
  needs_generation?: boolean
}

const MAX_REFINEMENT_ATTEMPTS = 2

/**
 * Refine a single fluffy assumption using LLM
 */
export async function refineFluffyAssumption(
  assumption: Assumption,
  input: AssumptionRefinementInput
): Promise<RefinedAssumption | null> {
  if (!isFluffy(assumption.statement)) {
    // Not fluffy, return as-is
    return {
      ...assumption,
      test: undefined,
      decision_impact: undefined,
    }
  }

  let lastError: Error | null = null

  for (let attempt = 0; attempt < MAX_REFINEMENT_ATTEMPTS; attempt++) {
    try {
      const messages = buildAssumptionRefinementMessages({
        ...input,
        existingAssumption: {
          category: assumption.category,
          statement: assumption.statement,
          whyItMatters: assumption.whyItMatters,
        },
      })

      const response = await callLLM({
        messages,
        jsonMode: true,
        temperature: 0.3, // Lower temperature for more consistent output
        timeoutMs: 15000,
      })

      // Parse the JSON response
      let parsed: { assumption?: AssumptionOutput } | { assumptions?: AssumptionOutput[] }
      try {
        parsed = JSON.parse(response.text)
      } catch (parseError) {
        // Try to extract JSON from markdown code blocks if present
        const jsonMatch = response.text.match(/```(?:json)?\s*(\{[\s\S]*\})\s*```/)
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1])
        } else {
          throw parseError
        }
      }

      // Handle both single assumption and array responses
      let refined: AssumptionOutput | undefined
      if ('assumption' in parsed && parsed.assumption) {
        refined = parsed.assumption
      } else if ('assumptions' in parsed && Array.isArray(parsed.assumptions) && parsed.assumptions.length > 0) {
        refined = parsed.assumptions[0]
      }

      if (!refined) {
        throw new Error('No assumption found in LLM response')
      }

      // Validate the refined assumption is not still fluffy
      if (isFluffy(refined.statement)) {
        if (attempt < MAX_REFINEMENT_ATTEMPTS - 1) {
          // Try again
          continue
        } else {
          // Final attempt failed, mark as needing generation
          return {
            ...assumption,
            needs_generation: true,
          }
        }
      }

      // Success - return refined assumption
      return {
        ...assumption,
        statement: refined.statement,
        category: refined.category as AssumptionCategory,
        test: refined.test,
        decision_impact: refined.decision_impact,
        needs_generation: false,
      }
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))
      // If it's the last attempt, we'll return null or mark as needing generation
      if (attempt === MAX_REFINEMENT_ATTEMPTS - 1) {
        break
      }
    }
  }

  // All attempts failed - mark as needing generation but keep original
  return {
    ...assumption,
    needs_generation: true,
  }
}

/**
 * Refine multiple assumptions in parallel (with batching to avoid rate limits)
 */
export async function refineFluffyAssumptions(
  assumptions: Assumption[],
  input: AssumptionRefinementInput,
  batchSize: number = 3
): Promise<RefinedAssumption[]> {
  const results: RefinedAssumption[] = []

  // Process in batches to avoid rate limits
  for (let i = 0; i < assumptions.length; i += batchSize) {
    const batch = assumptions.slice(i, i + batchSize)
    const batchResults = await Promise.all(
      batch.map(assumption => refineFluffyAssumption(assumption, input))
    )

    // Filter out nulls and add to results
    for (const result of batchResults) {
      if (result) {
        results.push(result)
      }
    }

    // Small delay between batches to avoid rate limits
    if (i + batchSize < assumptions.length) {
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  return results
}

