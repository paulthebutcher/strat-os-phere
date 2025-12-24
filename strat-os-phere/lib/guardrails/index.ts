/**
 * Guardrail system for AI analysis stability and trustworthiness
 * 
 * This module implements a layered guardrail system to:
 * - Prevent low-quality inputs from producing high-confidence outputs
 * - Detect and surface model degradation early
 * - Avoid false precision in scoring
 * - Preserve user trust over time
 * - Enforce system invariants (see docs/principles/SystemInvariants.md)
 */

export * from './evidence'
export * from './validation'
export * from './scoring'
export * from './drift'
export { detectRunDrift } from './drift-helper'
export * from './invariants'

