"use client"

import * as React from "react"
import { type LucideIcon, type LucideProps } from "lucide-react"
import { cn } from "@/lib/utils"

export interface IconProps extends Omit<LucideProps, "size" | "name"> {
  name: LucideIcon
  size?: "xs" | "sm" | "md" | "lg" | "xl" | number
  className?: string
}

const sizeMap = {
  xs: 12,
  sm: 16,
  md: 20,
  lg: 24,
  xl: 32,
}

/**
 * Icon wrapper component for lucide-react icons
 * 
 * Provides consistent sizing and color defaults across the app.
 * Usage:
 *   import { Icon } from "@/components/ui/Icon"
 *   import { CheckCircle } from "lucide-react"
 *   <Icon name={CheckCircle} size="sm" />
 */
export function Icon({ 
  name: IconComponent, 
  size = "md", 
  className,
  ...props 
}: IconProps) {
  const sizeValue = typeof size === "number" ? size : sizeMap[size]
  
  return (
    <IconComponent
      size={sizeValue}
      className={cn("shrink-0", className)}
      {...props}
    />
  )
}

