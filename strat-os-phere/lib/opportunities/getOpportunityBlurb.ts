import { safeString } from "@/lib/text/safeString";

/**
 * Get the best display text (blurb) from an opportunity.
 * 
 * Tries multiple fields in priority order:
 * 1. description
 * 2. why_now
 * 3. summary
 * 
 * All fields are safely coerced using safeString to handle non-string types.
 * 
 * @param opportunity - The opportunity object (any type)
 * @returns A string to display, or a fallback message if no text is available
 */
export function getOpportunityBlurb(opportunity: any): string {
  const description = safeString(opportunity?.description);
  if (description) return description;

  const whyNow = safeString(opportunity?.why_now);
  if (whyNow) return whyNow;

  const summary = safeString(opportunity?.summary);
  if (summary) return summary;

  return "Opportunity details are still being generated.";
}

