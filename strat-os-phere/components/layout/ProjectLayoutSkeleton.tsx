import { ProjectAppShell } from '@/components/layout/ProjectAppShell'
import { PageSection } from '@/components/layout/Section'
import { Skeleton } from '@/components/ui/skeleton'

export function ProjectLayoutSkeleton({ children }: { children: React.ReactNode }) {
  return (
    <ProjectAppShell
      projectId=""
      projectTitle={null}
      subtitle={null}
    >
      <PageSection className="border-b pb-4">
        <Skeleton className="h-12 w-full" />
      </PageSection>
      {children}
    </ProjectAppShell>
  )
}

