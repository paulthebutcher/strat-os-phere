import type { AppBadgeVariant } from "@/components/ui/badgeVariants";

/**
 * Maps confidence levels to appropriate Badge variants
 * Provides semantic meaning: high = success, medium = warning, low = neutral
 * 
 * @param level - Confidence level: "low" | "medium" | "high"
 * @returns Appropriate Badge variant for the confidence level
 */
export function confidenceToBadgeVariant(
  level: "low" | "medium" | "high"
): AppBadgeVariant {
  switch (level) {
    case "high":
      return "success";
    case "medium":
      return "warning";
    case "low":
      return "neutral";
    default:
      return "neutral";
  }
}

