import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: solid, professional blue
        default:
          "bg-accent-primary text-primary-foreground hover:bg-accent-primary/90 border border-accent-primary",
        // Destructive: professional red
        destructive:
          "bg-danger text-destructive-foreground hover:bg-danger/90 border border-danger",
        // Secondary: outlined with border
        outline:
          "border border-border-subtle bg-surface text-text-primary hover:bg-surface-muted",
        // Secondary: filled muted
        secondary:
          "bg-surface-muted text-text-primary hover:bg-surface-muted/80 border border-border-subtle",
        // Ghost: minimal chrome, transparent background
        ghost:
          "bg-transparent text-text-primary/80 hover:bg-surface-muted hover:text-text-primary border-transparent",
        // Link-style for inline actions
        link: "text-accent-primary underline-offset-4 hover:underline bg-transparent border-transparent p-0 h-auto",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
