import { redirect } from 'next/navigation'

/**
 * Root project route redirects to canonical opportunities route
 * This ensures /projects/[projectId] → /projects/[projectId]/opportunities
 */
interface ProjectPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage(props: ProjectPageProps) {
  const params = await props.params
  const projectId = params.projectId
  
  // Redirect to canonical opportunities route
  redirect(`/projects/${projectId}/opportunities`)
}

