import { redirect } from 'next/navigation'
import { paths } from '@/lib/routes'

/**
 * Root project route redirects to canonical decision route
 * This ensures /projects/[projectId] → /projects/[projectId]/decision
 */
interface ProjectPageProps {
  params: Promise<{
    projectId: string
  }>
}

export default async function ProjectPage(props: ProjectPageProps) {
  const params = await props.params
  const projectId = params.projectId
  
  // Redirect to canonical decision route
  redirect(paths.decision(projectId))
}

