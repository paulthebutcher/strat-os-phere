/**
 * Centralized project update builder to prevent schema drift issues.
 * 
 * This helper only includes columns that are confirmed to exist
 * in the production database schema. Do not add columns here unless
 * you've verified they exist in production.
 * 
 * Can be used for both inserts and updates. For inserts, pass all required fields.
 * For updates, pass only the fields you want to update.
 */

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
  hypothesis?: string | null;
  problem_statement?: string | null;
  market_context?: string | null;
  solution_idea?: string | null;
  latest_successful_run_id?: string | null;
  latest_run_id?: string | null;
  // do NOT include decision_framing, starting_point, customer_profile
  // as these columns do not exist in the production schema
}) {
  const update: Record<string, unknown> = {};
  
  if (input.user_id !== undefined) update.user_id = input.user_id;
  if (input.name !== undefined) update.name = input.name;
  if (input.market !== undefined) update.market = input.market;
  if (input.target_customer !== undefined) update.target_customer = input.target_customer;
  if (input.your_product !== undefined) update.your_product = input.your_product;
  if (input.business_goal !== undefined) update.business_goal = input.business_goal;
  if (input.geography !== undefined) update.geography = input.geography;
  if (input.primary_constraint !== undefined) update.primary_constraint = input.primary_constraint;
  if (input.risk_posture !== undefined) update.risk_posture = input.risk_posture;
  if (input.ambition_level !== undefined) update.ambition_level = input.ambition_level;
  if (input.organizational_capabilities !== undefined) update.organizational_capabilities = input.organizational_capabilities;
  if (input.decision_level !== undefined) update.decision_level = input.decision_level;
  if (input.explicit_non_goals !== undefined) update.explicit_non_goals = input.explicit_non_goals;
  if (input.input_confidence !== undefined) update.input_confidence = input.input_confidence;
  if (input.hypothesis !== undefined) update.hypothesis = input.hypothesis;
  if (input.problem_statement !== undefined) update.problem_statement = input.problem_statement;
  if (input.market_context !== undefined) update.market_context = input.market_context;
  if (input.solution_idea !== undefined) update.solution_idea = input.solution_idea;
  if (input.latest_successful_run_id !== undefined) update.latest_successful_run_id = input.latest_successful_run_id;
  if (input.latest_run_id !== undefined) update.latest_run_id = input.latest_run_id;
  
  return update;
}

