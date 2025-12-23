import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-opacity-50 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary: solid, rich indigo - premium and modern
        default:
          "bg-primary text-primary-foreground hover:bg-accent-primary-hover shadow-sm hover:shadow active:scale-[0.98]",
        // Brand: gradient variant for primary CTAs
        brand:
          "plinth-gradient text-white hover:opacity-90 shadow-md hover:shadow-lg active:scale-[0.98]",
        // Destructive: standard red
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm hover:shadow active:scale-[0.98]",
        // Secondary: subtle background
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-border shadow-sm hover:shadow active:scale-[0.98]",
        // Outline: clear border, no fill
        outline:
          "border-2 border-border bg-transparent text-foreground hover:bg-muted hover:border-accent-primary active:scale-[0.98]",
        // Ghost: minimal chrome, transparent background
        ghost:
          "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground active:scale-[0.98]",
        // Link-style for inline actions
        link: "text-primary underline-offset-4 hover:underline bg-transparent p-0 h-auto font-medium",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8 text-base",
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
