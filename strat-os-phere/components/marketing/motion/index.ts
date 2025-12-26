/**
 * Motion Components
 * 
 * Reusable motion primitives for marketing pages.
 * All components respect prefers-reduced-motion.
 */

import type * as React from "react"
import { Reveal } from "./Reveal"
import { Stagger } from "./Stagger"
import { ArtifactSettle } from "./ArtifactSettle"

export { Reveal } from "./Reveal"
export type RevealProps = React.ComponentProps<typeof Reveal>

export { Stagger } from "./Stagger"
export type StaggerProps = React.ComponentProps<typeof Stagger>

export { HoverLift, useHoverLift } from "./HoverLift"

export { ArtifactSettle } from "./ArtifactSettle"
export type ArtifactSettleProps = React.ComponentProps<typeof ArtifactSettle>

