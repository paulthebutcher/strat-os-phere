import { notFound } from 'next/navigation'
import { ProjectLayoutShell } from '@/components/layout/ProjectLayoutShell'
import { createClient } from '@/lib/supabase/server'
import { ProjectErrorState } from '@/components/projects/ProjectErrorState'
import { loadProject } from '@/lib/projects/loadProject'
import { toAppError, SchemaMismatchError, NotFoundError, UnauthorizedError } from '@/lib/errors/errors'
import { logAppError } from '@/lib/errors/log'
import { ProjectStatusBarWrapper } from '@/components/projects/ProjectStatusBarWrapper'
import { PageSection } from '@/components/layout/Section'

interface ProjectLayoutContentProps {
  projectId: string
  children: React.ReactNode
}

export async function ProjectLayoutContent({ projectId, children }: ProjectLayoutContentProps) {
  const route = `/projects/${projectId}`
  const supabase = await createClient()
  
  // Use unified project loader with structured error handling
  const result = await loadProject(supabase, projectId, undefined, route)
  
  if (!result.ok) {
    // Convert to AppError
    let appError: ReturnType<typeof toAppError>
    
    if (result.kind === 'not_found') {
      appError = new NotFoundError(
        result.message || 'Project not found',
        {
          action: { label: 'Back to Projects', href: '/dashboard' },
          details: { projectId, route },
        }
      )
    } else if (result.kind === 'unauthorized') {
      appError = new UnauthorizedError(
        result.message || 'You do not have access to this project',
        {
          action: { label: 'Sign in', href: '/login' },
          details: { projectId, route },
        }
      )
    } else {
      // query_failed - map to SchemaMismatchError if appropriate, otherwise generic
      if (result.isMissingColumn) {
        appError = new SchemaMismatchError(
          result.message || 'Schema mismatch detected',
          {
            details: { projectId, route, isMissingColumn: true },
          }
        )
      } else {
        appError = toAppError(
          new Error(result.message || 'Failed to load project'),
          { projectId, route, kind: result.kind }
        )
      }
    }
    
    logAppError('project.layout', appError, { projectId, route, kind: result.kind })
    
    // For not_found and unauthorized, use Next.js notFound() for proper 404 handling
    if (result.kind === 'not_found' || result.kind === 'unauthorized') {
      notFound()
    }
    
    // For query failures, show error state
    return <ProjectErrorState error={appError} projectId={projectId} />
  }

  const { project } = result

  return (
    <ProjectLayoutShell
      projectId={project.id}
      projectName={project.name}
      subtitle={project.market}
    >
      {/* Project Status Bar - appears on all project pages */}
      <PageSection className="border-b pb-4">
        <ProjectStatusBarWrapper
          supabase={supabase}
          projectId={project.id}
          route={route}
        />
      </PageSection>
      {children}
    </ProjectLayoutShell>
  )
}

