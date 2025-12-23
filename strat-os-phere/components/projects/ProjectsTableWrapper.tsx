'use client'

import { useState } from 'react'
import { ProjectsTable } from './ProjectsTable'
import { ProjectsTableToolbar } from './ProjectsTableToolbar'
import type { ProjectsListRow } from '@/lib/projects/projectsListModel'

interface ProjectsTableWrapperProps {
  rows: ProjectsListRow[]
}

export function ProjectsTableWrapper({ rows }: ProjectsTableWrapperProps) {
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <div className="space-y-4">
      <ProjectsTableToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ProjectsTable rows={rows} searchQuery={searchQuery} />
    </div>
  )
}

