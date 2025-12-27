import * as React from "react"
import { cn } from "@/lib/utils"

export interface PageShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  size?: "default" | "wide"
  /** If true, removes left padding for use in layouts with sidebar spacing */
  noLeftPadding?: boolean
}

/**
 * PageShell - Consistent page width, horizontal padding, and vertical padding
 * 
 * Provides standardized page container with:
 * - Max width (default: 7xl, wide: 6xl for content-focused pages)
 * - Horizontal padding (responsive, can be disabled on left for sidebar layouts)
 * - Vertical padding (consistent)
 */
export function PageShell({
  children,
  size = "default",
  noLeftPadding = false,
  className,
  ...props
}: PageShellProps) {
  return (
    <div 
      className={cn(
        "flex min-h-[calc(100vh-57px)] items-start justify-center",
        noLeftPadding ? "pr-4" : "px-4",
        className
      )}
      {...props}
    >
      <main className={cn(
        "flex w-full flex-col gap-8 py-8 md:py-10 animate-fade-in",
        size === "default" ? "max-w-7xl" : "max-w-6xl"
      )}>
        {children}
      </main>
    </div>
  )
}

