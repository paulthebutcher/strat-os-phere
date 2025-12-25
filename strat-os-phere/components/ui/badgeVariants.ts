import type { BadgeProps } from "@/components/ui/badge";

/**
 * Single source of truth for Badge variant types
 * Extracted from Badge component props to ensure type safety
 */
export type AppBadgeVariant = NonNullable<BadgeProps["variant"]>;

/**
 * Maps string values to valid Badge variants
 * Handles common "design" tokens that may not match Badge's exact variant names
 * 
 * @param v - String value to map to a Badge variant
 * @returns Valid Badge variant, defaults to "neutral" for unrecognized values
 */
export function badgeVariant(v: string): AppBadgeVariant {
  // Map common "design" tokens to supported badge variants
  switch (v) {
    case "outline":
      return "neutral"; // closest visual intent
    case "primary":
    case "secondary":
    case "success":
    case "warning":
    case "danger":
    case "info":
    case "default":
    case "neutral":
    case "muted":
      return v;
    default:
      return "neutral";
  }
}

