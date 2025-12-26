/**
 * Purpose-Built Iconography for Plinth
 * 
 * Semantic icons tied to Plinth concepts:
 * - Evidence → document with link
 * - Confidence → scored dial
 * - Boundary → dashed threshold
 * - Change trigger → arrow + alert dot
 * - Advantage → stacked blocks
 * 
 * These icons reduce reading by encoding meaning visually.
 */
"use client"

import { FileText, Link2, Gauge, AlertCircle, TrendingUp, Layers } from "lucide-react"
import { cn } from "@/lib/utils"

interface IconProps {
  className?: string
  size?: number
}

/**
 * Evidence Icon - Document with link
 * Represents sources that can be opened and verified
 */
export function EvidenceIcon({ className, size = 20 }: IconProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <FileText size={size} className="text-accent-primary" />
      <Link2 
        size={size * 0.5} 
        className="absolute -bottom-0.5 -right-0.5 text-accent-primary bg-white rounded-full p-0.5" 
      />
    </div>
  )
}

/**
 * Confidence Icon - Scored dial/gauge
 * Represents bounded confidence, not vibes
 */
export function ConfidenceIcon({ className, size = 20 }: IconProps) {
  return (
    <Gauge 
      size={size} 
      className={cn("text-accent-primary", className)} 
    />
  )
}

/**
 * Boundary Icon - Dashed threshold
 * Represents confidence boundaries and limits
 */
export function BoundaryIcon({ className, size = 20 }: IconProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <div className="relative w-full h-full">
        {/* Dashed line representation */}
        <svg 
          width={size} 
          height={size} 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth={2}
          strokeDasharray="4 4"
          className="text-accent-primary"
        >
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="12" y1="4" x2="12" y2="20" />
        </svg>
      </div>
    </div>
  )
}

/**
 * Change Trigger Icon - Arrow with alert dot
 * Represents "what would change this call" - monitoring triggers
 */
export function ChangeTriggerIcon({ className, size = 20 }: IconProps) {
  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <TrendingUp size={size} className="text-accent-primary" />
      <AlertCircle 
        size={size * 0.5} 
        className="absolute -top-0.5 -right-0.5 text-amber-500 bg-white rounded-full" 
        fill="currentColor"
      />
    </div>
  )
}

/**
 * Advantage Icon - Stacked blocks
 * Represents competitive advantage and structural positioning
 */
export function AdvantageIcon({ className, size = 20 }: IconProps) {
  return (
    <Layers 
      size={size} 
      className={cn("text-accent-primary", className)} 
    />
  )
}

/**
 * Source Type Icons - Quick visual indicators for evidence types
 */
export function SourceTypeIcon({ 
  type, 
  className, 
  size = 16 
}: { 
  type: 'pricing' | 'docs' | 'reviews' | 'changelog' | 'marketing' | 'jobs' | 'status'
  className?: string
  size?: number
}) {
  const iconMap = {
    pricing: FileText,
    docs: FileText,
    reviews: AlertCircle,
    changelog: TrendingUp,
    marketing: FileText,
    jobs: FileText,
    status: AlertCircle,
  }
  
  const Icon = iconMap[type] || FileText
  
  return (
    <Icon 
      size={size} 
      className={cn("text-text-muted", className)} 
    />
  )
}

