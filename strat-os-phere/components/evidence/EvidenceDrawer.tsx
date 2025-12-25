'use client'

import * as React from 'react'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'
import type { ClaimsByType } from '@/lib/evidence/claims/types'

/**
 * EvidenceDrawer - Stub component for evidence bundle/claims display
 * 
 * This component is used by EvidenceTrustPanelWrapper and EvidenceConfidencePanel
 * to display evidence bundles or claims. The actual implementation may vary
 * based on the specific use case.
 */

interface EvidenceDrawerProps {
  bundle?: NormalizedEvidenceBundle
  claimsByType?: ClaimsByType
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export function EvidenceDrawer({
  bundle,
  claimsByType,
  open,
  onOpenChange,
}: EvidenceDrawerProps) {
  // Stub implementation - this component may need full implementation
  // based on requirements for displaying bundles/claims
  if (!open) return null
  
  return (
    <div className="text-sm text-muted-foreground">
      {/* Evidence drawer content - to be implemented based on requirements */}
      {bundle && <div>Evidence bundle: {bundle.items?.length || 0} items</div>}
      {claimsByType && <div>Claims by type available</div>}
    </div>
  )
}
