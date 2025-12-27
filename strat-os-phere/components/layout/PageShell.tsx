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
 * Scroll contract:
 * - Standalone pages (noLeftPadding=false): PageShell owns scrolling
 * - ProjectAppShell pages (noLeftPadding=true): ProjectAppShell main owns scrolling
 * 
 * When noLeftPadding=true (inside ProjectAppShell):
 * - Does NOT set fixed height or overflow-y-auto (scroll handled by shell)
 * - Does NOT add horizontal padding (shell provides gutter)
 * - Simply provides flex-1 min-h-0 content wrapper with max-width and vertical padding
 * 
 * When noLeftPadding=false (standalone):
 * - Sets h-[calc(100vh-57px)] and overflow-y-auto (single scroll container)
 * - Adds px-4 horizontal padding and centers content with max-width
 */
export function PageShell({
  children,
  size = "default",
  noLeftPadding = false,
  className,
  ...props
}: PageShellProps) {
  // When inside ProjectAppShell (noLeftPadding=true): minimal wrapper, no scroll
  if (noLeftPadding) {
    return (
      <div 
        className={cn(
          "flex flex-1 min-h-0 flex-col",
          className
        )}
        {...props}
      >
        <div className={cn(
          "flex w-full flex-col gap-8 py-8 md:py-10 animate-fade-in",
          size === "default" ? "max-w-7xl" : "max-w-6xl"
        )}>
          {children}
        </div>
      </div>
    )
  }

  // Standalone pages: PageShell owns scrolling
  return (
    <div 
      className={cn(
        "flex h-[calc(100vh-57px)] min-h-0 items-start justify-center px-4",
        className
      )}
      {...props}
    >
      <main className={cn(
        "flex w-full flex-col gap-8 py-8 md:py-10 animate-fade-in min-h-0 overflow-y-auto",
        size === "default" ? "max-w-7xl" : "max-w-6xl"
      )}>
        {children}
      </main>
    </div>
  )
}

