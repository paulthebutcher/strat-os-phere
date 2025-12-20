import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium border",
  {
      variants: {
        variant: {
          default: "bg-surface-muted text-card-foreground border-border-subtle",
          primary: "bg-accent-primary text-primary-foreground border-accent-primary",
          secondary: "bg-surface-muted text-text-secondary border-border-subtle",
          success: "bg-success/10 text-success border-success/20",
          warning: "bg-warning/10 text-warning border-warning/20",
          danger: "bg-danger/10 text-danger border-danger/20",
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

export { Badge, badgeVariants }

