/**
 * Feature flags for gradual rollout of new features
 * 
 * Flags are controlled via environment variables and default to false
 * to ensure safe, opt-in behavior.
 */

export const FLAGS = {
  resultsQualityPackV1: process.env.NEXT_PUBLIC_RESULTS_QUALITY_PACK_V1 === 'true',
  resultsQualityPackV2: process.env.NEXT_PUBLIC_RESULTS_QUALITY_PACK_V2 === 'true',
  resultsQualityPackV2Server: process.env.RESULTS_QUALITY_PACK_V2_SERVER === 'true',
  evidenceOptimize: process.env.EVIDENCE_OPTIMIZE !== 'false', // Default ON (true), can be disabled with EVIDENCE_OPTIMIZE=false
} as const

export function isFlagEnabled(flag: keyof typeof FLAGS): boolean {
  return Boolean(FLAGS[flag])
}

