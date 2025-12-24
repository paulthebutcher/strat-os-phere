import { notFound } from 'next/navigation'
import { ProjectLayoutShell } from '@/components/layout/ProjectLayoutShell'
import { createClient } from '@/lib/supabase/server'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { loadProject } from '@/lib/projects/loadProject'

interface ProjectLayoutProps {
  children: React.ReactNode
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectLayout(props: ProjectLayoutProps) {
  const params = await props.params
  const projectId = params.projectId
  const route = `/projects/${projectId}`

  const supabase = await createClient()
  
  // Use unified project loader with structured error handling
  const result = await loadProject(supabase, projectId, undefined, route)
  
  if (!result.ok) {
    // Handle different error kinds
    if (result.kind === 'not_found' || result.kind === 'unauthorized') {
      notFound()
    }
    
    // For query failures (including schema drift), show error state
    return <ProjectErrorState projectId={projectId} isMissingColumn={result.isMissingColumn} />
  }

  const { project } = result

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

