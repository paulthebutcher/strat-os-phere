import Link from 'next/link'
import { paths } from '@/lib/routes'

interface DeepDiveLinksProps {
  projectId: string
}

export function DeepDiveLinks({ projectId }: DeepDiveLinksProps) {
  return (
    <div className="p-4 bg-muted/30 rounded-lg border border-border-subtle">
      <h3 className="text-sm font-semibold text-foreground mb-3">Deep dives</h3>
      <div className="flex flex-wrap gap-3">
        <Link
          href={paths.opportunities(projectId)}
          prefetch
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          All opportunities →
        </Link>
        <Link
          href={paths.competitors(projectId)}
          prefetch
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Competitors →
        </Link>
        <Link
          href={paths.scorecard(projectId)}
          prefetch
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Scorecard →
        </Link>
        <Link
          href={paths.evidence(projectId)}
          prefetch
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          Evidence →
        </Link>
      </div>
    </div>
  )
}

