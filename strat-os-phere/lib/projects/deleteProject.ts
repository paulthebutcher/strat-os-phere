'use client'

/**
 * Client-side function to delete a project
 */
export async function deleteProject(projectId: string): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const response = await fetch(`/api/projects/${projectId}`, {
      method: 'DELETE',
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({ message: 'Failed to delete project' }))
      return {
        ok: false,
        message: data.message || 'Failed to delete project',
      }
    }

    // 204 No Content means success
    return { ok: true }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
    }
  }
}

