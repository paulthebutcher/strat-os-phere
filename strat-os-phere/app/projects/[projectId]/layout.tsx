import { notFound } from 'next/navigation'
import { ProjectLayoutShell } from '@/components/layout/ProjectLayoutShell'
import { getProjectById } from '@/lib/data/projects'
import { createClient } from '@/lib/supabase/server'

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectLayout(props: ProjectLayoutProps) {
  const params = await props.params
  const projectId = params.projectId

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    notFound()
  }

  const project = await getProjectById(supabase, projectId)

  if (!project || project.user_id !== user.id) {
    notFound()
  }

  return (
    <ProjectLayoutShell
      projectId={project.id}
      projectName={project.name}
      subtitle={project.market}
    >
      {props.children}
    </ProjectLayoutShell>
  )
}

