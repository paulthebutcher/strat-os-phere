'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from './formatRelativeDate'
import { formatTimeLabel, formatNoRunsLabel } from '@/lib/ux/timeLabels'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun } from '@/lib/runs/runToastStore'
import { toastSuccess, toastError } from '@/lib/toast/toast'
import type { ProjectsListRow, EvidenceStrength } from '@/lib/projects/projectsListModel'
import { ArrowUpDown, ArrowUp, ArrowDown, Loader2 } from 'lucide-react'

export type TableSortKey = 'lastTouched' | 'lastRun' | 'evidenceScore' | 'name'

interface ProjectsTableProps {
  rows: ProjectsListRow[]
  searchQuery?: string
}

export function ProjectsTable({ rows, searchQuery = '' }: ProjectsTableProps) {
  const [sortKey, setSortKey] = useState<TableSortKey>('lastTouched')
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc')
  const [generatingProjectId, setGeneratingProjectId] = useState<string | null>(null)

  // Filter by search query
  const filteredRows = useMemo(() => {
    if (!searchQuery.trim()) return rows
    
    const query = searchQuery.toLowerCase().trim()
    return rows.filter((row) => {
      const nameMatch = row.name.toLowerCase().includes(query)
      const subtitleMatch = row.subtitle?.toLowerCase().includes(query) ?? false
      return nameMatch || subtitleMatch
    })
  }, [rows, searchQuery])

  // Sort rows
  const sortedRows = useMemo(() => {
    const sorted = [...filteredRows].sort((a, b) => {
      let comparison = 0

      switch (sortKey) {
        case 'lastTouched': {
          const aDate = a.lastTouchedAt ? new Date(a.lastTouchedAt).getTime() : 0
          const bDate = b.lastTouchedAt ? new Date(b.lastTouchedAt).getTime() : 0
          comparison = aDate - bDate
          break
        }
        case 'lastRun': {
          // "Never" sorts last
          if (!a.lastRunAt && !b.lastRunAt) return 0
          if (!a.lastRunAt) return 1
          if (!b.lastRunAt) return -1
          const aDate = new Date(a.lastRunAt).getTime()
          const bDate = new Date(b.lastRunAt).getTime()
          comparison = aDate - bDate
          break
        }
        case 'evidenceScore': {
          comparison = a.evidenceScore - b.evidenceScore
          break
        }
        case 'name': {
          comparison = a.name.localeCompare(b.name)
          break
        }
      }

      return sortDir === 'asc' ? comparison : -comparison
    })

    return sorted
  }, [filteredRows, sortKey, sortDir])

  const handleSort = (key: TableSortKey) => {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDir(key === 'name' ? 'asc' : 'desc') // Name defaults to asc, others to desc
    }
  }

  const handleGenerateAnalysis = async (projectId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent row click
    if (generatingProjectId === projectId) return

    setGeneratingProjectId(projectId)
    
    // Immediate feedback toast
    toastSuccess('Starting analysis…', 'Your analysis is being prepared.')
    
    try {
      const result = await startEvidenceRun({ analysisId: projectId })

      if (result.ok) {
        addActiveRun({
          runId: result.runId,
          projectId,
          analysisId: projectId,
          createdAt: new Date().toISOString(),
        })
      } else {
        toastError(
          'Failed to start analysis',
          result.message || 'Please try again.'
        )
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      toastError(
        'Failed to start analysis',
        'An unexpected error occurred. Please try again.'
      )
    } finally {
      setGeneratingProjectId(null)
    }
  }

  const SortIcon = ({ columnKey }: { columnKey: TableSortKey }) => {
    if (sortKey !== columnKey) {
      return <ArrowUpDown className="h-3 w-3 ml-1 opacity-50" />
    }
    return sortDir === 'asc' 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
  }

  const getStatusVariant = (status: ProjectsListRow['status']) => {
    switch (status) {
      case 'Results available':
        return 'success'
      case 'Ready':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getEvidenceColor = (strength: EvidenceStrength) => {
    switch (strength) {
      case 'Strong':
        return 'bg-success'
      case 'Medium':
        return 'bg-accent-primary'
      case 'Weak':
        return 'bg-warning'
      default:
        return 'bg-muted-foreground/20'
    }
  }

  const getEvidenceLabel = (strength: EvidenceStrength) => {
    switch (strength) {
      case 'Strong':
        return 'Strong'
      case 'Medium':
        return 'Medium'
      case 'Weak':
        return 'Low'
      default:
        return 'None'
    }
  }

  if (sortedRows.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">
          {searchQuery ? 'No projects match your search.' : 'No projects found.'}
        </p>
      </div>
    )
  }

  return (
    <div className="border border-border-subtle rounded-lg overflow-hidden shadow-sm bg-card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/20 border-b border-border-subtle">
            <tr>
              <th
                className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted/30 transition-colors duration-[175ms] ease-out"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center gap-1">
                  Project
                  <SortIcon columnKey="name" />
                </div>
              </th>
              <th
                className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted/30 transition-colors duration-[175ms] ease-out"
                onClick={() => handleSort('lastTouched')}
              >
                <div className="flex items-center gap-1">
                  Status
                  <SortIcon columnKey="lastTouched" />
                </div>
              </th>
              <th
                className="text-left px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide cursor-pointer hover:bg-muted/30 transition-colors duration-[175ms] ease-out"
                onClick={() => handleSort('evidenceScore')}
              >
                <div className="flex items-center gap-1">
                  Evidence strength
                  <SortIcon columnKey="evidenceScore" />
                </div>
              </th>
              <th className="text-right px-4 py-3.5 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {sortedRows.map((row) => (
              <tr
                key={row.projectId}
                className="hover:bg-muted/20 transition-colors duration-[175ms] ease-out cursor-pointer group border-b border-border-subtle"
                onClick={() => {
                  // Navigate to project opportunities if row is clicked (but not on button)
                  window.location.href = `/projects/${row.projectId}/opportunities`
                }}
              >
                <td className="px-4 py-4">
                  <div>
                    <div className="font-semibold text-foreground">{row.name}</div>
                    {row.subtitle && (
                      <div className="text-sm text-muted-foreground mt-0.5">{row.subtitle}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="space-y-1">
                    <Badge
                      variant={getStatusVariant(row.status)}
                      className="text-xs"
                    >
                      {row.status}
                    </Badge>
                    {row.lastRunAt && (
                      <div className="text-xs text-muted-foreground">
                        Last run {formatTimeLabel(row.lastRunAt)}
                      </div>
                    )}
                    {!row.lastRunAt && (
                      <div className="text-xs text-muted-foreground">
                        {formatNoRunsLabel()}
                      </div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-3">
                    <span className={cn(
                      "text-xs font-medium min-w-[50px]",
                      row.evidenceStrength === 'Strong' ? "text-success" :
                      row.evidenceStrength === 'Medium' ? "text-accent-primary" :
                      row.evidenceStrength === 'Weak' ? "text-warning" :
                      "text-muted-foreground"
                    )}>
                      {getEvidenceLabel(row.evidenceStrength)}
                    </span>
                    <div className="flex-1 max-w-[120px]">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            getEvidenceColor(row.evidenceStrength)
                          )}
                          style={{ width: `${row.evidenceScore}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {row.primaryCta === 'View Opportunities' ? (
                      <Button asChild size="sm" variant="default">
                        <Link href={row.primaryHref!}>
                          View opportunities
                        </Link>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        variant="default"
                        onClick={(e) => handleGenerateAnalysis(row.projectId, e)}
                        disabled={generatingProjectId === row.projectId}
                      >
                        {generatingProjectId === row.projectId ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-1" />
                            Starting...
                          </>
                        ) : (
                          'Run analysis'
                        )}
                      </Button>
                    )}
                    <Button asChild size="sm" variant="link" className="text-xs">
                      <Link href={`/projects/${row.projectId}/competitors`}>
                        Edit inputs
                      </Link>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

