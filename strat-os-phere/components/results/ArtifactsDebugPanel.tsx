import { listArtifacts } from '@/lib/data/artifacts'
import { createClient } from '@/lib/supabase/server'

interface ArtifactsDebugPanelProps {
  projectId: string
}

/**
 * Debug panel for viewing artifact types in dev/preview only
 * Server component that displays artifact info
 */
export async function ArtifactsDebugPanel({ projectId }: ArtifactsDebugPanelProps) {
  // Only show in dev/preview
  if (process.env.NODE_ENV === 'production') {
    return null
  }

  const supabase = await createClient()
  const artifacts = await listArtifacts(supabase, { projectId })

  const artifactInfo = artifacts.map((artifact) => {
    const content = artifact.content_json as { meta?: { schema_version?: number } }
    return {
      type: artifact.type,
      created_at: artifact.created_at,
      schema_version: content?.meta?.schema_version,
    }
  })

  return (
    <details className="mt-4 panel p-3 text-xs">
      <summary className="cursor-pointer font-semibold mb-2">
        🔍 Artifact Debug Info (dev only)
      </summary>
      <div className="mt-2 space-y-1">
        {artifactInfo.length === 0 ? (
          <p className="text-text-secondary">No artifacts found</p>
        ) : (
          <ul className="space-y-2">
            {artifactInfo.map((artifact, index) => (
              <li key={index} className="border-b border-border-subtle pb-2 last:border-b-0">
                <div className="font-medium">{artifact.type}</div>
                <div className="text-text-secondary">
                  Created: {new Date(artifact.created_at).toLocaleString()}
                </div>
                {artifact.schema_version !== undefined && (
                  <div className="text-text-secondary">
                    Schema version: {artifact.schema_version}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </details>
  )
}

