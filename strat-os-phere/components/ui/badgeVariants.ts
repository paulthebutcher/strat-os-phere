import { Badge } from "@/components/ui/badge";
import type { ComponentProps } from "react";

/**
 * Single source of truth for Badge variant types.
 * Derived directly from the Badge component so it can't drift.
 * 
 * Do not pass raw strings to Badge.variant. Use AppBadgeVariant or toBadgeVariant().
 */
export type AppBadgeVariant = NonNullable<ComponentProps<typeof Badge>["variant"]>;

/**
 * Maps loose / legacy variant tokens to the supported Badge variants.
 * Ensures callers never pass invalid strings like "outline".
 * 
 * @param v - String value to map to a Badge variant
 * @returns Valid Badge variant, defaults to "neutral" for unrecognized values
 */
export function toBadgeVariant(v: unknown): AppBadgeVariant {
  const s = String(v ?? "").toLowerCase();

  switch (s) {
    case "outline":
      return "neutral"; // closest intent
    case "primary":
    case "secondary":
    case "success":
    case "warning":
    case "danger":
    case "info":
    case "default":
    case "neutral":
    case "muted":
      return s as AppBadgeVariant;
    default:
      return "neutral";
  }
}

