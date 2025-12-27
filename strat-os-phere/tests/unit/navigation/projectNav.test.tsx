import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProjectNav } from '@/components/nav/ProjectNav'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  usePathname: () => '/projects/test-project-123/decision',
}))

describe('ProjectNav', () => {
  const defaultProps = {
    projectId: 'test-project-123',
    projectTitle: 'Test Project',
    subtitle: 'Test Market',
  }

  it('should render all canonical nav items', () => {
    render(<ProjectNav {...defaultProps} />)
    
    // Check that all workflow steps are present
    expect(screen.getByTestId('project-nav-item-decision')).toBeInTheDocument()
    expect(screen.getByTestId('project-nav-item-competitors')).toBeInTheDocument()
    expect(screen.getByTestId('project-nav-item-evidence')).toBeInTheDocument()
    expect(screen.getByTestId('project-nav-item-scorecard')).toBeInTheDocument()
    expect(screen.getByTestId('project-nav-item-appendix')).toBeInTheDocument()
    expect(screen.getByTestId('project-nav-item-settings')).toBeInTheDocument()
  })

  it('should render project title', () => {
    render(<ProjectNav {...defaultProps} />)
    expect(screen.getByText('Test Project')).toBeInTheDocument()
  })

  it('should render subtitle when provided', () => {
    render(<ProjectNav {...defaultProps} />)
    expect(screen.getByText('Test Market')).toBeInTheDocument()
  })

  it('should render "Back to Projects" link', () => {
    render(<ProjectNav {...defaultProps} />)
    expect(screen.getByTestId('back-to-projects-link')).toBeInTheDocument()
  })

  it('should mark active item with aria-current="page"', () => {
    render(<ProjectNav {...defaultProps} />)
    const activeLink = screen.getByTestId('project-nav-item-decision')
    expect(activeLink).toHaveAttribute('aria-current', 'page')
  })

  it('should render all items even when stepState is provided', () => {
    const stepState = {
      decision: 'complete' as const,
      competitors: 'blocked' as const,
      evidence: 'ready' as const,
    }
    
    render(<ProjectNav {...defaultProps} stepState={stepState} />)
    
    // All items should still be visible
    expect(screen.getByTestId('project-nav-item-decision')).toBeInTheDocument()
    expect(screen.getByTestId('project-nav-item-competitors')).toBeInTheDocument()
    expect(screen.getByTestId('project-nav-item-evidence')).toBeInTheDocument()
    expect(screen.getByTestId('project-nav-item-scorecard')).toBeInTheDocument()
    expect(screen.getByTestId('project-nav-item-appendix')).toBeInTheDocument()
    expect(screen.getByTestId('project-nav-item-settings')).toBeInTheDocument()
  })
})

