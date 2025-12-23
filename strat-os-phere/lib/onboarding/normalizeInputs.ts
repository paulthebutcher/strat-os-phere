/**
 * Normalize various input shapes into canonical ProjectInputs format.
 * Prevents drift from "vibe coding" different field names.
 */

import type { ProjectInputs } from './heuristics'

type PartialInputs = Record<string, unknown>

/**
 * Normalize partial inputs into canonical ProjectInputs shape.
 * Maps common aliases to canonical field names.
 *
 * @param input - Partial input object that may use various field names
 * @returns Normalized ProjectInputs object
 */
export function normalizeProjectInputs(input: PartialInputs): ProjectInputs {
  const normalized: ProjectInputs = {}

  // Map name (already canonical)
  if (typeof input.name === 'string') {
    normalized.name = input.name
  }

  // Map market (already canonical)
  if (typeof input.market === 'string') {
    normalized.market = input.market
  }

  // Map target customer: customer -> targetCustomer
  if (typeof input.customer === 'string') {
    normalized.targetCustomer = input.customer
  }
  // Also accept targetCustomer if already provided
  if (typeof input.targetCustomer === 'string') {
    normalized.targetCustomer = input.targetCustomer
  }
  // Also accept target_customer (snake_case from DB)
  if (typeof input.target_customer === 'string') {
    normalized.targetCustomer = input.target_customer
  }

  // Map business goal: decision -> businessGoal, goal -> businessGoal
  if (typeof input.decision === 'string') {
    normalized.businessGoal = input.decision
  }
  if (typeof input.goal === 'string') {
    normalized.businessGoal = input.goal
  }
  // Also accept businessGoal if already provided
  if (typeof input.businessGoal === 'string') {
    normalized.businessGoal = input.businessGoal
  }
  // Also accept business_goal (snake_case from DB)
  if (typeof input.business_goal === 'string') {
    normalized.businessGoal = input.business_goal
  }

  // Map your product: product -> yourProduct
  if (typeof input.product === 'string') {
    normalized.yourProduct = input.product
  }
  // Also accept yourProduct if already provided
  if (typeof input.yourProduct === 'string') {
    normalized.yourProduct = input.yourProduct
  }
  // Also accept your_product (snake_case from DB)
  if (typeof input.your_product === 'string') {
    normalized.yourProduct = input.your_product
  }

  return normalized
}

