/**
 * Canonical normalization layer for Results artifacts
 * 
 * This module provides a single, unified interface for normalizing artifacts
 * into a consistent view model for rendering. It handles:
 * - Multiple artifact versions (v1/v2/v3) gracefully
 * - Envelope vs bare content formats
 * - Missing/invalid artifacts (returns null, never throws)
 * - Evidence summary derivation
 * 
 * Server-safe: no React imports, can be used in server components and API routes.
 */

import type { Artifact } from '@/lib/supabase/types'
import {
  normalizeResultsArtifacts as normalizeArtifacts,
  type NormalizedResultsArtifacts,
  type NormalizedOpportunitiesV3Artifact,
  type NormalizedOpportunitiesV2Artifact,
  type NormalizedStrategicBetsArtifact,
  type NormalizedProfilesArtifact,
  type NormalizedJtbdArtifact,
} from '@/lib/results/normalizeArtifacts'
import {
  extractCitationsFromAllArtifacts,
  summarizeEvidence,
  type EvidenceSummary,
} from '@/lib/results/evidence'

/**
 * Best available opportunities artifact (prefers v3 over v2, then newest by created_at)
 */
export interface BestOpportunities {
  v3: NormalizedOpportunitiesV3Artifact | null
  v2: NormalizedOpportunitiesV2Artifact | null
  // Convenience: the best one (v3 if available, otherwise v2)
  best: NormalizedOpportunitiesV3Artifact | NormalizedOpportunitiesV2Artifact | null
}

/**
 * Normalized Results view model
 * Single canonical shape for rendering Results UI
 */
export interface NormalizedResults {
  /**
   * Best available opportunities artifact
   * Prefers newest schema_version, then newest created_at
   */
  opportunities: BestOpportunities

  /**
   * Best available strategic bets artifact
   * Prefers newest schema_version, then newest created_at
   */
  strategicBets: NormalizedStrategicBetsArtifact | null

  /**
   * Best available competitor profiles artifact
   * Prefers newest created_at
   */
  profiles: NormalizedProfilesArtifact | null

  /**
   * Best available JTBD artifact (if present)
   */
  jtbd: NormalizedJtbdArtifact | null

  /**
   * Evidence summary derived from all artifacts
   * Includes counts, recency, confidence metrics
   * null if no evidence artifacts exist
   */
  evidenceSummary: EvidenceSummary | null

  /**
   * Metadata about the normalized results
   */
  meta: {
    projectId: string
    lastGeneratedAt: string | null
    availableArtifactTypes: string[]
    schemaVersionsPresent: number[]
  }
}

/**
 * Pick the best artifact from a list based on schema_version and created_at
 * 
 * Rules:
 * 1. Prefer artifacts with higher schema_version
 * 2. If schema_version ties, prefer newest created_at
 * 3. If no schema_version, prefer newest created_at
 */
function pickBestArtifact<T extends { 
  content?: { meta?: { schema_version?: number } }
  artifactCreatedAt: string 
}>(
  artifacts: T[]
): T | null {
  if (artifacts.length === 0) return null

  // Group by schema_version (undefined/null treated as 0)
  const byVersion = new Map<number, T[]>()
  for (const artifact of artifacts) {
    const version = artifact.content?.meta?.schema_version ?? 0
    if (!byVersion.has(version)) {
      byVersion.set(version, [])
    }
    byVersion.get(version)!.push(artifact)
  }

  // Get highest schema_version
  const maxVersion = Math.max(...Array.from(byVersion.keys()))
  const candidates = byVersion.get(maxVersion) ?? []

  if (candidates.length === 0) return null

  // Sort by created_at (newest first)
  return candidates.sort(
    (a, b) =>
      new Date(b.artifactCreatedAt).getTime() -
      new Date(a.artifactCreatedAt).getTime()
  )[0]
}

/**
 * Parse artifact content safely
 * Handles both envelope (content_json wrapped) and bare content
 */
function parseArtifactContent(artifact: Artifact): unknown {
  // Artifacts are already parsed from JSON in the database layer
  // This is a placeholder for any additional parsing logic needed
  return artifact.content_json
}

/**
 * Normalize results artifacts into a single canonical view model
 * 
 * This is the ONE function that all Results UI should use for normalization.
 * It handles version selection, evidence summary, and metadata aggregation.
 * 
 * @param artifacts - Raw artifacts from the database
 * @param projectId - Project ID for metadata
 * @returns NormalizedResults view model
 */
export function normalizeResultsArtifacts(
  artifacts: Artifact[],
  projectId: string
): NormalizedResults {
  // Use existing normalization logic
  const normalized = normalizeArtifacts(artifacts)

  // Build opportunities (prefer v3, fallback to v2)
  const opportunities: BestOpportunities = {
    v3: normalized.opportunitiesV3,
    v2: normalized.opportunitiesV2,
    best: normalized.opportunitiesV3 ?? normalized.opportunitiesV2 ?? null,
  }

  // Strategic bets (already picked best by normalizeArtifacts)
  const strategicBets = normalized.strategicBets

  // Profiles (already picked best by normalizeArtifacts)
  const profiles = normalized.profiles

  // JTBD (already picked best by normalizeArtifacts)
  const jtbd = normalized.jtbd

  // Extract citations from all artifacts to build evidence summary
  const allArtifacts: unknown[] = [
    opportunities.v3?.content,
    opportunities.v2?.content,
    strategicBets?.content,
    profiles ? { snapshots: profiles.snapshots } : null,
    normalized.jtbd?.content,
    normalized.synthesis?.synthesis,
  ].filter((a) => a !== null)

  const citations = extractCitationsFromAllArtifacts(...allArtifacts)
  const evidenceSummary = citations.length > 0 ? summarizeEvidence(citations) : null

  // Collect available artifact types and schema versions
  const availableArtifactTypes: string[] = []
  const schemaVersionsPresentSet = new Set<number>()

  if (normalized.profiles) availableArtifactTypes.push('profiles')
  if (normalized.synthesis) availableArtifactTypes.push('synthesis')
  if (normalized.jtbd) {
    availableArtifactTypes.push('jtbd')
    const version = (normalized.jtbd.content?.meta as { schema_version?: number } | undefined)?.schema_version
    if (version) schemaVersionsPresentSet.add(version)
  }
  if (normalized.opportunitiesV3) {
    availableArtifactTypes.push('opportunities_v3')
    const version = (normalized.opportunitiesV3.content?.meta as { schema_version?: number } | undefined)?.schema_version
    if (version) schemaVersionsPresentSet.add(version)
  }
  if (normalized.opportunitiesV2) {
    availableArtifactTypes.push('opportunities_v2')
    const version = (normalized.opportunitiesV2.content?.meta as { schema_version?: number } | undefined)?.schema_version
    if (version) schemaVersionsPresentSet.add(version)
  }
  if (normalized.scoringMatrix) {
    availableArtifactTypes.push('scoring_matrix')
    const version = (normalized.scoringMatrix.content?.meta as { schema_version?: number } | undefined)?.schema_version
    if (version) schemaVersionsPresentSet.add(version)
  }
  if (normalized.strategicBets) {
    availableArtifactTypes.push('strategic_bets')
    const version = (normalized.strategicBets.content?.meta as { schema_version?: number } | undefined)?.schema_version
    if (version) schemaVersionsPresentSet.add(version)
  }

  return {
    opportunities,
    strategicBets,
    profiles,
    jtbd,
    evidenceSummary,
    meta: {
      projectId,
      lastGeneratedAt: normalized.generatedAt,
      availableArtifactTypes,
      schemaVersionsPresent: Array.from(schemaVersionsPresentSet).sort((a, b) => b - a),
    },
  }
}

