/**
 * Feature flags for gradual rollout of new features
 * 
 * Flags are controlled via environment variables and default to false
 * to ensure safe, opt-in behavior.
 * 
 * Note: Analysis generation progress UI and Evidence Ledger visibility
 * are no longer gated by flags - they are always enabled.
 */

export const FLAGS = {
  resultsQualityPackV1: process.env.NEXT_PUBLIC_RESULTS_QUALITY_PACK_V1 === 'true',
  resultsQualityPackV2: process.env.NEXT_PUBLIC_RESULTS_QUALITY_PACK_V2 === 'true',
  resultsQualityPackV2Server: process.env.RESULTS_QUALITY_PACK_V2_SERVER === 'true',
  evidenceOptimize: process.env.EVIDENCE_OPTIMIZE !== 'false', // Default ON (true), can be disabled with EVIDENCE_OPTIMIZE=false
  evidencePacksEnabled: process.env.EVIDENCE_PACKS_ENABLED === '1',
  claimsEnabled: process.env.CLAIMS_ENABLED === 'true',
  followupEnabled: process.env.FOLLOWUP_ENABLED === 'true',
  evidenceTrustLayerEnabled: 
    process.env.NODE_ENV === 'development' || 
    process.env.VERCEL_ENV === 'preview' ||
    process.env.EVIDENCE_TRUST_LAYER_ENABLED === 'true',
} as const

export function isFlagEnabled(flag: keyof typeof FLAGS): boolean {
  return Boolean(FLAGS[flag])
}

// Dev-only log to confirm drift-related flags are no longer used
if (process.env.NODE_ENV === 'development') {
  console.log('[flags] Drift-related flags removed: analysis generation progress UI and evidence ledger visibility are always enabled')
}

