import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSection } from '@/components/layout/Section'
import { SkeletonCard } from '@/components/shared/Skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function OpportunitiesLoading() {
  return (
    <PageShell size="wide">
      <PageSection>
        <Skeleton className="h-4 w-64" />
      </PageSection>

      <PageHeader
        title="Opportunities"
        subtitle="Candidate opportunities ranked by score. Click any opportunity to explore in detail."
        secondaryActions={
          <>
            <Skeleton className="h-9 w-16" />
            <Skeleton className="h-9 w-20" />
          </>
        }
      />

      <PageSection>
        <SkeletonCard />
      </PageSection>

      <PageSection>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </PageSection>
    </PageShell>
  )
}

