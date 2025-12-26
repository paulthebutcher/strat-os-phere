'use client'

import { Button } from '@/components/ui/button'

interface AddCompetitorsButtonProps {
  competitorCount: number
  minCompetitors: number
}

export function AddCompetitorsButton({
  competitorCount,
  minCompetitors,
}: AddCompetitorsButtonProps) {
  const handleClick = () => {
    const element = document.getElementById('add-competitors-search')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      // Focus the search input after scrolling
      setTimeout(() => {
        const input = element.querySelector('input')
        input?.focus()
      }, 300)
    }
  }

  if (competitorCount >= minCompetitors) {
    return null
  }

  return (
    <Button type="button" onClick={handleClick}>
      Add competitors
    </Button>
  )
}

