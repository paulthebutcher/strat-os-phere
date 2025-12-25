import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-[175ms] ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: solid, restrained - minimal shadow
        default:
          "bg-primary text-primary-foreground hover:bg-accent-primary-hover active:bg-accent-primary-hover active:scale-[0.98]",
        // Brand: gradient variant for primary CTAs (marketing only)
        brand:
          "plinth-gradient text-white hover:opacity-90 active:opacity-85 active:scale-[0.98]",
        // Destructive: minimal styling
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 active:bg-destructive active:scale-[0.98]",
        // Secondary: subtle background, minimal border
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/70 border border-border active:scale-[0.98]",
        // Outline: single border, no fill
        outline:
          "border border-border bg-transparent text-foreground hover:bg-muted hover:border-accent-primary active:bg-muted/80 active:scale-[0.98]",
        // Ghost: minimal chrome, transparent background
        ghost:
          "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted/80 active:scale-[0.98]",
        // Link-style for inline actions
        link: "text-primary underline-offset-4 hover:underline bg-transparent p-0 h-auto font-medium active:opacity-80",
      },
      size: {
        default: "h-9 px-3.5 py-2",
        sm: "h-8 rounded-sm px-3 text-xs",
        lg: "h-10 rounded-md px-6 text-base",
        icon: "h-9 w-9",
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
