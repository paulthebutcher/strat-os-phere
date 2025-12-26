/**
 * MarketingIcon - Centralized icon wrapper for marketing components
 * 
 * Prevents "Cannot find name X" build breaks by centralizing icon imports.
 * Maps semantic names to lucide-react icons.
 * 
 * Usage:
 *   <MarketingIcon name="document" className="w-4 h-4" />
 *   <MarketingIcon name="message" className="w-5 h-5" />
 */
"use client"

import { 
  FileText, 
  MessageSquare, 
  Presentation,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  Link2,
  Gauge,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

type MarketingIconName = 
  | "document" 
  | "fileText"
  | "message" 
  | "presentation" 
  | "check" 
  | "alert" 
  | "trending" 
  | "layers" 
  | "link" 
  | "gauge"

interface MarketingIconProps {
  name: MarketingIconName
  className?: string
  size?: number
}

const iconMap: Record<MarketingIconName, LucideIcon> = {
  document: FileText,
  fileText: FileText,
  message: MessageSquare,
  presentation: Presentation,
  check: CheckCircle2,
  alert: AlertCircle,
  trending: TrendingUp,
  layers: Layers,
  link: Link2,
  gauge: Gauge,
}

export function MarketingIcon({ name, className, size }: MarketingIconProps) {
  const Icon = iconMap[name]
  
  if (!Icon) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(`MarketingIcon: Unknown icon name "${name}". Available names: ${Object.keys(iconMap).join(', ')}`)
    }
    // Fallback to FileText to prevent build breaks in production
    const FallbackIcon = FileText
    return <FallbackIcon className={className} size={size} />
  }
  
  return <Icon className={className} size={size} />
}

