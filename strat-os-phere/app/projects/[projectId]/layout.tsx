import { Suspense } from 'react'
import { ProjectLayoutContent } from '@/components/layout/ProjectLayoutContent'
import { ProjectLayoutSkeleton } from '@/components/layout/ProjectLayoutSkeleton'

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectLayout(props: ProjectLayoutProps) {
  const params = await props.params
  const projectId = params.projectId

  // Render layout shell immediately, load project data in Suspense
  // This prevents blocking the initial paint
  return (
    <Suspense fallback={<ProjectLayoutSkeleton>{props.children}</ProjectLayoutSkeleton>}>
      <ProjectLayoutContent projectId={projectId}>
        {props.children}
      </ProjectLayoutContent>
    </Suspense>
  )
}

