/**
 * Centralized project selectors to prevent schema drift issues.
 * 
 * These selectors only include columns that are confirmed to exist
 * in the production database schema. Do not add columns here unless
 * you've verified they exist in production.
 */

/**
 * Minimal project fields for overview/summary views.
 * Only includes columns guaranteed to exist in production.
 */
export const PROJECT_OVERVIEW_SELECT = `
  id,
  user_id,
  name,
  market,
  target_customer,
  your_product,
  business_goal,
  geography,
  primary_constraint,
  risk_posture,
  ambition_level,
  organizational_capabilities,
  decision_level,
  explicit_non_goals,
  input_confidence,
  hypothesis,
  problem_statement,
  market_context,
  solution_idea,
  decision_framing,
  latest_successful_run_id,
  latest_run_id,
  created_at
`.trim().replace(/\s+/g, ' ')

/**
 * Full project fields for detailed views.
 * Only includes columns guaranteed to exist in production.
 * 
 * Note: starting_point and customer_profile are intentionally excluded
 * as they do not exist in the production schema.
 */
export const PROJECT_FULL_SELECT = PROJECT_OVERVIEW_SELECT

/**
 * Project fields for list/table views.
 * Minimal set for performance.
 */
export const PROJECT_LIST_SELECT = `
  id,
  user_id,
  name,
  market,
  latest_successful_run_id,
  latest_run_id,
  created_at
`.trim().replace(/\s+/g, ' ')

/**
 * Minimal project fields for /new flow stepper.
 * Only includes fields needed during project creation flow.
 */
export const PROJECT_NEW_FLOW_SELECT = `
  id,
  user_id,
  name,
  market,
  target_customer,
  your_product,
  business_goal,
  latest_successful_run_id,
  latest_run_id,
  created_at
`.trim().replace(/\s+/g, ' ')

/**
 * Minimal project fields for results/opportunities pages.
 * Only includes fields needed for displaying results.
 */
export const PROJECT_RESULTS_SELECT = `
  id,
  user_id,
  name,
  market,
  target_customer,
  your_product,
  business_goal,
  geography,
  primary_constraint,
  risk_posture,
  ambition_level,
  organizational_capabilities,
  decision_level,
  explicit_non_goals,
  input_confidence,
  hypothesis,
  problem_statement,
  market_context,
  solution_idea,
  decision_framing,
  latest_successful_run_id,
  latest_run_id,
  created_at
`.trim().replace(/\s+/g, ' ')

