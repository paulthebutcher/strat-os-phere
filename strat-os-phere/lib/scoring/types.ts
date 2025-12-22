/**
 * Computed score with evidence metadata
 * Distinguishes between scored (has evidence) and unscored (missing evidence) states
 */
export type ComputedScore = {
  value: number | null; // null means N/A
  status: 'scored' | 'unscored';
  reason?: 'insufficient_evidence' | 'missing_inputs' | 'not_computed';
  evidenceCount: number;
  sourceTypes: string[];
  newestEvidenceAt?: string; // ISO
  oldestEvidenceAt?: string; // ISO
};

