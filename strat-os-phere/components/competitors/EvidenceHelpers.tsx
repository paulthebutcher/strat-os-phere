'use client'

import { useState } from 'react'

import { cn } from '@/lib/utils'

interface EvidenceHelpersProps {
  className?: string
}

export function EvidenceHelpers({ className }: EvidenceHelpersProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className={cn('text-xs text-text-secondary', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-1 text-xs font-medium text-text-secondary underline-offset-4 hover:underline"
      >
        <span>What to paste</span>
        <span aria-hidden="true" className="text-[10px]">
          {open ? '▴' : '▾'}
        </span>
      </button>

      {open ? (
        <div className="mt-2 rounded-md bg-surface-muted px-3 py-2 text-xs text-text-secondary">
          <p className="mb-1">Helpful starting points:</p>
          <ul className="list-disc space-y-1 pl-4">
            <li>Homepage hero + feature section</li>
            <li>Pricing page summary</li>
            <li>Security / Trust or compliance page</li>
          </ul>
        </div>
      ) : null}
    </div>
  )
}


