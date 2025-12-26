import { PageShell } from '@/components/layout/PageShell'
import { PageHeader } from '@/components/layout/PageHeader'
import { PageSection } from '@/components/layout/Section'
import { SkeletonCard } from '@/components/shared/Skeletons'
import { Skeleton } from '@/components/ui/skeleton'

export default function DashboardLoading() {
  return (
    <PageShell>
      <PageHeader
        title="Projects"
        subtitle="Manage your competitive analyses and identify evidence-bound opportunities."
        primaryAction={
          <Skeleton className="h-10 w-32" />
        }
      />
      
      <PageSection>
        <Skeleton className="h-4 w-24" />
      </PageSection>

      <PageSection>
        <SkeletonCard />
      </PageSection>

      <PageSection>
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
      </PageSection>
    </PageShell>
  )
}

