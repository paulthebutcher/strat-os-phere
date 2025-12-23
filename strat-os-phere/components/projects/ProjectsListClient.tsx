'use client'

import { useState, useMemo } from 'react'
import { ProjectsToolbar, type SortKey } from './ProjectsToolbar'
import { ProjectCard } from './ProjectCard'
import type { ProjectCardModel } from './types'
import { EmptyState } from '@/components/shared/EmptyState'

interface ProjectsListClientProps {
  projects: ProjectCardModel[]
}

export function ProjectsListClient({ projects: initialProjects }: ProjectsListClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('updated')

  // Filter and sort projects
  const filteredAndSortedProjects = useMemo(() => {
    // Filter by search query (searches name, market, and product info)
    let filtered = initialProjects
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = initialProjects.filter((project) => {
        const titleMatch = project.title.toLowerCase().includes(query)
        const marketMatch = project.market?.toLowerCase().includes(query) ?? false
        return titleMatch || marketMatch
      })
    }

    // Sort
    const sorted = [...filtered].sort((a, b) => {
      switch (sortKey) {
        case 'updated':
        case 'created': {
          // Sort by lastTouchedAt (or createdAt for 'created' sort)
          const aDate = sortKey === 'updated' 
            ? (a.lastTouchedAt ?? a.createdAt ?? '')
            : (a.createdAt ?? '')
          const bDate = sortKey === 'updated'
            ? (b.lastTouchedAt ?? b.createdAt ?? '')
            : (b.createdAt ?? '')
          
          if (!aDate && !bDate) return 0
          if (!aDate) return 1
          if (!bDate) return -1
          return new Date(bDate).getTime() - new Date(aDate).getTime()
        }
        case 'name':
          return a.title.localeCompare(b.title)
        default:
          return 0
      }
    })

    return sorted
  }, [initialProjects, searchQuery, sortKey])

  const hasResults = filteredAndSortedProjects.length > 0
  const hasInitialProjects = initialProjects.length > 0

  return (
    <div className="space-y-6">
      {hasInitialProjects && (
        <div className="space-y-4">
          <ProjectsToolbar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortKey={sortKey}
            onSortChange={setSortKey}
          />
        </div>
      )}

      {!hasResults && hasInitialProjects ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            No projects match your search.
          </p>
        </div>
      ) : hasResults ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAndSortedProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

