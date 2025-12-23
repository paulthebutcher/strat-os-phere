import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-medium border transition-colors",
  {
      variants: {
        variant: {
          default: "bg-muted text-foreground border-border",
          primary: "bg-primary text-primary-foreground border-primary shadow-sm",
          secondary: "bg-secondary text-secondary-foreground border-border",
          success: "bg-success/10 text-success border-success/30",
          warning: "bg-warning/10 text-warning border-warning/30",
          danger: "bg-destructive/10 text-destructive border-destructive/30",
          info: "bg-info/10 text-info border-info/30",
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

export { Badge, badgeVariants }

