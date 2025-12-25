import { describe, it, expect } from 'vitest'
import { matchProjectSection } from '@/lib/routes'

describe('matchProjectSection', () => {
  const projectId = 'test-project-123'

  it('matches decision route', () => {
    expect(matchProjectSection(`/projects/${projectId}/decision`)).toBe('decision')
    expect(matchProjectSection(`/projects/${projectId}`)).toBe('decision')
  })

  it('matches opportunities list route', () => {
    expect(matchProjectSection(`/projects/${projectId}/opportunities`)).toBe('opportunities')
  })

  it('matches opportunity detail route and highlights opportunities', () => {
    expect(matchProjectSection(`/projects/${projectId}/opportunities/opp-123`)).toBe('opportunities')
    expect(matchProjectSection(`/projects/${projectId}/opportunities/some-opportunity-id`)).toBe('opportunities')
  })

  it('matches competitors route', () => {
    expect(matchProjectSection(`/projects/${projectId}/competitors`)).toBe('competitors')
  })

  it('matches scorecard route', () => {
    expect(matchProjectSection(`/projects/${projectId}/scorecard`)).toBe('scorecard')
  })

  it('matches evidence route', () => {
    expect(matchProjectSection(`/projects/${projectId}/evidence`)).toBe('evidence')
  })

  it('matches appendix route', () => {
    expect(matchProjectSection(`/projects/${projectId}/appendix`)).toBe('appendix')
  })

  it('matches settings route', () => {
    expect(matchProjectSection(`/projects/${projectId}/settings`)).toBe('settings')
  })

  it('defaults to decision for unknown routes', () => {
    expect(matchProjectSection(`/projects/${projectId}/unknown`)).toBe('decision')
    expect(matchProjectSection('/some/other/path')).toBe('decision')
  })

  it('handles paths with trailing slashes', () => {
    expect(matchProjectSection(`/projects/${projectId}/decision/`)).toBe('decision')
    expect(matchProjectSection(`/projects/${projectId}/opportunities/`)).toBe('opportunities')
  })
})

