'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { INVARIANTS, isAllowedProjectField } from '@/lib/health/invariants'

interface HealthCheckResult {
  projects: {
    status: 'ok' | 'warning' | 'error'
    message: string
    sampleProject?: {
      id: string
      columns: string[]
      unexpectedColumns: string[]
    }
  }
  inputs: {
    status: 'ok' | 'warning' | 'error'
    message: string
    sampleInput?: {
      projectId: string
      version: number
      status: string
      hasInputJson: boolean
      createdAt: string
    }
  }
  runs: {
    status: 'ok' | 'warning' | 'error'
    message: string
    sampleRun?: {
      projectId: string
      id: string
      status: string
      createdAt: string
      hasOutput: boolean
    }
  }
}

export function SchemaHealthClient() {
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<HealthCheckResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleRunChecks = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch('/api/dev/schema-health')
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to run health checks')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: 'ok' | 'warning' | 'error') => {
    switch (status) {
      case 'ok':
        return <Badge variant="default" className="bg-green-600">✅ OK</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-600">⚠️ Warning</Badge>
      case 'error':
        return <Badge variant="danger">❌ Error</Badge>
    }
  }

  const formatDate = (dateStr: string | null | undefined): string => {
    if (!dateStr) return '—'
    try {
      return new Date(dateStr).toLocaleString()
    } catch {
      return 'Invalid date'
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Schema Health Report</h1>
        <p className="text-muted-foreground">
          Dev-only tool to validate architectural invariants in a real database environment
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex gap-4 items-center">
          <Button onClick={handleRunChecks} disabled={loading}>
            {loading ? 'Running checks...' : 'Run Checks'}
          </Button>
          {data && (
            <div className="text-sm text-muted-foreground">
              Last checked: {new Date().toLocaleTimeString()}
            </div>
          )}
        </div>
      </Card>

      {error && (
        <Card className="p-6 mb-6 border-destructive">
          <div className="text-destructive font-medium">Error</div>
          <div className="text-sm text-muted-foreground mt-1">{error}</div>
        </Card>
      )}

      {data && (
        <div className="space-y-6">
          {/* Projects Table Health */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Projects Table</h2>
              {getStatusBadge(data.projects.status)}
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{data.projects.message}</p>
              
              {data.projects.sampleProject && (
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium">Sample Project (ID: {data.projects.sampleProject.id})</div>
                  <div className="text-xs text-muted-foreground">
                    Columns found: {data.projects.sampleProject.columns.length}
                  </div>
                  
                  {data.projects.sampleProject.unexpectedColumns.length > 0 ? (
                    <div className="mt-2">
                      <div className="text-xs font-medium text-destructive mb-1">
                        Unexpected columns ({data.projects.sampleProject.unexpectedColumns.length}):
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {data.projects.sampleProject.unexpectedColumns.map((col) => (
                          <Badge key={col} variant="danger" className="text-xs">
                            {col}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs text-green-600">
                      ✅ All columns are in allowed list
                    </div>
                  )}
                  
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer text-muted-foreground">
                      Show all columns
                    </summary>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {data.projects.sampleProject.columns.map((col) => (
                        <Badge 
                          key={col} 
                          variant={isAllowedProjectField(col) ? "default" : "danger"}
                          className="text-xs"
                        >
                          {col}
                        </Badge>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          </Card>

          {/* Project Inputs Health */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Project Inputs</h2>
              {getStatusBadge(data.inputs.status)}
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{data.inputs.message}</p>
              
              {data.inputs.sampleInput && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Project ID:</span>
                      <div className="font-mono text-xs">{data.inputs.sampleInput.projectId}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Version:</span>
                      <div className="font-medium">{data.inputs.sampleInput.version}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div>
                        <Badge variant={data.inputs.sampleInput.status === 'final' ? 'default' : 'secondary'}>
                          {data.inputs.sampleInput.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Has input_json:</span>
                      <div>
                        {data.inputs.sampleInput.hasInputJson ? (
                          <Badge variant="default">✅ Yes</Badge>
                        ) : (
                          <Badge variant="secondary">❌ No</Badge>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Created:</span>
                      <div className="text-xs">{formatDate(data.inputs.sampleInput.createdAt)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Project Runs Health */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Project Runs</h2>
              {getStatusBadge(data.runs.status)}
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">{data.runs.message}</p>
              
              {data.runs.sampleRun && (
                <div className="mt-4 space-y-2 text-sm">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <span className="text-muted-foreground">Project ID:</span>
                      <div className="font-mono text-xs">{data.runs.sampleRun.projectId}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Run ID:</span>
                      <div className="font-mono text-xs">{data.runs.sampleRun.id}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Status:</span>
                      <div>
                        <Badge 
                          variant={
                            data.runs.sampleRun.status === 'succeeded' ? 'default' :
                            data.runs.sampleRun.status === 'failed' ? 'danger' :
                            'secondary'
                          }
                        >
                          {data.runs.sampleRun.status}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Has output:</span>
                      <div>
                        {data.runs.sampleRun.hasOutput ? (
                          <Badge variant="default">✅ Yes</Badge>
                        ) : (
                          <Badge variant="secondary">❌ No</Badge>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Created:</span>
                      <div className="text-xs">{formatDate(data.runs.sampleRun.createdAt)}</div>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    ✅ Latest run derived from project_runs query (not from projects table)
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Invariants Summary */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Architectural Invariants</h2>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium mb-1">Projects Table</div>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Allowed columns: {INVARIANTS.projects.allowedColumns.length} columns</li>
                  <li>Stable columns: {INVARIANTS.projects.stableColumns.length} columns</li>
                  <li>Forbid derived run state: {INVARIANTS.projects.forbidDerivedRunState ? '✅' : '❌'}</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Inputs</div>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Source: {INVARIANTS.inputs.source}</li>
                  <li>Versioned: {INVARIANTS.inputs.versioned ? '✅' : '❌'}</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-1">Runs</div>
                <ul className="list-disc list-inside text-muted-foreground space-y-1 ml-2">
                  <li>Source: {INVARIANTS.runs.source}</li>
                  <li>Append-only: {INVARIANTS.runs.appendOnly ? '✅' : '❌'}</li>
                  <li>No projects latest pointers: {INVARIANTS.runs.noProjectsLatestPointers ? '✅' : '❌'}</li>
                </ul>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

