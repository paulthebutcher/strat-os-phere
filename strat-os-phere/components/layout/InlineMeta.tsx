import * as React from "react"
import { cn } from "@/lib/utils"

export interface InlineMetaProps {
  children: React.ReactNode
  className?: string
}

/**
 * InlineMeta - Consistent muted meta text
 * 
 * For "Last updated", "Status", timestamps, etc.
 * Provides consistent styling for supporting metadata.
 */
export function InlineMeta({
  children,
  className,
}: InlineMetaProps) {
  return (
    <span className={cn(
      "text-xs text-muted-foreground",
      className
    )}>
      {children}
    </span>
  )
}

