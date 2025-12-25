/**
 * Static Example Coverage Artifacts
 * 
 * Mock coverage objects for demos, testing, and reference.
 * These represent evidence coverage levels for competitive analysis projects.
 * 
 * Use these for:
 * - Marketing/demo pages
 * - UI component development
 * - Testing coverage display logic
 */

export type CoverageLevel = 'limited' | 'moderate' | 'strong'

export interface ExampleCoverage {
  totalSources: number
  competitorCount: number
  evidenceTypesPresent: string[]
  coverageLevel: CoverageLevel
}

export const EXAMPLE_COVERAGE: ExampleCoverage[] = [
  {
    totalSources: 8,
    competitorCount: 3,
    evidenceTypesPresent: ['pricing', 'changelog'],
    coverageLevel: 'limited'
  },
  {
    totalSources: 24,
    competitorCount: 5,
    evidenceTypesPresent: ['pricing', 'changelog', 'reviews', 'docs'],
    coverageLevel: 'moderate'
  },
  {
    totalSources: 47,
    competitorCount: 7,
    evidenceTypesPresent: ['pricing', 'changelog', 'reviews', 'docs', 'jobs', 'status'],
    coverageLevel: 'strong'
  }
]

