import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium border transition-all duration-[175ms] ease-out",
  {
      variants: {
        variant: {
          default: "bg-muted text-foreground border-border",
          primary: "bg-primary text-primary-foreground border-primary",
          secondary: "bg-secondary text-secondary-foreground border-border",
          success: "bg-success/10 text-success border-success/20",
          warning: "bg-warning/10 text-warning border-warning/20",
          danger: "bg-destructive/10 text-destructive border-destructive/20",
          info: "bg-info/10 text-info border-info/20",
          muted: "bg-muted text-muted-foreground border-border",
          neutral: "bg-muted text-muted-foreground border-border",
        },
      },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

/**
 * Semantic badge kinds that map to valid design system variants.
 * Use this to prevent accidentally passing invalid variants (e.g., "outline" from shadcn).
 */
export type BadgeKind = 
  | "chip"      // Neutral, subtle badge (maps to "secondary")
  | "status"    // Informational status badge (maps to "info")
  | "tag"       // Default tag style (maps to "default")
  | "primary"    // Primary emphasis (maps to "primary")
  | "success"   // Success state (maps to "success")
  | "warning"   // Warning state (maps to "warning")
  | "danger"    // Danger/destructive state (maps to "danger")
  | "muted"     // Muted/subtle (maps to "muted")

const badgeVariantByKind: Record<BadgeKind, BadgeProps["variant"]> = {
  chip: "secondary",
  status: "info",
  tag: "default",
  primary: "primary",
  success: "success",
  warning: "warning",
  danger: "danger",
  muted: "muted",
} as const

/**
 * SafeBadge ensures only valid design system variants are used.
 * Prevents common mistakes like using "outline" (which is a Button variant, not Badge).
 * 
 * @example
 * <SafeBadge kind="chip">Citation</SafeBadge>
 * <SafeBadge kind="status">Active</SafeBadge>
 */
export interface SafeBadgeProps extends Omit<BadgeProps, "variant"> {
  kind: BadgeKind
}

function SafeBadge({ kind, ...props }: SafeBadgeProps) {
  const variant = badgeVariantByKind[kind]
  return <Badge variant={variant} {...props} />
}

export { Badge, badgeVariants, SafeBadge }

