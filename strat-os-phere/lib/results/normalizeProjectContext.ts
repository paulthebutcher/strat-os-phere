/**
 * Normalization helper for project context.
 * 
 * Converts loose/optional project context fields to strict required strings
 * by coercing undefined/null to empty strings. This ensures type safety when
 * passing project context to functions that expect strict types.
 * 
 * This is a non-breaking change: it doesn't change runtime behavior meaningfully,
 * but ensures our typed contracts are respected.
 */

export type LooseProjectContext = {
  your_product?: string | null;
  business_goal?: string | null;
  market?: string | null;
  target_customer?: string | null;
};

export type StrictProjectContext = {
  your_product: string;
  business_goal: string;
  market: string;
  target_customer: string;
};

/**
 * Partial ProjectContext with optional required fields.
 * Used when we have project data that might have null/undefined for required fields.
 */
export type PartialProjectContext = {
  market?: string | null;
  target_customer?: string | null;
  your_product?: string | null;
  business_goal?: string | null;
};

/**
 * Coerces a value to a non-empty string, defaulting to empty string.
 * Trims whitespace from string values.
 */
const asString = (v: unknown): string => {
  if (typeof v === "string") {
    return v.trim();
  }
  return "";
};

/**
 * Normalizes project context to a strict shape by coercing undefined/null to "".
 * 
 * This guarantees the strict type: no undefined/null values.
 * Use this when passing project context to functions that expect required string fields.
 * 
 * @param input - Loose project context with optional fields
 * @returns Strict project context with all fields as required strings
 */
export function normalizeProjectContext(input: LooseProjectContext): StrictProjectContext {
  return {
    your_product: asString(input.your_product),
    business_goal: asString(input.business_goal),
    market: asString(input.market),
    target_customer: asString(input.target_customer),
  };
}

/**
 * Normalizes project context to be compatible with ProjectContext type.
 * Ensures required fields (market, target_customer) are strings, not null/undefined.
 * 
 * This is useful when you have a partial ProjectContext and need to pass it
 * to functions expecting the full ProjectContext type.
 * 
 * @param input - Partial project context that might have null/undefined for required fields
 * @returns Project context with required fields normalized to strings
 */
export function normalizeToProjectContext(
  input: PartialProjectContext
): { market: string; target_customer: string; your_product?: string | null; business_goal?: string | null } {
  return {
    market: asString(input.market),
    target_customer: asString(input.target_customer),
    your_product: input.your_product ?? null,
    business_goal: input.business_goal ?? null,
  };
}

/**
 * Optional: Validates that project context has minimum required fields.
 * 
 * Use this for UX messaging (e.g., "Add target customer to generate assumptions"),
 * not for throwing during build.
 * 
 * @param p - Strict project context
 * @returns true if minimum fields are present
 */
export function hasMinimumProjectContext(p: StrictProjectContext): boolean {
  return Boolean(p.market && p.target_customer);
}

