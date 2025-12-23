'use client'

import * as React from 'react'
import { EvidenceTrustPanel, EvidenceTrustPanelEmpty } from './EvidenceTrustPanel'
import { EvidenceDrawer } from './EvidenceDrawer'
import type { EvidenceCoverage, ClaimsByType } from '@/lib/evidence/claims/types'
import type { NormalizedEvidenceBundle } from '@/lib/evidence/types'

interface EvidenceTrustPanelWrapperProps {
  coverage: EvidenceCoverage | null
  claimsByType: ClaimsByType | null
  bundle: NormalizedEvidenceBundle | null
  lastUpdated?: string | null
}

export function EvidenceTrustPanelWrapper({
  coverage,
  claimsByType,
  bundle,
  lastUpdated,
}: EvidenceTrustPanelWrapperProps) {
  const [drawerOpen, setDrawerOpen] = React.useState(false)
  
  if (!coverage) {
    return <EvidenceTrustPanelEmpty />
  }
  
  return (
    <>
      <EvidenceTrustPanel
        coverage={coverage}
        lastUpdated={lastUpdated}
        onViewEvidence={() => setDrawerOpen(true)}
      />
      {claimsByType ? (
        <EvidenceDrawer
          claimsByType={claimsByType}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      ) : bundle ? (
        <EvidenceDrawer
          bundle={bundle}
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
        />
      ) : null}
    </>
  )
}

