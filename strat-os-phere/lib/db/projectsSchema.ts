/**
 * Single source of truth for allowed projects columns.
 * 
 * This is the canonical schema contract for the projects table.
 * Only includes columns that are confirmed to exist in the production
 * Supabase schema. Do not add columns here unless you've verified
 * they exist in production.
 * 
 * This prevents "column does not exist in schema cache" errors.
 * 
 * All project queries must use one of the PROJECT_SELECT_* constants below.
 * All project inserts/updates must use pickAllowedProjectFields().
 */

export const PROJECT_ALLOWED_COLUMNS = [
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
  // Note: hypothesis, decision_framing, market_context, starting_point, customer_profile
  // do not exist in production schema
] as const;

// Export both names for backward compatibility during migration
export const PROJECTS_ALLOWED_COLUMNS = PROJECT_ALLOWED_COLUMNS;

export type ProjectAllowedColumn = (typeof PROJECT_ALLOWED_COLUMNS)[number];
export type ProjectsAllowedColumn = ProjectAllowedColumn;

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

/**
 * Type representing a project row with only allowed columns.
 * This matches the database structure for columns that exist in production.
 */
export type ProjectRow = {
  id: string;
  user_id: string;
  name: string;
  market: string;
  target_customer: string;
  your_product: string | null;
  business_goal: string | null;
  geography: string | null;
  primary_constraint: string | null;
  risk_posture: string | null;
  ambition_level: string | null;
  organizational_capabilities: string | null;
  decision_level: string | null;
  explicit_non_goals: string | null;
  input_confidence: string | null;
  created_at: string;
};

