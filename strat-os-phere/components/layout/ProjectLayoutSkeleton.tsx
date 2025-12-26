import { ProjectLayoutShell } from '@/components/layout/ProjectLayoutShell'
import { PageSection } from '@/components/layout/Section'
import { Skeleton } from '@/components/ui/skeleton'

export function ProjectLayoutSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <ProjectLayoutShell
      projectId=""
      projectName={null}
      subtitle={null}
    >
      <PageSection className="border-b pb-4">
        <Skeleton className="h-12 w-full" />
      </PageSection>
      {children}
    </ProjectLayoutShell>
  )
}

