import { redirect } from 'next/navigation'

/**
 * Root project route redirects to canonical overview route
 * This ensures /projects/[projectId] → /projects/[projectId]/overview
 */
interface ProjectPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage(props: ProjectPageProps) {
  const params = await props.params
  const projectId = params.projectId
  
  // Redirect to canonical overview route
  redirect(`/projects/${projectId}/overview`)
}

