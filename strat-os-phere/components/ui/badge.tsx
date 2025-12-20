import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-sm px-2 py-0.5 text-xs font-medium border",
  {
      variants: {
        variant: {
          default: "bg-muted text-foreground border-border",
          primary: "bg-primary text-primary-foreground border-primary",
          secondary: "bg-secondary text-secondary-foreground border-border",
          success: "bg-success/10 text-success border-success/20",
          warning: "bg-warning/10 text-warning border-warning/20",
          danger: "bg-destructive/10 text-destructive border-destructive/20",
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

