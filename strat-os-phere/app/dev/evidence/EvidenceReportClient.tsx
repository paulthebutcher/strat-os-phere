'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible } from '@/components/ui/collapsible'
import type { EvidenceReport } from '@/lib/evidence/evidenceReport'

interface EvidenceReportResponse {
  bundleFound: boolean
  artifactId?: string
  updatedAt?: string
  report: EvidenceReport
  sampleUrlsByType: Record<string, string[]>
}

const EVIDENCE_TYPE_LABELS: Record<string, string> = {
  pricing: 'Pricing',
  docs: 'Docs',
  reviews: 'Reviews',
  jobs: 'Jobs',
  changelog: 'Changelog',
  blog: 'Blog',
  community: 'Community',
  security: 'Security',
  other: 'Other',
}

export function EvidenceReportClient() {
  const [projectId, setProjectId] = React.useState('')
  const [loading, setLoading] = React.useState(false)
  const [data, setData] = React.useState<EvidenceReportResponse | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const handleLoad = async () => {
    if (!projectId.trim()) {
      setError('Please enter a project ID')
      return
    }

    setLoading(true)
    setError(null)
    setData(null)

    try {
      const response = await fetch(`/api/dev/evidence-report?projectId=${encodeURIComponent(projectId.trim())}`)
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        throw new Error(errorData.message || errorData.error || `HTTP ${response.status}`)
      }

      const result = await response.json()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load report')
    } finally {
      setLoading(false)
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

  const formatDaysAgo = (dateStr: string | null | undefined): string => {
    if (!dateStr) return 'Unknown'
    try {
      const date = new Date(dateStr)
      const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
      if (daysAgo === 0) return 'Today'
      if (daysAgo === 1) return '1 day ago'
      return `${daysAgo} days ago`
    } catch {
      return 'Unknown'
    }
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Evidence Report</h1>
        <p className="text-muted-foreground">
          Dev-only tool to validate evidence bundle health for a project
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex gap-4">
          <Input
            placeholder="Enter project ID"
            value={projectId}
            onChange={(e) => setProjectId(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !loading) {
                handleLoad()
              }
            }}
            className="flex-1"
          />
          <Button onClick={handleLoad} disabled={loading}>
            {loading ? 'Loading...' : 'Load Report'}
          </Button>
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
          {/* Status */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <div className="flex items-center gap-2">
              {data.bundleFound ? (
                <>
                  <Badge variant="default" className="text-sm">✅ Bundle found</Badge>
                  {data.artifactId && (
                    <span className="text-sm text-muted-foreground">
                      Artifact ID: {data.artifactId}
                    </span>
                  )}
                  {data.updatedAt && (
                    <span className="text-sm text-muted-foreground">
                      Updated: {formatDate(data.updatedAt)} ({formatDaysAgo(data.updatedAt)})
                    </span>
                  )}
                </>
              ) : (
                <Badge variant="secondary" className="text-sm">❌ No bundle found</Badge>
              )}
            </div>
          </Card>

          {data.bundleFound && (
            <>
              {/* Summary Stats */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Summary</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Total Sources
                    </div>
                    <div className="text-2xl font-bold">{data.report.totalSources}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Coverage
                    </div>
                    <div className="text-2xl font-bold">{data.report.coverage}%</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      First-party
                    </div>
                    <div className="text-2xl font-bold">{data.report.firstPartyCount}</div>
                  </div>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                      Third-party
                    </div>
                    <div className="text-2xl font-bold">{data.report.thirdPartyCount}</div>
                  </div>
                </div>
              </Card>

              {/* Counts by Type */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Counts by Type</h2>
                <div className="space-y-2">
                  {Object.entries(data.report.countsByType).map(([type, count]) => (
                    <div key={type} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="font-medium">{EVIDENCE_TYPE_LABELS[type] || type}</span>
                      <Badge variant={count > 0 ? 'default' : 'secondary'}>
                        {count}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Missing Types */}
              {data.report.missingTypes.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Missing Types</h2>
                  <div className="flex flex-wrap gap-2">
                    {data.report.missingTypes.map((type) => (
                      <Badge key={type} variant="secondary">
                        {EVIDENCE_TYPE_LABELS[type] || type}
                      </Badge>
                    ))}
                  </div>
                </Card>
              )}

              {/* Recency */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recency</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Most recent retrieved:</span>
                    <span className="font-medium">
                      {data.report.recency.mostRecentRetrievedAt
                        ? `${formatDate(data.report.recency.mostRecentRetrievedAt)} (${formatDaysAgo(data.report.recency.mostRecentRetrievedAt)})`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Oldest retrieved:</span>
                    <span className="font-medium">
                      {data.report.recency.oldestRetrievedAt
                        ? formatDate(data.report.recency.oldestRetrievedAt)
                        : '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published date coverage:</span>
                    <span className="font-medium">{data.report.recency.publishedAtCoverage}%</span>
                  </div>
                </div>
              </Card>

              {/* Top Domains */}
              {data.report.topDomains.length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Top Domains</h2>
                  <div className="space-y-2">
                    {data.report.topDomains.map(({ domain, count }) => (
                      <div key={domain} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="font-mono text-sm">{domain}</span>
                        <Badge variant="secondary">{count}</Badge>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Sample URLs by Type */}
              {Object.keys(data.sampleUrlsByType).length > 0 && (
                <Card className="p-6">
                  <h2 className="text-xl font-semibold mb-4">Sample URLs by Type</h2>
                  <div className="space-y-4">
                    {Object.entries(data.sampleUrlsByType).map(([type, urls]) => (
                      <div key={type}>
                        <div className="font-medium mb-2">{EVIDENCE_TYPE_LABELS[type] || type}</div>
                        <ul className="space-y-1">
                          {urls.map((url, idx) => (
                            <li key={idx}>
                              <a
                                href={url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-primary hover:underline break-all"
                              >
                                {url}
                              </a>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              {/* Raw JSON */}
              <Card className="p-6">
                <Collapsible title="Raw JSON" defaultOpen={false}>
                  <pre className="mt-4 p-4 bg-muted rounded-lg overflow-auto text-xs">
                    {JSON.stringify(data, null, 2)}
                  </pre>
                </Collapsible>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  )
}

