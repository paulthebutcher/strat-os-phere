/**
 * Type-check file for motion component barrel exports
 * 
 * This file ensures that all types exported from the barrel (index.ts)
 * actually exist. If someone breaks a re-export, TypeScript will fail here.
 * 
 * This file is type-only and has no runtime impact.
 */

import type {
  RevealProps,
  StaggerProps,
  ArtifactSettleProps,
} from "./index"

// Type checks - if any of these are missing, TypeScript will error
export type _CheckRevealProps = RevealProps
export type _CheckStaggerProps = StaggerProps
export type _CheckArtifactSettleProps = ArtifactSettleProps

