import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSection } from '@/components/layout/Section'
import { SkeletonCard } from '@/components/shared/Skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function DecisionLoading() {
  return (
    <PageShell size="wide">
      <PageSection>
        <Skeleton className="h-4 w-64" />
      </PageSection>

      <PageHeader
        title="Executive Readout"
        subtitle="Primary recommendation, confidence, and next steps"
        secondaryActions={
          <>
            <Skeleton className="h-9 w-20" />
            <Skeleton className="h-9 w-16" />
          </>
        }
      />

      <PageSection>
        <SkeletonCard />
      </PageSection>

      <PageSection>
        <Skeleton className="h-16 w-full" />
      </PageSection>

      <PageSection>
        <SkeletonCard />
      </PageSection>
    </PageShell>
  )
}

