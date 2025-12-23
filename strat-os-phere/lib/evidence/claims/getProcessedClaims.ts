/**
 * Server-side helper to load and process claims for a project
 * Returns processed claims and coverage metrics
 */

import type { TypedSupabaseClient } from '@/lib/supabase/types'
import { loadClaimsForProject } from './load'
import { processClaims } from './process'
import { computeEvidenceCoverage } from '../coverage'
import type { EvidenceCoverage, ClaimsByType } from './types'

export interface ProcessedClaimsResult {
  claimsByType: ClaimsByType
  coverage: EvidenceCoverage
  hasClaims: boolean
}

/**
 * Load and process claims for a project
 * 
 * @param supabase - Supabase client
 * @param projectId - Project ID
 * @param competitorDomains - Competitor domains for first-party detection and ranking
 * @returns Processed claims and coverage metrics
 */
export async function getProcessedClaims(
  supabase: TypedSupabaseClient,
  projectId: string,
  competitorDomains: string[] = []
): Promise<ProcessedClaimsResult> {
  // Load claims
  const rawClaimsByType = await loadClaimsForProject(supabase, projectId)
  
  // Check if we have any claims
  const hasClaims = Object.values(rawClaimsByType).some(claims => claims.length > 0)
  
  if (!hasClaims) {
    // Return empty coverage
    const emptyCoverage: EvidenceCoverage = {
      typesPresent: [],
      countsByType: {
        pricing: 0,
        docs: 0,
        reviews: 0,
        jobs: 0,
        changelog: 0,
        blog: 0,
        community: 0,
        security: 0,
        other: 0,
      },
      firstPartyRatio: 0,
      recencyScore: 0,
      coverageScore: 0,
      overallConfidenceLabel: 'Insufficient',
      gaps: [],
    }
    
    return {
      claimsByType: rawClaimsByType,
      coverage: emptyCoverage,
      hasClaims: false,
    }
  }
  
  // Process claims (dedupe and rank)
  const processedClaimsByType = processClaims(rawClaimsByType, competitorDomains)
  
  // Compute coverage
  const coverage = computeEvidenceCoverage(processedClaimsByType, competitorDomains)
  
  return {
    claimsByType: processedClaimsByType,
    coverage,
    hasClaims: true,
  }
}

