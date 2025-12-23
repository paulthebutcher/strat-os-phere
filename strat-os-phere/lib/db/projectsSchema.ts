/**
 * Single source of truth for allowed projects columns.
 * 
 * Only includes columns that are confirmed to exist in the production
 * Supabase schema. Do not add columns here unless you've verified
 * they exist in production.
 * 
 * This prevents "column does not exist in schema cache" errors.
 */

export const PROJECTS_ALLOWED_COLUMNS = [
  "id",
  "user_id",
  "name",
  "market",
  "target_customer",
  "your_product",
  "business_goal",
  "geography",
  "created_at",
  "ambition_level",
  "primary_constraint",
  "risk_posture",
  "organizational_capabilities",
  "input_confidence",
  "decision_level",
  "explicit_non_goals",
  // Note: latest_successful_run_id and latest_run_id do not exist in production schema
  // Use lib/data/latestRun.ts to derive latest run info from artifacts table
] as const;

export type ProjectsAllowedColumn = (typeof PROJECTS_ALLOWED_COLUMNS)[number];

/**
 * Minimal project fields for basic operations.
 * Only includes columns guaranteed to exist.
 */
export const PROJECT_SELECT_MIN = "id,user_id,name,market,created_at";

/**
 * Project fields for new analysis flow.
 * Includes fields needed during project creation.
 */
export const PROJECT_SELECT_NEW_FLOW =
  "id,user_id,name,market,target_customer,your_product,business_goal,geography,created_at";

/**
 * Project fields for dashboard/list views.
 * Minimal set for performance.
 * Note: latest_successful_run_id and latest_run_id do not exist in production schema.
 * Use lib/data/latestRun.ts to derive latest run info from artifacts table.
 */
export const PROJECT_SELECT_DASHBOARD =
  "id,user_id,name,market,created_at";

/**
 * Full project fields for detailed views.
 * Only includes columns confirmed to exist in production.
 */
export const PROJECT_SELECT_FULL = [
  "id",
  "user_id",
  "name",
  "market",
  "target_customer",
  "your_product",
  "business_goal",
  "geography",
  "primary_constraint",
  "risk_posture",
  "ambition_level",
  "organizational_capabilities",
  "decision_level",
  "explicit_non_goals",
  "input_confidence",
  // Note: latest_successful_run_id and latest_run_id do not exist in production schema
  // Use lib/data/latestRun.ts to derive latest run info from artifacts table
  "created_at",
].join(",");

