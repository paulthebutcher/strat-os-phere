'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ProjectsTable } from './ProjectsTable'
import { ProjectsTableToolbar } from './ProjectsTableToolbar'
import type { ProjectsListRow } from '@/lib/projects/projectsListModel'
import { deleteProject } from '@/lib/projects/deleteProject'
import { toastSuccess, toastError } from '@/lib/toast/toast'

interface ProjectsTableWrapperProps {
  rows: ProjectsListRow[]
}

export function ProjectsTableWrapper({ rows: initialRows }: ProjectsTableWrapperProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [rows, setRows] = useState(initialRows)
  const router = useRouter()

  const handleDelete = useCallback(async (projectId: string) => {
    // Optimistically remove the row using functional update
    let originalRows: typeof rows = []
    setRows((currentRows) => {
      originalRows = currentRows
      return currentRows.filter(row => row.projectId !== projectId)
    })

    const result = await deleteProject(projectId)

    if (result.ok) {
      toastSuccess('Analysis deleted.', '')
      // Refresh the page to ensure we have the latest data
      router.refresh()
    } else {
      // Restore the row on error
      setRows(originalRows)
      toastError(
        "Couldn't delete analysis. Try again.",
        result.message || 'An unexpected error occurred.'
      )
    }
  }, [router])

  return (
    <div className="space-y-4">
      <ProjectsTableToolbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <ProjectsTable rows={rows} searchQuery={searchQuery} onDelete={handleDelete} />
    </div>
  )
}

