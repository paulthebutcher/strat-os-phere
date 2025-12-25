'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { paths } from '@/lib/routes'
import type { ResultsFrame } from '@/lib/results/selectors'
import { cn } from '@/lib/utils'

const FRAMES: { id: ResultsFrame; label: string }[] = [
  { id: 'jobs', label: 'By Jobs' },
  { id: 'differentiation_themes', label: 'By Differentiation Themes' },
  { id: 'customer_struggles', label: 'By Customer Struggles' },
  { id: 'strategic_bets', label: 'By Strategic Bets' },
]

interface ResultsFrameToggleProps {
  currentFrame: ResultsFrame
  projectId: string
}

export function ResultsFrameToggle({
  currentFrame,
  projectId,
}: ResultsFrameToggleProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handleFrameChange = (frame: ResultsFrame) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    // Preserve tab parameter if present
    const currentTab = searchParams?.get('tab')
    if (currentTab) {
      params.set('tab', currentTab)
    }
    params.set('frame', frame)
    router.push(`${paths.decision(projectId)}?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-3 pb-2">
      <span className="text-sm font-medium text-muted-foreground">View:</span>
      <div className="flex flex-wrap items-center gap-1">
        {FRAMES.map((frame) => (
          <Button
            key={frame.id}
            variant={currentFrame === frame.id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleFrameChange(frame.id)}
            className={cn(
              'h-8 px-3 text-xs',
              currentFrame === frame.id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground'
            )}
            aria-current={currentFrame === frame.id ? 'page' : undefined}
          >
            {frame.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

