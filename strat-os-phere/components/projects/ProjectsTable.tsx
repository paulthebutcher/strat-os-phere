'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { formatRelativeDate } from './formatRelativeDate'
import { startEvidenceRun } from '@/lib/runs/startEvidenceRun'
import { addActiveRun } from '@/lib/runs/runToastStore'
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
        alert(result.message || 'Failed to start analysis. Please try again.')
      }
    } catch (error) {
      console.error('Error starting analysis:', error)
      alert('Failed to start analysis. Please try again.')
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

  const getEvidenceBadgeVariant = (strength: EvidenceStrength): 'success' | 'default' | 'secondary' | 'muted' => {
    switch (strength) {
      case 'Strong':
        return 'success'
      case 'Medium':
        return 'default'
      case 'Weak':
        return 'secondary'
      default:
        return 'muted'
    }
  }

  if (sortedRows.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-sm text-muted-foreground">
          {searchQuery ? 'No projects match your search.' : 'No projects yet.'}
        </p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            <tr>
              <th
                className="text-left px-4 py-3 text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('name')}
              >
                <div className="flex items-center">
                  Project
                  <SortIcon columnKey="name" />
                </div>
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('lastTouched')}
              >
                <div className="flex items-center">
                  Status
                  <SortIcon columnKey="lastTouched" />
                </div>
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('evidenceScore')}
              >
                <div className="flex items-center">
                  Evidence strength
                  <SortIcon columnKey="evidenceScore" />
                </div>
              </th>
              <th
                className="text-left px-4 py-3 text-sm font-semibold text-foreground cursor-pointer hover:bg-muted/70 transition-colors"
                onClick={() => handleSort('lastRun')}
              >
                <div className="flex items-center">
                  Last run
                  <SortIcon columnKey="lastRun" />
                </div>
              </th>
              <th className="text-left px-4 py-3 text-sm font-semibold text-foreground">
                Last touched
              </th>
              <th className="text-right px-4 py-3 text-sm font-semibold text-foreground">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {sortedRows.map((row) => (
              <tr
                key={row.projectId}
                className="hover:bg-muted/30 transition-colors cursor-pointer"
                onClick={() => {
                  // Navigate to project overview if row is clicked (but not on button)
                  window.location.href = `/projects/${row.projectId}/overview`
                }}
              >
                <td className="px-4 py-3">
                  <div>
                    <div className="font-semibold text-foreground">{row.name}</div>
                    {row.subtitle && (
                      <div className="text-sm text-muted-foreground mt-0.5">{row.subtitle}</div>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <Badge
                    variant={
                      row.status === 'Has results'
                        ? 'success'
                        : row.status === 'Ready'
                        ? 'default'
                        : 'secondary'
                    }
                    className="text-xs"
                  >
                    {row.status}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={getEvidenceBadgeVariant(row.evidenceStrength)}
                      className="text-xs"
                    >
                      {row.evidenceStrength}
                    </Badge>
                    <div className="flex-1 max-w-[80px]">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full transition-all",
                            row.evidenceScore >= 80
                              ? "bg-green-500"
                              : row.evidenceScore >= 50
                              ? "bg-yellow-500"
                              : row.evidenceScore > 0
                              ? "bg-orange-500"
                              : "bg-muted-foreground/20"
                          )}
                          style={{ width: `${row.evidenceScore}%` }}
                        />
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{row.evidenceScore}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-foreground">
                  {row.lastRunAt ? formatRelativeDate(row.lastRunAt) : 'Never'}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  {formatRelativeDate(row.lastTouchedAt)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                    {row.primaryCta === 'View Opportunities' ? (
                      <Button asChild size="sm" variant="default">
                        <Link href={row.primaryHref!}>
                          View Opportunities
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
                          'Generate Analysis'
                        )}
                      </Button>
                    )}
                    <Button asChild size="sm" variant="ghost">
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

