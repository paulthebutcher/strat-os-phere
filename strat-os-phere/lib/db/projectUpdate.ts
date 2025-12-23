/**
 * Centralized project update builder to prevent schema drift issues.
 * 
 * This helper only includes columns that are confirmed to exist
 * in the production database schema. Do not add columns here unless
 * you've verified they exist in production.
 * 
 * Can be used for both inserts and updates. For inserts, pass all required fields.
 * For updates, pass only the fields you want to update.
 * 
 * This function now uses pickAllowedProjectFields to automatically filter
 * out any columns that don't exist in the schema.
 */

import { pickAllowedProjectFields } from "./projectsSafeWrite";

export function buildProjectUpdate(input: {
  user_id?: string;
  name?: string;
  market?: string;
  target_customer?: string;
  your_product?: string | null;
  business_goal?: string | null;
  geography?: string | null;
  primary_constraint?: string | null;
  risk_posture?: string | null;
  ambition_level?: string | null;
  organizational_capabilities?: string | null;
  decision_level?: string | null;
  explicit_non_goals?: string | null;
  input_confidence?: string | null;
  latest_successful_run_id?: string | null;
  latest_run_id?: string | null;
  // do NOT include: hypothesis, decision_framing, starting_point, customer_profile,
  // problem_statement, market_context, solution_idea, context_paste
  // as these columns do not exist in the production schema
  // Future: consider adding context_paste column via migration to store evolving inputs
  [key: string]: any; // Allow any other fields, they'll be filtered out
}) {
  // Use pickAllowedProjectFields to automatically filter out unknown columns
  return pickAllowedProjectFields(input);
}

