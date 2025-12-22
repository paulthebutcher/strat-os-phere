import type { ComputedScore } from './types';
import type { NormalizedCitation } from '@/lib/results/evidence';

/**
 * Evidence-backed scoring for competitor criteria
 * 
 * Scoring algorithm:
 * - coverageScore (0-6): based on citation count
 * - recencyScore (0-2): based on newest evidence age
 * - diversityScore (0-2): unique source types count
 * 
 * Total: 0-10, normalized to one decimal, clamped [0,10]
 * 
 * Rules:
 * - If citations are 0 => value:null, status:'unscored', reason:'insufficient_evidence'
 * - If dates missing but citations exist => still score, but recencyScore becomes 0
 */
export function scoreCompetitorCriteria(
  citations: NormalizedCitation[]
): ComputedScore {
  const evidenceCount = citations.length;
  const sourceTypes = Array.from(new Set(citations.map(c => c.sourceType)));

  // Extract dates
  const dates = citations
    .map(c => c.date)
    .filter((d): d is Date => d !== undefined)
    .sort((a, b) => a.getTime() - b.getTime()); // Oldest first

  const oldestEvidenceAt = dates.length > 0 ? dates[0].toISOString() : undefined;
  const newestEvidenceAt = dates.length > 0 ? dates[dates.length - 1].toISOString() : undefined;

  // If no citations, return unscored
  if (evidenceCount === 0) {
    return {
      value: null,
      status: 'unscored',
      reason: 'insufficient_evidence',
      evidenceCount: 0,
      sourceTypes: [],
    };
  }

  // Coverage score (0-6) based on citation count
  let coverageScore: number;
  if (evidenceCount === 0) {
    coverageScore = 0;
  } else if (evidenceCount >= 11) {
    coverageScore = 6;
  } else if (evidenceCount >= 6) {
    coverageScore = 5;
  } else if (evidenceCount >= 3) {
    coverageScore = 4;
  } else if (evidenceCount >= 1) {
    coverageScore = 2;
  } else {
    coverageScore = 0;
  }

  // Recency score (0-2) based on newest evidence age
  let recencyScore = 0;
  if (newestEvidenceAt) {
    const newestDate = new Date(newestEvidenceAt);
    const now = new Date();
    const daysAgo = Math.floor((now.getTime() - newestDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysAgo <= 30) {
      recencyScore = 2;
    } else if (daysAgo <= 90) {
      recencyScore = 1;
    } else {
      recencyScore = 0;
    }
  }
  // If dates missing but citations exist, recencyScore stays 0

  // Diversity score (0-2) based on unique source types count
  let diversityScore: number;
  const uniqueSourceTypes = sourceTypes.length;
  if (uniqueSourceTypes >= 3) {
    diversityScore = 2;
  } else if (uniqueSourceTypes === 2) {
    diversityScore = 1;
  } else {
    diversityScore = 0;
  }

  // Total score: 0-10
  const totalScore = coverageScore + recencyScore + diversityScore;
  
  // Normalize to one decimal and clamp [0,10]
  const normalizedScore = Math.max(0, Math.min(10, Math.round(totalScore * 10) / 10));

  return {
    value: normalizedScore,
    status: 'scored',
    evidenceCount,
    sourceTypes,
    newestEvidenceAt,
    oldestEvidenceAt,
  };
}

