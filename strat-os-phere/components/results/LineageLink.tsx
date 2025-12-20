'use client'

import { useState } from 'react'
import { Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { InsightLineageDrawer } from './InsightLineageDrawer'
import type { InsightLineage } from '@/lib/results/lineageHelpers'

interface LineageLinkProps {
  lineage: InsightLineage
  title: string
}

export function LineageLink({ lineage, title }: LineageLinkProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
        aria-label={`Show how ${title} emerged`}
      >
        <Info className="h-3 w-3 mr-1" aria-hidden="true" />
        How this emerged
      </Button>
      <InsightLineageDrawer
        lineage={lineage}
        title={title}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
      />
    </>
  )
}

