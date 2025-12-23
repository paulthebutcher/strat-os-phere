'use client'

import { Input } from '@/components/ui/input'

interface ProjectsTableToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export function ProjectsTableToolbar({
  searchQuery,
  onSearchChange,
}: ProjectsTableToolbarProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex-1 max-w-md">
        <Input
          type="text"
          placeholder="Search projects…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full"
        />
      </div>
    </div>
  )
}

