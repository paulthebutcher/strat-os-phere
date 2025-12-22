import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const surfaceCardVariants = cva(
  "rounded-lg border transition-colors",
  {
    variants: {
      variant: {
        default: "plinth-card",
        tint: "plinth-surface-tint border-border",
        tint2: "plinth-surface-tint-2 border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface SurfaceCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof surfaceCardVariants> {}

function SurfaceCard({ className, variant, ...props }: SurfaceCardProps) {
  return (
    <div
      className={cn(surfaceCardVariants({ variant }), className)}
      {...props}
    />
  )
}

export { SurfaceCard, surfaceCardVariants }

