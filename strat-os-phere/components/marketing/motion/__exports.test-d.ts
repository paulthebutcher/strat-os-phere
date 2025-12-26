/**
 * Type-check file for motion component barrel exports
 * 
 * This file ensures that all types exported from the barrel (index.ts)
 * actually exist. If someone breaks a re-export, TypeScript will fail here.
 * 
 * This file is type-only and has no runtime impact.
 */

import type {
  ArtifactSettleProps,
  RevealProps,
  StaggerProps,
} from "./index"

// Type checks - if any of these are missing, TypeScript will error
export type _MotionExportsAreValid = {
  ArtifactSettleProps: ArtifactSettleProps
  RevealProps: RevealProps
  StaggerProps: StaggerProps
}

