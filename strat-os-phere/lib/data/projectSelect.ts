/**
 * Centralized project selectors to prevent schema drift issues.
 * 
 * These selectors only include columns that are confirmed to exist
 * in the production database schema. Do not add columns here unless
 * you've verified they exist in production.
 * 
 * All selectors now use the single source of truth from projectsSchema.ts
 */

import {
  PROJECT_SELECT_MIN,
  PROJECT_SELECT_NEW_FLOW,
  PROJECT_SELECT_DASHBOARD,
  PROJECT_SELECT_FULL,
} from "../db/projectsSchema";

/**
 * Minimal project fields for overview/summary views.
 * Only includes columns guaranteed to exist in production.
 */
export const PROJECT_OVERVIEW_SELECT = PROJECT_SELECT_FULL;

/**
 * Full project fields for detailed views.
 * Only includes columns confirmed to exist in production.
 * 
 * Note: hypothesis, starting_point, customer_profile, decision_framing,
 * problem_statement, market_context, solution_idea are intentionally excluded
 * as they do not exist in the production schema.
 */
export const PROJECT_FULL_SELECT = PROJECT_SELECT_FULL;

/**
 * Project fields for list/table views.
 * Minimal set for performance.
 */
export const PROJECT_LIST_SELECT = PROJECT_SELECT_MIN;

/**
 * Minimal project fields for /new flow stepper.
 * Only includes fields needed during project creation flow.
 */
export const PROJECT_NEW_FLOW_SELECT = PROJECT_SELECT_NEW_FLOW;

/**
 * Minimal project fields for results/opportunities pages.
 * Only includes fields needed for displaying results.
 */
export const PROJECT_RESULTS_SELECT = PROJECT_SELECT_FULL;

/**
 * Minimal project fields for /dashboard page.
 * Only includes columns confirmed to exist in production.
 * 
 * Note: latest_run_id is not included as it doesn't exist in production schema.
 * Use lib/data/latestRun.ts to derive latest run info from artifacts table.
 */
export const PROJECT_DASHBOARD_SELECT = PROJECT_SELECT_DASHBOARD;

