import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { INVARIANTS, isAllowedProjectField } from '@/lib/health/invariants'
import { getLatestProjectInput } from '@/lib/data/projectInputs'
import { getLatestRunForProject } from '@/lib/data/projectRuns'

/**
 * Dev-only API endpoint for schema health checks
 * Gated behind NODE_ENV !== 'production' or ENABLE_DEV_TOOLS === 'true'
 */
export async function GET() {
  // Check if dev tools are enabled
  const isProduction = process.env.NODE_ENV === 'production'
  const devToolsEnabled = process.env.ENABLE_DEV_TOOLS === 'true'

  if (isProduction && !devToolsEnabled) {
    return NextResponse.json({ error: 'Not available in production' }, { status: 404 })
  }

  const supabase = await createClient()

  // Verify user is authenticated
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Check 1: Projects table - get a sample project and check its columns
    const { data: projects, error: projectsError } = await supabase
      .from('projects')
      .select('*')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle()

    let projectsStatus: 'ok' | 'warning' | 'error' = 'ok'
    let projectsMessage = 'OK: projects uses only stable columns'
    let sampleProject: {
      id: string
      columns: string[]
      unexpectedColumns: string[]
    } | undefined
    let projectId: string | null = null

    if (projectsError) {
      projectsStatus = 'error'
      projectsMessage = `Error querying projects: ${projectsError.message}`
    } else if (projects) {
      projectId = String((projects as any).id)
      const columns = Object.keys(projects)
      const unexpectedColumns = columns.filter((col) => !isAllowedProjectField(col))
      
      sampleProject = {
        id: projectId,
        columns,
        unexpectedColumns,
      }

      if (unexpectedColumns.length > 0) {
        projectsStatus = 'warning'
        projectsMessage = `Projects table contains ${unexpectedColumns.length} unexpected column(s): ${unexpectedColumns.join(', ')}`
      }
    } else {
      projectsMessage = 'No projects found (this is OK if you haven\'t created any yet)'
    }

    // Check 2: Project inputs - get latest input for a project
    let inputsStatus: 'ok' | 'warning' | 'error' = 'ok'
    let inputsMessage = 'OK: project_inputs table accessible'
    let sampleInput: {
      projectId: string
      version: number
      status: string
      hasInputJson: boolean
      createdAt: string
    } | undefined

    if (projectId) {
      const inputResult = await getLatestProjectInput(supabase, projectId)
      
      if (!inputResult.ok) {
        inputsStatus = 'warning'
        inputsMessage = `Could not fetch project inputs: ${inputResult.error.message}`
      } else if (inputResult.data) {
        inputsMessage = 'OK: project_inputs contains versioned inputs'
        sampleInput = {
          projectId: inputResult.data.project_id,
          version: inputResult.data.version,
          status: inputResult.data.status,
          hasInputJson: !!inputResult.data.input_json && Object.keys(inputResult.data.input_json).length > 0,
          createdAt: inputResult.data.created_at,
        }
      } else {
        inputsMessage = 'No inputs yet (this is OK for new projects)'
      }
    } else {
      inputsMessage = 'No projects to check inputs for'
    }

    // Check 3: Project runs - get latest run for a project
    let runsStatus: 'ok' | 'warning' | 'error' = 'ok'
    let runsMessage = 'OK: project_runs table accessible and latest run is derived correctly'
    let sampleRun: {
      projectId: string
      id: string
      status: string
      createdAt: string
      hasOutput: boolean
    } | undefined

    if (projectId) {
      const runResult = await getLatestRunForProject(supabase, projectId)
      
      if (!runResult.ok) {
        runsStatus = 'warning'
        runsMessage = `Could not fetch project runs: ${runResult.error.message}`
      } else if (runResult.data) {
        runsMessage = 'OK: latest run derived from project_runs (not from projects table)'
        sampleRun = {
          projectId: runResult.data.project_id,
          id: runResult.data.id,
          status: runResult.data.status,
          createdAt: runResult.data.created_at,
          hasOutput: !!runResult.data.output && Object.keys(runResult.data.output).length > 0,
        }
      } else {
        runsMessage = 'No runs yet (this is OK for new projects)'
      }
    } else {
      runsMessage = 'No projects to check runs for'
    }

    return NextResponse.json({
      projects: {
        status: projectsStatus,
        message: projectsMessage,
        sampleProject,
      },
      inputs: {
        status: inputsStatus,
        message: inputsMessage,
        sampleInput,
      },
      runs: {
        status: runsStatus,
        message: runsMessage,
        sampleRun,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

