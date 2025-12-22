import type { ScoringMatrixArtifactContent, CriterionScore } from '@/lib/schemas/scoring';
import { extractCitationsFromArtifact, normalizeCitation, type NormalizedCitation } from '@/lib/results/evidence';
import { scoreCompetitorCriteria } from './scoreCompetitorCriteria';
import type { ComputedScore } from './types';

/**
 * Computes evidence-backed score for a specific competitor/criterion pair
 * 
 * Strategy:
 * 1. Extract all citations from the scoring matrix artifact
 * 2. For each criterion score, check if it has evidence field or try to match citations
 * 3. If no citations found for this specific pair, check if dimensions are all defaults (0.5)
 * 4. If dimensions are defaults, return unscored; otherwise compute from dimensions as fallback
 */
export function computeScoreFromScoringMatrix(
  scoring: ScoringMatrixArtifactContent,
  competitorName: string,
  criteriaId: string
): ComputedScore {
  // Extract all citations from the scoring artifact
  const allCitations = extractCitationsFromArtifact(scoring);
  
  // Find the specific score for this competitor/criterion
  const criterionScore = scoring.scores?.find(
    s => s.competitor_name === competitorName && s.criteria_id === criteriaId
  );

  if (!criterionScore) {
    return {
      value: null,
      status: 'unscored',
      reason: 'not_computed',
      evidenceCount: 0,
      sourceTypes: [],
    };
  }

  // Try to extract citations from the evidence field if it exists
  let citationsForThisScore: NormalizedCitation[] = [];
  
  if (criterionScore.evidence) {
    // Try to parse evidence as JSON or extract URLs
    try {
      const evidenceObj = typeof criterionScore.evidence === 'string' 
        ? JSON.parse(criterionScore.evidence) 
        : criterionScore.evidence;
      
      if (Array.isArray(evidenceObj)) {
        const normalized = evidenceObj
          .map(normalizeCitation)
          .filter((c): c is NormalizedCitation => c !== null);
        citationsForThisScore = normalized;
      } else if (evidenceObj && typeof evidenceObj === 'object') {
        const citations = (evidenceObj as any).citations || (evidenceObj as any).sources || [];
        if (Array.isArray(citations)) {
          const normalized = citations
            .map(normalizeCitation)
            .filter((c): c is NormalizedCitation => c !== null);
          citationsForThisScore = normalized;
        }
      }
    } catch {
      // Evidence field is not JSON, might be plain text - skip
    }
  }

  // If we have citations, use evidence-backed scoring
  if (citationsForThisScore.length > 0) {
    return scoreCompetitorCriteria(citationsForThisScore);
  }

  // Check if dimensions are all at common default values - this indicates no real scoring
  // Common defaults: 0.5 (schema default), 0.2 (possible fallback), or all identical values
  const dims = criterionScore.dimensions;
  const allSame = 
    dims.discovery_support === dims.execution_support &&
    dims.execution_support === dims.reliability &&
    dims.reliability === dims.flexibility &&
    dims.flexibility === dims.friction;
  
  const isCommonDefault = 
    (dims.discovery_support === 0.5 && allSame) ||
    (dims.discovery_support === 0.2 && allSame) ||
    (dims.discovery_support === 0.0 && allSame);

  if (isCommonDefault) {
    // Likely a fallback/default score - mark as unscored
    return {
      value: null,
      status: 'unscored',
      reason: 'insufficient_evidence',
      evidenceCount: 0,
      sourceTypes: [],
    };
  }

  // If dimensions are not defaults, we have some scoring but no evidence
  // Compute score from dimensions as fallback (legacy behavior)
  const avg = (
    dims.discovery_support +
    dims.execution_support +
    dims.reliability +
    dims.flexibility +
    (1 - dims.friction)
  ) / 5;
  const dimensionScore = avg * 10;

  // But mark it as having missing evidence
  return {
    value: Math.round(dimensionScore * 10) / 10,
    status: 'scored',
    reason: 'missing_inputs', // Evidence not available but dimensions computed
    evidenceCount: 0,
    sourceTypes: [],
  };
}

