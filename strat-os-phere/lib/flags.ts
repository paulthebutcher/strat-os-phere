/**
 * Feature flags for gradual rollout of new features
 * 
 * Flags are controlled via environment variables and default to false
 * to ensure safe, opt-in behavior.
 */

export const FLAGS = {
  resultsQualityPackV1: process.env.NEXT_PUBLIC_RESULTS_QUALITY_PACK_V1 === 'true',
} as const

export function isFlagEnabled(flag: keyof typeof FLAGS): boolean {
  return Boolean(FLAGS[flag])
}

